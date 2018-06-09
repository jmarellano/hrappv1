import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { DRIVE, ROUTES } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import DropdownSelect from '../extras/DropdownSelect';
import DriveList from './DriveList';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';
import ReactTooltip from 'react-tooltip';
import TeamDrive from '../../../api/classes/TeamDrive';

class Drive extends React.Component {
    constructor(props) {
        super(props);
        let display = [
            DRIVE.ALL,
            DRIVE.DOCUMENTS,
            DRIVE.PDF,
            DRIVE.SHEETS,
            DRIVE.FILES,
            DRIVE.AUDIO,
            DRIVE.IMAGES,
            DRIVE.VIDEOS
        ];
        this.state = {
            parent: ['1j3VEEcer_y9BEHTGPmlYmNFD-2pjNJVn'],
            parentName: ['root'],
            uploading: false,
            uploadProgress: 0,
            files: [],
            q: `trashed=false and '1j3VEEcer_y9BEHTGPmlYmNFD-2pjNJVn' in parents`,
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
            sortOrder: 0,
            signin: !props.user.google,
            sync: false,
            creatingFolder: false,
            selectedFile: null,
            pasting: false
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.getQuery = this.getQuery.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.viewMore = this.viewMore.bind(this);
        this.browse = this.browse.bind(this);
        this.toggleSortOrderBy = this.toggleSortOrderBy.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.goBack = this.goBack.bind(this);
        this.back = this.back.bind(this);
        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.newFolder = this.newFolder.bind(this);
        this.selectFile = this.selectFile.bind(this);
        this.paste = this.paste.bind(this);
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '150px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }
    componentDidMount() {
        TeamDrive.init(() => {
            TeamDrive.auth.isSignedIn.listen(this.updateSigninStatus);
            this.updateSigninStatus(TeamDrive.auth.isSignedIn.get());
        });
    }
    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            this.setState({ signin: false });
            TeamDrive.setEmail(this.props.user, this.props.Drive);
            let intervalCheck = () => {
                this.setState({ processing: true });
                TeamDrive.setDrive(this.props.Drive, (err, res) => {
                    if (res) {
                        this.sync();
                        setTimeout(() => {
                            this.getFiles();
                        }, 1000);
                    } else
                        intervalCheck();
                });
            }
            intervalCheck();
        } else
            this.setState({ signin: true });
    }
    newFolder() {
        this.setState({ creatingFolder: true });
        let oldFiles = this.state.files;
        TeamDrive.newFolder(this.state.parent, () => {
            let intervalCheck = () => {
                this.getFiles(null, true, (files) => {
                    if (files.length !== oldFiles.length)
                        this.setState({ creatingFolder: false });
                    else
                        intervalCheck();
                });
            };
            intervalCheck();
        });
    }
    viewMore() {
        this.getFiles();
    }
    getFiles(e, changeFilter, callback) {
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
        let reqOptions = {
            'method': 'GET',
            'path': '/drive/v3/files',
            'params': options
        };
        let request = window.gapi.client.request(reqOptions);
        request.execute((response) => {
            let files = fileList.concat(response.files);
            if (this.state)
                this.setState({ files, pageToken: request.nextPageToken || '' });
            this.setState({ processing: false });
            if (callback)
                callback(files);
        });
    }

    changeDisplay(display) {
        this.setState({ display }, () => {
            this.getQuery();
        });
    }

    selectFile(file) {
        this.setState({ selectedFile: file });
    }

    paste() {
        this.setState({ pasting: true });
        let file = this.state.selectedFile,
            parent = this.state.parent;
        TeamDrive.paste(file, parent, () => {
            this.setState({ selectedFile: null, pasting: false });
            this.getFiles(null, true);
        });
    }

