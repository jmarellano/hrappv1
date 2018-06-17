import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Util from '../../../api/classes/Utilities';
import Modal from '../extras/Modal/components/Modal';
import ItemEllipsis from '../extras/ItemEllipsis';

class DriveList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            preview: false,
            share: false,
            trash: false,
            rename: false,
            file: null,
            email: '',
            role: 'writer',
            name: '',
            processing: false
        };
        this.onClose = this.onClose.bind(this);
        this.trash = this.trash.bind(this);
        this.remove = this.remove.bind(this);
        this.sharing = this.sharing.bind(this);
        this.renaming = this.renaming.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '345px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.styleSetSmall = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '190px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }
    handleInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }
    preview(file) {
        this.setState({ preview: true, file });
    }
    rename(file) {
        this.setState({ rename: true, file, name: file.name });
    }
    share(file) {
        this.setState({ share: true, file });
    }
    sharing(e) {
        e.preventDefault();
        this.setState({ processing: true });
        let reqOptions = {
            'method': 'POST',
            'path': '/drive/v3/files/' + this.state.file.id + '/permissions',
            'params': {
                'fileId': this.state.file.id,
                'sendNotificationEmails': false
            },
            'body': {
                'role': this.state.role,
                'type': 'user',
                'emailAddress': this.state.email
            }
        };
        let request = window.gapi.client.request(reqOptions);
        request.execute(() => {
            this.setState({ processing: false, share: false });
            Bert.alert('File successfuly shared!', 'success', 'growl-top-right');
            this.props.getFiles(null, true);
        });
    }
    renaming(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Drive.rename({ name: this.state.name, fileId: this.state.file.id }, (err) => {
            console.log(err);
            this.setState({ processing: false, rename: false });
            this.props.getFiles(null, true);
        });
    }
    trash(file) {
        this.setState({ trash: true }, () => {
            this.setState({
                file
            });
        });
    }
    onClose() {
        this.setState({
            preview: false,
            share: false,
            trash: false,
            rename: false
        });
    }
    undoTrash(file) {
        this.setState({
            file
        }, () => {
            this.remove(null, true);
        });
    }
    remove(callback, undo = false) {
        this.props.Drive.removeFile({ id: this.state.file.id }, undo, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('File removed', 'success', 'growl-top-right');
            if (callback)
                callback();
            this.setState({ trash: false });
            this.props.getFiles(false, true);
        });
    }
    browse(id, name) {
        this.props.browse(id, name);
    }
    toggleSortOrderBy(val) {
        this.props.toggleSortOrderBy(val);
    }
    selectFile(file) {
        this.props.selectFile(file);
    }
    renderFiles() {
        return this.props.files.map((file, index) => {
            if (!file)
                return null;
            if (file.mimeType === 'application/vnd.google-apps.folder')
                return (
                    <tr key={index}>
                        <td><img src={file.iconLink} /></td>
                        <th scope="row">{file.name}</th>
                        <td>{file.trashed ? 'Yes' : ''}</td>
                        <td>{file.modifiedTime ? Util.formatDate(file.modifiedTime) : '-'}</td>
                        <td>N/A</td>
                        <td>
                            {
                                !file.trashed &&
                                <button
                                    className='btn btn-sm m-1 btn-danger'
                                    onClick={this.trash.bind(this, file)}>
                                    <i className="fa fa-trash" /> Trash
                                </button>
                            }
                            {
                                file.trashed &&
                                <Button
                                    className='btn btn-sm m-1 btn-danger'
                                    data={file}
                                    onClick={this.undoTrash.bind(this, file, true)}>
                                    <i className="fa fa-undo" /> Undo Trash
                                </Button>
                            }
                            <button className={`btn btn-sm m-1 ${file.trashed ? 'btn-secondary disabled' : 'btn-success'}`} onClick={file.trashed ? null : this.browse.bind(this, file.id, file.name)}>
                                <i className="fa fa-folder-open" /> Browse
                            </button>
                            <ItemEllipsis index={index}>
                                <a href="#" className='btn btn-sm m-1 btn-primary' onClick={this.rename.bind(this, file)}>
                                    <i className="fa fa-pencil" /> Rename
                                </a>
                                <button
                                    disabled={!file.capabilities.canShare}
                                    className={`btn btn-sm m-1 ${!file.capabilities.canShare ? 'btn-secondary disabled' : 'btn-info'}`}
                                    onClick={this.share.bind(this, file)}>
                                    <i className="fa fa-user-plus" /> Share
                                </button>
                            </ItemEllipsis>
                        </td>
                    </tr>
                );
            return (
                <tr key={index}>
                    <td><img src={file.iconLink} /></td>
                    <th scope="row">{file.name}</th>
                    <td>{file.trashed ? 'Yes' : ''}</td>
                    <td>{file.modifiedTime ? Util.formatDate(file.modifiedTime) : '-'}</td>
                    <td>{file.size ? Util.bytesToSize(file.size) : 'N/A'}</td>
                    <td>
                        {
                            !file.trashed &&
                            <button
                                className='btn btn-sm m-1 btn-danger'
                                onClick={this.trash.bind(this, file)}>
                                <i className="fa fa-trash" /> Trash
                                </button>
                        }
                        {
                            file.trashed &&
                            <Button
                                disabled={!file.capabilities.canDelete}
                                className={`btn btn-sm m-1 ${!file.capabilities.canDelete ? 'btn-secondary disabled' : 'btn-danger'}`}
                                data={file}
                                onClick={this.undoTrash.bind(this, file, true)}>
                                <i className="fa fa-undo" /> Undo Trash
                            </Button>
                        }
                        <button
                            disabled={!file.hasThumbnail}
                            className={`btn btn-sm m-1 ${!file.hasThumbnail ? 'btn-secondary disabled' : 'btn-success'}`}
                            onClick={this.preview.bind(this, file)}>
                            <i className="fa fa-eye" /> Preview
                        </button>
                        <a href={file.webContentLink} target="_blank" className={`btn btn-sm m-1 ${!file.webContentLink ? 'btn-secondary disabled' : 'btn-primary'}`}>
                            <i className="fa fa-arrow-circle-down" /> Download
                        </a>
                        <ItemEllipsis index={index}>
                            <a href={file.webViewLink} target="_blank" className={`btn btn-sm m-1 ${!file.webViewLink ? 'btn-secondary disabled' : 'btn-primary'}`}>
                                <i className="fa fa-pencil" /> Edit
                            </a>
                            <a href="#" className='btn btn-sm m-1 btn-primary' onClick={this.rename.bind(this, file)}>
                                <i className="fa fa-pencil" /> Rename
                            </a>
                            {
                                this.props.selectedFile === file ?
                                    <a href="#" className={`btn btn-sm m-1 btn-secondary`}>
                                        <i className="fa fa-check" /> Copied
                                </a> :
                                    <a href="#" className={`btn btn-sm m-1 btn-primary`} onClick={this.selectFile.bind(this, file)}>
                                        <i className="fa fa-copy" /> Copy
                                </a>
                            }
                            <button
                                disabled={!file.capabilities.canShare}
                                className={`btn btn-sm m-1 ${!file.capabilities.canShare ? 'btn-secondary disabled' : 'btn-info'}`}
                                onClick={this.share.bind(this, file)}>
                                <i className="fa fa-user-plus" /> Share
                            </button>
                        </ItemEllipsis>
                    </td>
                </tr>
            );
        });
    }
    render() {
        return (
            <div>
                <table id="drive-list" className="table">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                {
                                    this.props.parent.length > 1 &&
                                    <button className="btn btn-sm btn-success" onClick={this.props.back}>Back</button>
                                }
                            </th>
                            <th scope="col sort" onClick={this.toggleSortOrderBy.bind(this, 0)}>
                                Name <i className={this.props.sortOrderBy === 0 ? `fa fa-sort${this.props.sortOrder === 0 ? '-up' : '-down'} text-primary` : `fa fa-sort text-secondary`} />
                            </th>
                            <th scope="col">Trashed</th>
                            <th scope="col sort" onClick={this.toggleSortOrderBy.bind(this, 1)}>
                                Last Modified <i className={this.props.sortOrderBy === 1 ? `fa fa-sort${this.props.sortOrder === 0 ? '-up' : '-down'} text-primary` : `fa fa-sort text-secondary`} />
                            </th>
                            <th scope="col sort" onClick={this.toggleSortOrderBy.bind(this, 2)}>
                                File size <i className={this.props.sortOrderBy === 2 ? `fa fa-sort${this.props.sortOrder === 0 ? '-up' : '-down'} text-primary` : `fa fa-sort text-secondary`} />
                            </th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderFiles()}
                    </tbody>
                </table>
                <Modal isOpen={this.state.preview} contentLabel="PreviewModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Preview
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.onClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>

                            </div>
                        </div>
                        <div className="panel-body p-2 text-center">
                            {this.state.file && this.state.file.hasThumbnail && <img src={this.state.file.thumbnailLink.replace('s220', 's280')} />}
                        </div>
                    </div>
                </Modal>
                <Modal isOpen={this.state.share} contentLabel="ShareModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Share
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.onClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>

                            </div>
                        </div>
                        <form className="panel-body p-2" onSubmit={this.sharing}>
                            Email Address:
                            <input type="text" value={this.state.email} name="email" onChange={this.handleInput} className="form-control mt-1 mb-2" required />
                            Role:
                            <select value={this.state.role} name="role" onChange={this.handleInput} className="form-control mt-1 mb-2" required >
                                <option value={'writer'}>Writer</option>
                                <option value={'reader'}>Reader</option>
                            </select>
                            <Button type="submit" processing={this.state.processing} className="form-control btn btn-warning mt-1 mb-2">Share</Button>
                        </form>
                    </div>
                </Modal>
                <Modal isOpen={this.state.rename} contentLabel="RenameModal" style={this.styleSetSmall}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Renaming
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.onClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <form className="panel-body p-2" onSubmit={this.renaming}>
                            New Name:
                            <input type="text" value={this.state.name} name="name" onChange={this.handleInput} className="form-control mt-1 mb-2" required />
                            <Button type="submit" processing={this.state.processing} className="form-control btn btn-warning mt-1 mb-2">Rename</Button>
                        </form>
                    </div>
                </Modal>
                <Modal isOpen={this.state.trash} contentLabel="SettingsModal" style={this.styleSetSmall}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Trash a File
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.onClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            You are going to remove a file. Continue? <br />
                            <Button className="btn btn-danger" type="button" onClick={this.remove}>Yes</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

DriveList.propTypes = {
    Drive: PropTypes.object,
    files: PropTypes.array,
    user: PropTypes.object,
    getFiles: PropTypes.func,
    browse: PropTypes.func,
    back: PropTypes.func,
    parent: PropTypes.array,
    toggleSortOrderBy: PropTypes.func,
    sortOrder: PropTypes.number,
    sortOrderBy: PropTypes.number,
    selectedFile: PropTypes.object,
    selectFile: PropTypes.func
};

export default withTracker(() => {
    return {};
})(DriveList);
