import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { ROLES, isPermitted } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Util from '../../../api/classes/Utilities';
import Modal from '../extras/Modal/components/Modal';

class DriveList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            preview: false,
            trash: false,
            file: null
        };
        this.onClose = this.onClose.bind(this);
        this.trash = this.trash.bind(this);
        this.remove = this.remove.bind(this);
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '320px',
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
                maxHeight: '160px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }
    preview(file) {
        this.setState({ preview: true }, () => {
            this.setState({
                file
            });
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
            trash: false
        });
    }
    undoTrash(file) {
        this.setState({
            file
        }, () => {
            this.props.Drive.removeFile({ id: this.state.file.id }, true, (err) => {
                if (err)
                    Bert.alert(err.reason, 'danger', 'growl-top-right');
                else
                    Bert.alert('File Undo Trashed', 'success', 'growl-top-right');
                this.props.getFiles(false, true);
            });
        });
    }
    remove(callback) {
        this.props.Drive.removeFile({ id: this.state.file.id }, false, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('File removed', 'success', 'growl-top-right');
            callback();
            this.props.getFiles(false, true);
            this.setState({ trash: false });
        });
    }
    browse(id) {
        this.props.browse(id);
    }
    renderFiles() {
        return this.props.files.map((file, index) => {
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
                                <button className={`btn btn-sm m-1 ${!isPermitted(this.props.user.role, ROLES.MANAGE_FILES) ? 'btn-secondary disabled' : 'btn-danger'}`} onClick={this.trash.bind(this, file)}>
                                    <i className="fa fa-trash" /> Trash
                            </button>
                            }
                            {
                                file.trashed &&
                                <Button className={`btn btn-sm m-1 ${!isPermitted(this.props.user.role, ROLES.MANAGE_FILES) ? 'btn-secondary disabled' : 'btn-danger'}`} data={file} onClick={this.undoTrash.bind(this, file, true)}>
                                    <i className="fa fa-undo" /> Undo Trash
                            </Button>
                            }
                            <button className={`btn btn-sm m-1 ${file.trashed ? 'btn-secondary disabled' : 'btn-success'}`} onClick={this.browse.bind(this, file.id)}>
                                <i className="fa fa-folder-open" /> Browse
                            </button>
                        </td>
                    </tr>
                );
            return (
                <tr key={index}>
                    <td><img src={file.iconLink} /></td>
                    <th scope="row">{file.name}</th>
                    <td>{file.trashed ? 'Yes' : ''}</td>
                    <td>{file.modifiedTime ? Util.formatDate(file.modifiedTime) : '-'}</td>
                    <td>{Util.bytesToSize(file.size)}</td>
                    <td>
                        {
                            !file.trashed &&
                            <button className={`btn btn-sm m-1 ${!isPermitted(this.props.user.role, ROLES.MANAGE_FILES) ? 'btn-secondary disabled' : 'btn-danger'}`} onClick={this.trash.bind(this, file)}>
                                <i className="fa fa-trash" /> Trash
                            </button>
                        }
                        {
                            file.trashed &&
                            <Button className={`btn btn-sm m-1 ${!isPermitted(this.props.user.role, ROLES.MANAGE_FILES) ? 'btn-secondary disabled' : 'btn-danger'}`} data={file} onClick={this.undoTrash.bind(this, file, true)}>
                                <i className="fa fa-undo" /> Undo Trash
                            </Button>
                        }
                        <button className={`btn btn-sm m-1 ${!file.hasThumbnail ? 'btn-secondary disabled' : 'btn-success'}`} onClick={this.preview.bind(this, file)}>
                            <i className="fa fa-eye" /> Preview
                        </button>
                        <a href={file.webContentLink} target="_blank" className={`btn btn-sm m-1 ${!file.shared ? 'btn-secondary disabled' : 'btn-primary'}`}>
                            <i className="fa fa-arrow-circle-down" /> Download
                        </a>
                    </td>
                </tr>
            );
        });
    }
    render() {
        return (
            <div>
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                {
                                    this.props.parent !== 'root' && (this.props.user.role === ROLES.ADMIN || this.props.user.role === ROLES.SUPERUSER) ?
                                        <button className="btn btn-sm btn-success" onClick={this.browse.bind(this, 'root')}>Back</button> : null
                                }
                            </th>
                            <th scope="col">Name</th>
                            <th scope="col">Trashed</th>
                            <th scope="col">Last Modified</th>
                            <th scope="col">File size</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderFiles()}
                    </tbody>
                </table>
                <Modal isOpen={this.state.preview} contentLabel="SettingsModal" style={this.styleSet}>
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
                            {this.state.file && <img src={this.state.file.thumbnailLink.replace('s220', 's280')} />}
                        </div>
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
                            <Button className="btn btn-danger" onClick={this.remove}>Yes</Button>
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
    parent: PropTypes.string
};

export default withTracker(() => {
    return {};
})(DriveList);
