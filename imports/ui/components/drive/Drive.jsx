import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { DRIVE } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import DropdownSelect from '../extras/DropdownSelect';
import DriveList from './DriveList';
import '../extras/MediaUploader.js';

class Drive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            uploadProgress: 0,
            files: [],
            q: 'trashed=false',
            fields: 'nextPageToken, files',
            pageToken: '',
            pageSize: 2,
            display: [DRIVE.ALL, DRIVE.DOCUMENTS, DRIVE.PDF, DRIVE.SHEETS, DRIVE.FILES, DRIVE.AUDIO, DRIVE.IMAGES, DRIVE.VIDEOS],
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
            search: ''
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.getQuery = this.getQuery.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.viewMore = this.viewMore.bind(this);
    }
    componentDidMount() {
        this.getToken();
        this.getFiles();
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
        let options = {
            q: this.state.q,
            fields: this.state.fields,
            pageToken: changeFilter ? '' : this.state.pageToken,
            pageSize: this.state.pageSize,
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
        let mime = mimetypes.length ? " and (" + mimetypes.join(" or ") + ")" : '';
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
                    'Content-Length': file.size,
                    'name': name
                };
                let uploader = new MediaUploader({
                    file: file,
                    token: self.state.token,
                    metadata: metadata,
                    onError: function (response) {
                        Bert.alert(response, 'danger', 'growl-top-right');
                        self.setState({ uploadProgress: 0, uploading: false });
                    },
                    onComplete: function (response) {
                        response = JSON.parse(response);
                        self.props.Drive.insertPermission(response, (err) => {
                            if (err)
                                Bert.alert(err.reason, 'danger', 'growl-top-right');
                            else {
                                Bert.alert('File is successfully uploaded.', 'success', 'growl-top-right');
                                self.getFiles();
                            }
                            self.setState({ uploadProgress: 0, uploading: false });
                        });
                    },
                    onProgress: function (event) {
                        self.setState({ uploadProgress: (event.loaded / event.total * 100) });
                    },
                    params: {
                        convert: false,
                        ocr: false
                    }
                });
                uploader.upload();
            };
            reader.readAsArrayBuffer(e.currentTarget.files[0]);
        }
    }

    render() {
        return (
            <div id="drive" className="pull-left">
                <div className="container bg-secondary">
                    <div className="row pl-2 pr-2">
                        <div className="col-sm-4 pt-3">
                            <div className="row">
                                <DropdownSelect name='dselect2' options={this.state.displayOptions} value={this.state.display}
                                    onChange={this.changeDisplay}
                                    className='col-sm-6 p-0 no-highlight' />
                                <div className="input-group col-sm-6">
                                    <input type="text" className="form-control" name="search" placeholder="Search for..." value={this.state.search} onChange={this.handleChangeInput} />
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
                                            <span className="drive-upload-percentage">Uploading File {this.state.uploadProgress}%</span>
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
                                <DriveList files={this.state.files} user={this.props.user} Drive={this.props.Drive} getFiles={this.getFiles} />
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

    return {

    };

})(Drive);