    getQuery() {
        let q = [];
        let mimetypes = ["mimeType contains 'application/vnd.google-apps.folder'"];
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
        q.push(`'${this.state.parent[this.state.parent.length - 1]}' in parents`);
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
                    'Content-Type': file.type,
                    'Content-Length': file.size,
                    'name': name,
                    'parents': [self.props.user.drive] // TODO
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

    browse(id, name) {
        let parent = this.state.parent;
        let parentName = this.state.parentName;
        parent.push(id);
        parentName.push(name);
        this.setState({ parent, parentName }, () => {
            this.getQuery();
        });
    }

    back(index = null) {
        let parent = this.state.parent;
        let parentName = this.state.parentName;
        if (index > -1) {
            parent.length = index + 1;
            parentName.length = index + 1;
        } else {
            parent.pop();
            parentName.pop();
        }
        this.setState({ parent, parentName }, () => {
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

    signIn() {
        TeamDrive.auth.signIn();
    }

    signOut(callback) {
        TeamDrive.auth.signOut();
        callback();
    }

    goBack() {
        this.props.history.replace(ROUTES.MESSAGES);
    }

    sync() {
        this.setState({ sync: true });
        TeamDrive.sync(() => {
            this.setState({ sync: false });
        });
    }

    renderCrumbs() {
        return this.state.parentName.map((item, index) => {
            if (this.state.parentName.length === index + 1)
                return <li className="breadcrumb-item active" aria-current="page" key={index}>{item}</li>;
            return <li className="breadcrumb-item" key={index}><a href="#" onClick={this.back.bind(this, index)}>{item}</a></li>;
        });
    }

    render() {
        return (
            <div id="drive" className="pull-left">
                {
                    !this.state.signin &&
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
                                    {!this.state.uploading && this.state.sync &&
                                        < li className="mr-2 mt-3 p-0">
                                            <i className="fa fa-spin fa-circle-o-notch" /> Syncing...
                                        </li>
                                    }
                                    {!this.state.uploading && this.state.selectedFile &&
                                        <li className="mr-2 mt-1">
                                            {
                                                this.state.pasting ?
                                                    <a href="#" className="btn-file nav-link" data-tip="Paste">
                                                        <i className="fa fa-spin fa-spinner" aria-hidden="true" />
                                                    </a> :
                                                    <a href="#" className="btn-file nav-link" data-tip="Paste" onClick={this.paste}>
                                                        <i className="fa fa-2x fa-paste" aria-hidden="true" />
                                                    </a>
                                            }
                                            <ReactTooltip />
                                        </li>
                                    }
                                    {!this.state.uploading &&
                                        <li className="mr-2 mt-1">
                                            {
                                                this.state.creatingFolder ?
                                                    <a href="#" className="btn-file nav-link" data-tip="Create New folder">
                                                        <i className="fa fa-spin fa-spinner" aria-hidden="true" />
                                                    </a> :
                                                    <a href="#" className="btn-file nav-link" data-tip="Create New folder" onClick={this.newFolder}>
                                                        <i className="fa fa-2x fa-folder" aria-hidden="true" />
                                                    </a>
                                            }
                                            <ReactTooltip />
                                        </li>
                                    }
                                    {!this.state.uploading &&
                                        <li className="mr-2 mt-1">
                                            <label className="btn-file nav-link" data-tip="Upload File">
                                                <i className="fa fa-2x fa-cloud-upload" aria-hidden="true" />
                                                <input id="my-file-selector"
                                                    type="file"
                                                    onChange={this.handleUpload.bind(this)} />
                                            </label>
                                            <ReactTooltip />
                                        </li>
                                    }
                                    {this.state.uploading &&
                                        <li className="mr-2 mt-3">
                                            <label>
                                                <span className="drive-upload-percentage">
                                                    Uploading File... {this.state.uploadProgress.toFixed(2)}%
                                                </span>
                                            </label>
                                            <ReactTooltip />
                                        </li>
                                    }
                                    {this.state.uploading &&
                                        <li className="mr-2 mt-3">
                                            <div className="progress">
                                                <div className="progress-bar" style={{ width: this.state.uploadProgress + "%" }}></div>
                                            </div>
                                            <ReactTooltip />
                                        </li>
                                    }
                                    {!this.state.uploading &&
                                        <li className="mr-2 mt-2 ml-3">
                                            <Button className="btn btn-danger" onClick={this.signOut}><i className="fa fa-google" /> Logout</Button>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                }
                {
                    !this.state.signin &&
                    <div className="mt-2 mb-2 p-0 container">
                        <div className="row pl-3 pr-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    {this.renderCrumbs()}
                                </ol>
                            </nav>
                        </div>
                    </div>
                }
                {
                    !this.state.signin &&
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
                                        back={this.back}
                                        parent={this.state.parent}
                                        toggleSortOrderBy={this.toggleSortOrderBy}
                                        sortOrder={this.state.sortOrder}
                                        sortOrderBy={this.state.sortOrderBy}
                                        selectFile={this.selectFile}
                                        selectedFile={this.state.selectedFile}
                                    />
                                    {this.state.pageToken && <button className="btn btn-default" onClick={this.viewMore}>View More</button>}
                                </div>
                        }
                    </div>
                }
                <Modal isOpen={this.state.signin} contentLabel="SignInModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Sign In
                            </div>
                        </div>
                        <div className="panel-body p-2 text-center">
                            <button type="button" className="btn btn-success form-control mb-2" onClick={this.signIn}>
                                <i className="fa fa-google" /> Sign in with Google
                            </button>
                            <button type="button" className="btn btn-primary form-control" onClick={this.goBack}>
                                <i className="fa fa-arrow-left"></i> Go Home
                            </button>
                        </div>
                    </div>
                </Modal>
                <ReactTooltip />
            </div>
        );
    }
}

Drive.propTypes = {
    Drive: PropTypes.object,
    user: PropTypes.object,
    history: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Drive);
