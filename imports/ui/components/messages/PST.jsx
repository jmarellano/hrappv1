import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { PSTFiles } from '../../../api/files';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';

class PST extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pst: false,
            uploading: false,
            uploadProgress: 0,
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '220px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({ pst: !this.state.pst });
    }

    import(file) {
        if (!this.props.user.importing)
            this.props.Message.import(file);
    }

    handleUpload(e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            let file = e.currentTarget.files[0];
            PSTFiles.insert({
                file,
                onStart: () => {
                    this.setState({ uploading: true });
                },
                onUploaded: (err, fileRef) => {
                    if (err)
                        Bert.alert(err.reason, 'danger', 'growl-top-right');
                    else
                        Bert.alert('PST file uploaded! Importing started...', 'success', 'growl-top-right');
                    this.import(`${fileRef._storagePath}${fileRef._id}${fileRef.extensionWithDot}`);
                    this.setState({ uploading: false, pst: false });
                },
                onAbort: () => {
                    Bert.alert('Upload aborted!', 'danger', 'growl-top-right');
                    this.setState({ uploading: false, pst: false });
                },
                onError: (err) => {
                    Bert.alert(err.reason, 'danger', 'growl-top-right');
                    this.setState({ uploading: false, pst: false });
                },
                onProgress: (progress) => {
                    this.setState({ uploadProgress: progress });
                },
                onBeforeUpload: () => {
                    if (/pst/i.test(file.extension))
                        return true;
                    else {
                        return 'Invalid file type';
                    }
                }
            });
        }
    }

    render() {
        return (
            <div>
                <a className="nav-link" href="#" data-tip="Import PST" onClick={this.toggleModal} disabled={this.props.user.importing}>
                    {!this.props.user.importing ? <i className="fa fa-2x fa-upload" /> : <i className="fa fa-2x fa-spin fa-spinner" />}
                </a>
                <Modal isOpen={this.state.pst} contentLabel="SettingsModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Import PST
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {!this.state.uploading &&
                                <div className="form-group">
                                    <label htmlFor="exampleInputFile">PST FILE</label>
                                    <input
                                        type="file"
                                        className="form-control-file"
                                        id="exampleInputFile"
                                        aria-describedby="fileHelp"
                                        onChange={this.handleUpload.bind(this)}
                                        disabled={this.props.user.importing}
                                    />
                                    <small id="fileHelp" className="form-text text-muted">Upload here the PST File...</small>
                                </div>
                            }
                            {this.state.uploading &&
                                <label>
                                    <span className="drive-upload-percentage">Uploading File {this.state.uploadProgress}%</span>
                                </label>
                            }
                            {this.state.uploading &&
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: this.state.uploadProgress + "%" }}></div>
                                </div>
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

PST.propTypes = {
    Message: PropTypes.object,
    user: PropTypes.object
};

export default withTracker(() => {
    return {};
})(PST);