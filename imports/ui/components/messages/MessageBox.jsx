import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE } from '../../../api/classes/Const';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

class MessageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageModal: false,
            processing: false
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '800px',
                width: 'auto',
                height: 'auto',
                maxHeight: '500px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.setMessageBox = this.setMessageBox.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value, save: true });
        }
    }

    setMessageBox(toggle) {
        this.setState({ messageModal: toggle });
    }

    render() {
        return (
            <a className="nav-link" href="#" data-tip="create Message" onClick={this.setMessageBox.bind(this, true)}>
                <i className="fa fa-2x fa-plus" aria-hidden="true" />
                <Modal
                    isOpen={this.state.messageModal}
                    style={this.styleSet}
                    contentLabel="MessageModal"
                >
                    <form className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Create Message
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.setMessageBox.bind(this, false)}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <div className="row p-0 m-0">
                                <div className="col-md-6 mt-1">
                                    <input type="eadd" className="form-control" placeholder="Email Address" name="contact" required />
                                </div>
                                <div className="col-md-6 mt-1">
                                    <input type="text" className="form-control" placeholder="Subject" name="subject" required />
                                </div>
                            </div>
                            <div className="row p-0 m-0">
                                <div className="col-md-6 mt-1">
                                    <div className="row">
                                        <div className="col-md-6 pr-1">
                                            <input type="text" className="form-control" placeholder="BCC" name="bcc" required />
                                        </div>
                                        <div className="col-md-6 pl-1">
                                            <input type="text" className="form-control" placeholder="CC" name="cc" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-1">
                                    <select className="form-control" name="sender">
                                        <option>
                                            jmarellano0410@gmail.com
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="row p-3 m-0 mb-4">
                                <ReactQuill style={{ width: '100%', height: '220px' }} />
                            </div>
                            <div className="row p-3 m-0 mb-1">
                                <div className="col-md-2 p-0">
                                    <Button className="btn btn-success">
                                        &nbsp;Send&nbsp;
                                    </Button>
                                    <Button className="btn ml-2">
                                        <i className="fa fa-paperclip" />
                                    </Button>
                                </div>
                                <div className="col-md-2 p-0">
                                    <select name="type" className="form-control">
                                        <option value={MESSAGES_TYPE.EMAIL}>Email</option>
                                        <option value={MESSAGES_TYPE.SMS}>SMS</option>
                                        <option value={MESSAGES_TYPE.SKYPE}>Skype</option>
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    Files: &nbsp;
                                    <span className="badge badge-secondary text-light mr-1 mt-1">seomthing_name.docx <i className="fa fa-times remove" /></span>
                                    <span className="badge badge-secondary text-light mr-1 mt-1">343ss.docx <i className="fa fa-times remove" /></span>
                                    <span className="badge badge-secondary text-light mr-1 mt-1">sada234edasd.docx <i className="fa fa-times remove" /></span>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            </a>
        );
    }
}

MessageBox.propTypes = {};

export default withTracker(() => {
    return {};
})(MessageBox);