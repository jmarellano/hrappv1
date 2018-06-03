import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { DRIVE, ROLES } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import DropdownSelect from '../extras/DropdownSelect';
import DriveList from './DriveList';

class Drive extends React.Component {
    constructor(props) {
        super(props);
        let q = props.user.role === ROLES.ADMIN || props.user.role === ROLES.SUPERUSER ?
            `trashed=false and mimeType = 'application/vnd.google-apps.folder'` :
            `trashed=false and '${props.user.drive}' in parents`;
        let display = [DRIVE.ALL, DRIVE.DOCUMENTS, DRIVE.PDF, DRIVE.SHEETS, DRIVE.FILES, DRIVE.AUDIO, DRIVE.IMAGES, DRIVE.VIDEOS];
        this.state = {
            parent: props.user.role === ROLES.ADMIN || props.user.role === ROLES.SUPERUSER ? 'root' : props.user.drive,
            uploading: false,
            uploadProgress: 0,
            files: [],
            q,
            fields: 'nextPageToken, files',
            pageToken: '',
            pageSize: 20,
            display,
            displayOptions: [
                {
                    label: 'All', value: DRIVE.ALL, options: [
                        { value: DRIVE.DOCUMENTS, label: 'Documents' },
                        { value: DRIVE.PDF, label: 'PDFs' },
                        { value: DRIVE.SHEETS, label: 'Sheets' },
                        { value: DRIVE.FILES, label: 'Files' },
                        { value: DRIVE.AUDIO, label: 'Audio' },
                        { value: DRIVE.IMAGES, label: 'Images' },
                        { value: DRIVE.VIDEOS, label: 'VIDEOS' },
                        { value: DRIVE.TRASHED, label: 'Trashed' }
                    ]
                }
            ],
            token: null,
            search: '',
            sortOrderBy: 0,
            sortOrder: 0
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.getQuery = this.getQuery.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.viewMore = this.viewMore.bind(this);
        this.browse = this.browse.bind(this);
        this.toggleSortOrderBy = this.toggleSortOrderBy.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
    }
    componentDidMount() {
        this.getToken();
        this.getFiles();
        if (this.props.Drive.drive_uploading) {
            this.props.Drive.setOnProgress(this.updateProgress);
            this.setState({ uploading: true, uploadProgress: this.props.Drive.drive_uploading });
        }
    }
    viewMore() {
        this.getFiles();
    }
    getToken() {
        this.setState({ processing: true });
        this.props.Drive.getToken((err, token) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                this.setState({ token: token.access_token });
            this.setState({ processing: false });
        })
    }
    getFiles(e, changeFilter) {
        if (e)
            e.preventDefault();
        this.setState({ processing: true });
        let sortOrder = '',
            sortOrderBy = '';
        switch (this.state.sortOrderBy) {
            case 0:
                sortOrderBy = 'name';
                break;
            case 1:
                sortOrderBy = 'modifiedTime';
                break;
            case 2:
                sortOrderBy = 'quotaBytesUsed';
                break;
        }
        if (this.state.sortOrder)
            sortOrder = ' desc';
        let options = {
            q: this.state.q,
            fields: this.state.fields,
            pageToken: changeFilter ? '' : this.state.pageToken,
            pageSize: this.state.pageSize,
            orderBy: sortOrderBy + sortOrder
        };
        let fileList = this.state.files;
        if (changeFilter)
            fileList = [];
        this.props.Drive.getFiles(options, (err, data) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                this.setState({ files: err ? data.files : fileList.concat(data.files), pageToken: data.pageToken || '' });
            this.setState({ processing: false });
        })
    }

    changeDisplay(display) {
        this.setState({ display }, () => {
            this.getQuery();
        });
    }

    getQuery() {
        let q = [];
        let mimetypes = [];
        let display = this.state.display;
        if (display.indexOf(DRIVE.DOCUMENTS) > -1)
            mimetypes.push("mimeType contains 'document'");
        if (display.indexOf(DRIVE.FILES) > -1) {
            mimetypes.push("mimeType contains 'stream'");
            mimetypes.push("mimeType contains 'file'");
            mimetypes.push("mimeType contains 'unknown'");
            mimetypes.push("mimeType contains 'text'");
            mimetypes.push("mimeType contains 'xml'");
            mimetypes.push("mimeType contains 'html'");
        }
        if (display.indexOf(DRIVE.AUDIO) > -1)
            mimetypes.push("mimeType contains 'audio'");
        if (display.indexOf(DRIVE.IMAGES) > -1)
            mimetypes.push("mimeType contains 'image'");
        if (display.indexOf(DRIVE.VIDEOS) > -1)
            mimetypes.push("mimeType contains 'video'");
        if (display.indexOf(DRIVE.SHEETS) > -1)
            mimetypes.push("mimeType contains 'spreadsheet'");
        if (display.indexOf(DRIVE.PDF) > -1)
            mimetypes.push("mimeType contains 'pdf'");
        if (display.indexOf(DRIVE.TRASHED) > -1)
            q.push("trashed=true");
        else
            q.push("trashed=false");
        q.push(`'${this.state.parent}' in parents`);
        let mime = mimetypes.length ? " and (" + mimetypes.join(" or ") + ")" : '';
        if (this.state.parent === 'root')
            mime = " and mimeType = 'application/vnd.google-apps.folder'";
        let search = this.state.search.length ? " and name contains '" + this.state.search.trim() + "'" : '';
        q = q.join(" and ") + mime + search;
        this.setState({ q }, () => {
            this.getFiles(null, true);
        });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    handleUpload(e) {
        let self = this,
            reader = new FileReader();
        self.setState({ uploading: true });
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            let file = e.currentTarget.files[0];
            reader.onload = function () {
                let name = file.name;
                let metadata = {
                    'Content-Type': file.type,
                    'Content-Length': file.size,
                    'name': name,
                    'parents': [self.props.user.drive]
                };
                self.props.Drive.initiateUpload({
                    file: file,
                    token: self.state.token,
                    metadata: metadata,
                    onError: function (response) {
                        Bert.alert(response, 'danger', 'growl-top-right');
                        self.setState({ uploadProgress: 0, uploading: false });
                    },
                    onProgress: self.updateProgress,
                    onComplete: function (response) {
                        response = JSON.parse(response);
                        self.props.Drive.insertPermission(response, (err) => {
                            if (err)
                                Bert.alert(err.reason, 'danger', 'growl-top-right');
                            else {
                                Bert.alert('File is successfully uploaded.', 'success', 'growl-top-right');
                                self.getQuery();
                            }
                            self.setState({ uploadProgress: 0, uploading: false });
                        });
                    },
                    params: {
                        convert: false,
                        ocr: false
                    }
                });
            };
            reader.readAsText(e.currentTarget.files[0]);
        }
    }

    browse(id) {
        this.setState({ parent: id }, () => {
            this.getQuery();
        });
    }

    toggleSortOrderBy(val) {
        this.setState({ sortOrderBy: val, sortOrder: !this.state.sortOrder ? 1 : 0 }, () => {
            this.getFiles(null, true);
        });
    }

    updateProgress(progress) {
        this.setState({ uploadProgress: progress });
    }

    render() {
        return (
            <div id="drive" className="pull-left">
                <div className="container bg-secondary">
                    <div className="row pl-2 pr-2">
                        <div className="col-sm-4 pt-3">
                            <div className="row mb-2">
                                <DropdownSelect name='dselect2' options={this.state.displayOptions} value={this.state.display}
                                    onChange={this.changeDisplay}
                                    className='col-sm-6 p-0 no-highlight' />
                                <div className="input-group col-sm-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="search"
                                        placeholder="Search for..."
                                        value={this.state.search}
                                        onChange={this.handleChangeInput}
                                    />
                                    <span className="input-group-btn">
                                        <button className="btn btn-primary" type="button" onClick={this.getQuery}>
                                            <i className="fa fa-search" />
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-8 pull-right">
                            <ul className="nav pt-2 text-light">
                                {!this.state.uploading &&
                                    <li className="mr-2">
                                        <label className="btn-file nav-link" data-tip="Upload File">
                                            <i className="fa fa-2x fa-cloud-upload" aria-hidden="true" />
                                            <input id="my-file-selector"
                                                type="file"
                                                onChange={this.handleUpload.bind(this)} />
                                        </label>
                                    </li>
                                }
                                {this.state.uploading &&
                                    <li className="mr-2 mt-3">
                                        <label>
                                            <span className="drive-upload-percentage">
                                                Uploading File... {this.state.uploadProgress.toFixed(2)}%
                                            </span>
                                        </label>
                                    </li>
                                }
                                {this.state.uploading &&
                                    <li className="mr-2 mt-3">
                                        <div className="progress">
                                            <div className="progress-bar" style={{ width: this.state.uploadProgress + "%" }}></div>
                                        </div>
                                    </li>
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-2 mb-2 p-0 container">
                    {
                        this.state.processing ?
                            <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div> :
                            <div>
                                <DriveList
                                    files={this.state.files}
                                    user={this.props.user}
                                    Drive={this.props.Drive}
                                    getFiles={this.getFiles}
                                    browse={this.browse}
                                    parent={this.state.parent}
                                    toggleSortOrderBy={this.toggleSortOrderBy}
                                    sortOrder={this.state.sortOrder}
                                    sortOrderBy={this.state.sortOrderBy}
                                />
                                {this.state.pageToken && <button className="btn btn-default" onClick={this.viewMore}>View More</button>}
                            </div>
                    }
                </div>
            </div>
        );
    }
}

Drive.propTypes = {
    Drive: PropTypes.object,
    user: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Drive);
