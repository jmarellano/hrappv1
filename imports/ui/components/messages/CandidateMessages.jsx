import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE } from '../../../api/classes/Const';
import { EmailFiles } from '../../../api/files';
import { ValidMessages } from '../../../api/messages';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import Message from './Message';
import TemplateMain from '../templates/TemplateMain';

class CandidateMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            reply: false
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

    componentDidUpdate() {
        this.attachQuillRefs();
    }

    template(value) {
        String.prototype.replaceAll = function (search, replacement) {
            let target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        let staff = this.props.user.username;
        let name = (this.props.candidate && this.props.candidate.name) ? this.props.candidate.name : '';
        let category = (this.props.candidate && this.props.candidate.category) ? this.props.candidate.category : '';
        value = value.replaceAll("{{staff_name}}", staff);
        value = value.replaceAll("{{current_date}}", new Date().toDateString());
        value = value.replaceAll("{{applicant_name}}", name);
        value = value.replaceAll("{{application_position}}", category);
        this.setState({ text: value });
    }

    attachQuillRefs() {
        if (!this.reactQuillRef || typeof this.reactQuillRef.getEditor !== 'function') return;
        this.quillRef = this.reactQuillRef.getEditor();
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

    setMessageBox() {
        this.setState({ reply: !this.state.reply });
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
            if (type === MESSAGES_TYPE.EMAIL) {
                if (!this.props.candidate.email) {
                    Bert.alert('No email address associated with this candidate', 'danger', 'growl-top-right');
                    this.setState({ processing: false });
                    return null;
                }
                data = {
                    contact: this.props.candidate.email,
                    subject: this.state.subject,
                    bcc: this.state.bcc,
                    cc: this.state.cc,
                    sender: this.props.user.connectedEmails[this.state.sender],
                    text: this.quillRef.getText(0),
                    html: this.state.text,
                    files: this.state.files,
                    type
                };
            }
            else if (type === MESSAGES_TYPE.SMS) {
                if (!this.props.candidate.number) {
                    Bert.alert('No phone number associated with this candidate', 'danger', 'growl-top-right');
                    this.setState({ processing: false });
                    return null;
                }
                data = {
                    contact: this.props.candidate.number,
                    subject: '',
                    bcc: '',
                    cc: '',
                    sender: this.state.sender,
                    text: this.quillRef.getText(0),
                    html: '',
                    files: this.state.files,
                    type
                };
            }
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
                        processing: false
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

    renderMessages() {
        return this.props.messages.map((message, index) => {
            return (
                <Message key={index} Candidate={this.props.Candidate} Message={this.props.Message} message={message} candidate={this.props.candidate} user={this.props.user} users={this.props.users} />
            );
        });
    }

    render() {
        let type = parseInt(this.state.type);
        return (
            <div>
                <form className="panel panel-primary" onSubmit={this.sendMessage}>
                    <div className="panel-heading bg-secondary text-white p-2 link" onClick={this.setMessageBox}>
                        <div className="panel-title">
                            Reply
                            <span className="pull-right">
                                <a href="#" className="close-modal">
                                    {this.state.reply ? <i className="fa fa-remove" /> : <i className="fa fa-chevron-circle-up" />}
                                </a>
                            </span>
                        </div>
                    </div>
                    <div className="panel-body p-2">
                        {
                            this.state.reply &&
                            <div>
                                <div className="row p-0 m-0">
                                    <div className="col-md-6 mt-1">
                                        {type === MESSAGES_TYPE.EMAIL && <input type="text" className="form-control" placeholder="Subject" name="subject" required onChange={this.handleChangeInput} />}
                                        {type === MESSAGES_TYPE.SMS && <input type="text" className="form-control disabled" placeholder="Subject" name="subject" disabled />}
                                    </div>
                                    {
                                        type === MESSAGES_TYPE.EMAIL &&
                                        <div className="col-md-6 mt-1">
                                            <select className="form-control" name="sender" onChange={this.handleChangeInput} value={this.state.sender}>
                                                <option value={{}}>Select Email</option>
                                                {this.renderEmails()}
                                            </select>
                                        </div>
                                    }
                                    {
                                        type === MESSAGES_TYPE.SMS &&
                                        <div className="col-md-6 mt-1">
                                            <select className="form-control" name="sender" onChange={this.handleChangeInput} value={this.state.sender}>
                                                <option value={{}}>Select Number</option>
                                                {this.renderCredSMS()}
                                            </select>
                                        </div>
                                    }
                                </div>
                                <div className="row p-3 m-0 mb-4">
                                    <ReactQuill ref={(el) => { this.reactQuillRef = el }} style={{ width: '100%', height: '220px' }} value={this.state.text} onChange={this.handleChange} />
                                </div>
                                <div className="row p-3 m-0 mb-1">
                                    <div className="col-md-3 p-0">
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
                                        <select name="type" className="form-control" onChange={this.handleChangeInput}>
                                            <option value={MESSAGES_TYPE.EMAIL}>Email</option>
                                            <option value={MESSAGES_TYPE.SMS}>SMS</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <TemplateMain {...this.props} Message={this.props.Message} setTemplate={this.template} />
                                    </div>
                                    <div className="col-md-5">
                                        Files:
                                        {this.renderFiles()}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <hr />
                </form>
                <div className={`col-sm-12 ${this.state.reply ? 'open-reply' : 'close-reply'}`}>
                    {this.renderMessages()}
                    {
                        !this.props.isReady &&
                        <div className="text-center">
                            <i className="fa fa-spin fa-circle-o-notch" /> Loading...
                        </div>
                    }
                    {
                        this.props.isReady && this.props.messages.length && this.props.messages[0].max > this.props.messages.length &&
                        <div className="text-center">
                            <button className="btn btn-success btn-sm" onClick={this.props.viewMore}>View More</button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

CandidateMessages.propTypes = {
    user: PropTypes.object,
    Message: PropTypes.object,
    isReady: PropTypes.bool,
    messages: PropTypes.array,
    candidate: PropTypes.object,
    viewMore: PropTypes.func,
    users: PropTypes.array,
    Candidate: PropTypes.object
};

export default withTracker((props) => {
    let isReady = Meteor.subscribe(ValidMessages, props.candidate.contact, props.limit).ready();
    return {
        isReady
    };
})(CandidateMessages);