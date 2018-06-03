import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE } from '../../../api/classes/Const';
import { EmailFiles } from '../../../api/files';
import Util from '../../../api/classes/Utilities';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import TemplateMain from '../templates/TemplateMain';

class MessageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageModal: false,
            processing: false,
            type: MESSAGES_TYPE.EMAIL,
            contact: '',
            subject: '',
            bcc: '',
            cc: '',
            sender: props.user.default_email || -1,
            text: '',
            files: [],
            uploading: false,
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
        this.sendMessage = this.sendMessage.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.template = this.template.bind(this);
        this.quillRef = null;
        this.reactQuillRef = null;
    }

    componentDidMount() {
        this.attachQuillRefs();
        if (this.state.type === MESSAGES_TYPE.EMAIL)
            this.setState({ sender: this.props.user.default_email });
    }

    componentDidUpdate(prevProps, prevState) {
        this.attachQuillRefs();
        if (prevState.sender !== this.state.sender) {
            let type = MESSAGES_TYPE.EMAIL;
            try {
                type = Util.numberValidator(this.state.sender).isValid ? MESSAGES_TYPE.SMS : MESSAGES_TYPE.EMAIL;
            } catch (err) { }
            this.setState({ type });
        }
    }

    attachQuillRefs() {
        if (!this.reactQuillRef || typeof this.reactQuillRef.getEditor !== 'function') return;
        this.quillRef = this.reactQuillRef.getEditor();
    }

    template(value) {
        String.prototype.replaceAll = function (search, replacement) {
            let target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        let staff = this.props.user.username;
        value = value.replaceAll('{{staff_name}}', staff);
        value = value.replaceAll('{{current_date}}', new Date().toDateString());
        this.quillRef.setText(value);
        this.setState({ text: value });
    }

    uploadFile(event) {
        let self = this;
        if (event.currentTarget.files && event.currentTarget.files[0]) {
            let file = event.currentTarget.files[0];
            if (file) {
                this.setState({ uploading: true });
                let uploadInstance = EmailFiles.insert({
                    file: file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic',
                }, false);

                uploadInstance.on('start', function () {
                });

                uploadInstance.on('uploaded', function (error, fileObj) {
                    let arr = self.state.files;
                    fileObj.filename = fileObj.name;
                    fileObj.path = EmailFiles.link(fileObj);
                    arr.push(fileObj);
                    Bert.alert("Successful on adding attachment!", "success", "growl-top-right");
                    self.setState({ uploading: false, files: arr });
                    self.attach.value = null;
                });
                uploadInstance.start();
            }
        }
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

    renderEmails() {
        return this.props.user.connectedEmails.map((email, index) => {
            if (email.status === 'pending')
                return null;
            return (
                <option key={index} value={index}>{email.user}</option>
            );
        });
    }

    renderCredSMS() {
        return Meteor.settings.public.twilioNumbers.map((number, index) => {
            return (
                <option key={index} value={number}>{number}</option>
            );
        });
    }

    renderFiles() {
        return this.state.files.map((item, index) => {
            return (
                <span key={index} className="badge badge-secondary text-light mr-1 mt-1">
                    {item.name} <i className="fa fa-times remove" data-tip="Remove attached file" onClick={this.removeFilesToSend.bind(this, item)} />
                </span>
            );
        });
    }

    removeFilesToSend(item) {
        let arr = this.state.files;
        let arr2 = arr.filter(function (el) {
            return el !== item;
        });
        this.setState({ files: arr2 });
    }

    sendMessage(e) {
        e.preventDefault();
        if (this.state.sender > -1) {
            let type = parseInt(this.state.type);
            this.setState({ processing: true });
            let data = {};
            if (type === MESSAGES_TYPE.EMAIL)
                data = {
                    contact: this.state.contact,
                    subject: this.state.subject,
                    bcc: this.state.bcc,
                    cc: this.state.cc,
                    sender: this.props.user.connectedEmails[this.state.sender],
                    text: this.quillRef.getText(0),
                    html: this.state.text,
                    files: this.state.files,
                    type
                };
            else if (type === MESSAGES_TYPE.SMS)
                data = {
                    contact: this.state.contact,
                    subject: '',
                    bcc: '',
                    cc: '',
                    sender: this.state.sender,
                    text: this.quillRef.getText(0),
                    html: '',
                    files: this.state.files,
                    type
                };
            this.props.Message.sendMessage(data, (err) => {
                if (err)
                    Bert.alert(err.reason, 'danger', 'growl-top-right');
                else {
                    this.setState({
                        contact: '',
                        subject: '',
                        bcc: '',
                        cc: '',
                        sender: this.props.user.default_email || -1,
                        text: '',
                        files: [],
                        uploading: false,
                        type: MESSAGES_TYPE.EMAIL,
                        messageModal: false
                    });
                    Bert.alert('Message created', 'success', 'growl-top-right');
                }
                this.setState({ processing: false });
            });
        }
    }

    handleChange(value) {
        this.setState({ text: value })
    }

    render() {
        let type = parseInt(this.state.type);
        return (
            <a className="nav-link" href="#" data-tip="Create Message" onClick={this.setMessageBox.bind(this, true)}>
                <i className="fa fa-2x fa-plus" aria-hidden="true" />
                <Modal
                    isOpen={this.state.messageModal}
                    style={this.styleSet}
                    contentLabel="MessageModal"
                >
                    <form className="panel panel-primary" onSubmit={this.sendMessage}>
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
                                    {type === MESSAGES_TYPE.EMAIL && <input type="email" className="form-control" placeholder="Email Address" name="contact" required onChange={this.handleChangeInput} />}
                                    {type === MESSAGES_TYPE.SMS && <input type="text" className="form-control" placeholder="Mobile Number" name="contact" required onChange={this.handleChangeInput} />}
                                </div>
                                <div className="col-md-6 mt-1">
                                    {type === MESSAGES_TYPE.EMAIL && <input type="text" className="form-control" placeholder="Subject" name="subject" required onChange={this.handleChangeInput} />}
                                    {type === MESSAGES_TYPE.SMS && <input type="text" className="form-control disabled" placeholder="Subject" name="subject" disabled />}
                                </div>
                            </div>
                            <div className="row p-0 m-0">
                                <div className="col-md-6 mt-1">
                                    <div className="row">
                                        <div className="col-md-6 pr-1">
                                            {type === MESSAGES_TYPE.EMAIL && <input type="text" className="form-control" placeholder="BCC" name="bcc" onChange={this.handleChangeInput} />}
                                            {type === MESSAGES_TYPE.SMS && <input type="text" className="form-control disabled" placeholder="BCC" name="bcc" disabled />}
                                        </div>
                                        <div className="col-md-6 pl-1">
                                            {type === MESSAGES_TYPE.EMAIL && <input type="text" className="form-control" placeholder="CC" name="cc" onChange={this.handleChangeInput} />}
                                            {type === MESSAGES_TYPE.SMS && <input type="text" className="form-control disabled" placeholder="CC" name="cc" disabled />}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-1">
                                    <select className="form-control" name="sender" onChange={this.handleChangeInput} value={this.state.sender}>
                                        <option value={{}}>Select Email / Number</option>
                                        {this.renderEmails()}
                                        {this.renderCredSMS()}
                                    </select>
                                </div>
                            </div>
                            <div className="row p-3 m-0 mb-4">
                                <ReactQuill ref={(el) => { this.reactQuillRef = el }} style={{ width: '100%', height: '220px' }} value={this.state.text} onChange={this.handleChange} />
                            </div>
                            <div className="row p-3 m-0 mb-1">
                                <div className="col-md-2 p-0">
                                    <Button className="btn btn-success message-box" type="submit" processing={this.state.processing}>
                                        &nbsp;Send&nbsp;
                                    </Button>
                                    <label className="btn ml-2 text-center" type="button">
                                        {(!this.state.uploading) ? <i className="fa fa-paperclip" /> : <i className="fa fa-circle-o-notch fa-spin" />}
                                        <input type="file"
                                            ref={(e) => {
                                                this.attach = e
                                            }}
                                            style={{ display: "none" }}
                                            className="hidden"
                                            disabled={this.state.uploading}
                                            onChange={this.uploadFile.bind(this)} />
                                    </label>
                                </div>
                                <div className="col-md-2 p-0">
                                    <TemplateMain {...this.props} Message={this.props.Message} setTemplate={this.template} />
                                </div>
                                {this.state.files.length > 0 && <div className="col-md-8">Files:{this.renderFiles()}</div>}
                            </div>
                        </div>
                    </form>
                </Modal>
            </a>
        );
    }
}

MessageBox.propTypes = {
    user: PropTypes.object,
    Message: PropTypes.object
};

export default withTracker(() => {
    return {};
})(MessageBox);