import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';

class PST extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pst: false,
            uploading: false,
            uploadProgress: 0,
            token: null,
            signin: !props.user.google
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
                maxHeight: '300px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.picker = this.picker.bind(this);
        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
    }

    componentDidMount() {
        if (this.props.PST.pst_uploading) {
            this.props.PST.setOnProgress(this.updateProgress);
            this.setState({ uploading: true, uploadProgress: this.props.PST.pst_uploading });
        }
        let drive = this.props.Drive;
        drive.init(() => {
            drive.auth.isSignedIn.listen(this.updateSigninStatus);
            this.updateSigninStatus(drive.auth.isSignedIn.get());
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.importing && !this.props.user.importing) {
            console.log('test notify');
            Bert.alert('Messages imported using PST file!', 'success', 'growl-top-right');
        }
    }

    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            this.setState({ signin: false });
            this.getToken();
        } else
            this.setState({ signin: true });
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
            this.props.PST.initiateUpload({
                file,
                onStart: () => {
                    this.setState({ uploading: true });
                },
                onUploaded: (err, fileRef) => {
                    if (err)
                        Bert.alert(err.reason || 'PST file uploading failed!', 'danger', 'growl-top-right');
                    else {
                        Bert.alert('PST file uploaded! Importing started...', 'success', 'growl-top-right');
                        this.import(`${fileRef._storagePath}${fileRef._id}${fileRef.extensionWithDot}`);
                    }
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
                onProgress: this.updateProgress
            });
        }
    }

    updateProgress(progress) {
        this.setState({ uploadProgress: progress });
    }

    signIn() {
        this.props.Drive.auth.signIn();
    }

    signOut() {
        this.props.Drive.auth.signOut();
    }

    picker() {
        this.toggleModal();
        this.props.Drive.createPicker(this.state.token, (err) => {
            Bert.alert(err, 'danger', 'growl-top-right');
        }, (message) => {
            Bert.alert(message, 'success', 'growl-top-right');
        });
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
                            {!this.state.uploading && !this.props.user.importing &&
                                <div className="form-group">
                                    <label htmlFor="exampleInputFile">Using File Upload</label>
                                    <input
                                        type="file"
                                        className="form-control-file"
                                        id="exampleInputFile"
                                        aria-describedby="fileHelp"
                                        onChange={this.handleUpload.bind(this)}
                                        disabled={this.props.user.importing}
                                    />
                                    <hr />
                                    <label htmlFor="exampleInputFile">Using Google Drive</label>
                                    {
                                        this.state.signin &&
                                        <button type="button" className="btn btn-success form-control mb-2" onClick={this.signIn}>
                                            <i className="fa fa-google" /> Sign in with Google
                                        </button>
                                    }
                                    {
                                        !this.state.signin &&
                                        <button type="button" className="btn btn-success form-control mb-2" onClick={this.picker}>
                                            Browse file
                                        </button>
                                    }
                                    {
                                        !this.state.signin &&
                                        <button type="button" className="btn form-control mb-2" onClick={this.signOut}>
                                            <i className="fa fa-google" /> Logout
                                        </button>
                                    }
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
                            {this.props.user.importing === 1 &&
                                <div className="text-center">
                                    Currently Importing PST. Please wait... <br />
                                    <i className="fa fa-spinner fa-3x fa-spin" />
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
    Drive: PropTypes.object,
    Message: PropTypes.object,
    user: PropTypes.object,
    PST: PropTypes.object
};

export default withTracker(() => {
    return {};
})(PST);