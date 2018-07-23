import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE } from '../../../api/classes/Const';
import { EmailFiles } from '../../../api/files';
import { ValidMessages } from '../../../api/messages';
import { MessagesDB } from '../../../api/messages';
import MessageClass from '../../../api/classes/Message';
import Util from '../../../api/classes/Utilities';
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
            reply: false,
            search: '',
            start: '',
            end: ''
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
        this.setSearch = this.setSearch.bind(this);
        this.template = this.template.bind(this);
        this.reset = this.reset.bind(this);
        this.sortDate = this.sortDate.bind(this);
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

    template(value) {
        String.prototype.replaceAll = function (search, replacement) {
            let target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        let staff = this.props.user.username;
        let name = (this.props.candidate && this.props.candidate.name) ? this.props.candidate.name : '';
        let category = (this.props.candidate && this.props.candidate.category) ? this.props.candidate.category : '';
        value = value.replaceAll('{{staff_name}}', staff);
        value = value.replaceAll('{{current_date}}', new Date().toDateString());
        value = value.replaceAll('{{applicant_name}}', name);
        value = value.replaceAll('{{application_position}}', category);
        this.quillRef.setText(value);
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
                <Message
                    key={index}
                    Candidate={this.props.Candidate}
                    Message={this.props.Message}
                    message={message}
                    candidate={this.props.candidate}
                    user={this.props.user}
                    users={this.props.users}
                    isReady={this.props.isReady}
                    highlight={this.state.search}
                />
            );
        });
    }

    setSearch() {
        this.props.setSearch(this.state.search, this.state.start, this.state.end);
    }

    reset() {
        this.setState({ search: '', start: '', end: '' }, () => {
            this.props.setSearch(this.state.search, this.state.search, this.state.end);
        });
    }

    sortDate() {
        this.props.sortDate(!this.props.sort);
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
                                        {
                                            type === MESSAGES_TYPE.EMAIL &&
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Subject"
                                                name="subject"
                                                required
                                                onChange={this.handleChangeInput}
                                            />
                                        }
                                        {
                                            type === MESSAGES_TYPE.SMS &&
                                            <input
                                                type="text"
                                                className="form-control disabled"
                                                placeholder="Subject"
                                                name="subject"
                                                disabled
                                            />
                                        }
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
                                    <ReactQuill
                                        ref={(el) => { this.reactQuillRef = el }}
                                        style={{ width: '100%', height: '220px' }}
                                        value={this.state.text}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className="row p-3 m-0 mb-1">
                                    <div className="col-md-2 p-0">
                                        <Button
                                            className="btn btn-success message-box"
                                            type="submit"
                                            processing={this.state.processing}>
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
                        }
                    </div>
                    <hr />
                </form>
                <div id="content-emails" className={`col-sm-12 ${this.state.reply ? 'open-reply' : 'close-reply'}`}>
                    Keyword: <input className="p-1" type="text" name="search" onChange={this.handleChangeInput} value={this.state.search} /> &nbsp;
                    From: <input className="p-1" type="date" name="start" onChange={this.handleChangeInput} value={this.state.start} /> &nbsp;
                    To: <input className="p-1" type="date" name="end" onChange={this.handleChangeInput} value={this.state.end} /> &nbsp;
                    <button className="p-1" onClick={this.setSearch} disabled={!this.props.isReady}><i className="fa fa-search" /> Search</button> &nbsp;
                    <button className="p-1" onClick={this.reset} disabled={!this.props.isReady}>Reset</button> &nbsp;
                    <div className="pull-right" style={{ cursor: 'pointer' }} onClick={this.sortDate}>
                        <small>Sort by Date</small> <i className={`fa ${this.props.sort ? 'fa-sort-up' : 'fa-sort-down'}`} style={{ top: this.props.sort ? '4px' : '-4px', position: 'relative', margin: '5px' }} />
                    </div>
                    {
                        !this.props.isReady ?
                            <div className="text-center">
                                <i className="fa fa-spin fa-circle-o-notch" /> Loading...
                            </div> :
                            this.renderMessages()
                    }
                    {
                        this.props.isReady && this.props.messages.length && this.props.messages[0].max > this.props.messages.length ?
                            <div className="text-center">
                                <button className="btn btn-success btn-sm" onClick={this.props.viewMore}>View More</button>
                            </div> : null
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
    Candidate: PropTypes.object,
    setSearch: PropTypes.func,
    sort: PropTypes.bool,
    sortDate: PropTypes.func
};

export default withTracker((props) => {
    let isReady = Meteor.subscribe(ValidMessages, props.candidate.contact, props.limit, props.search, props.start, props.end, props.sort).ready();
    return {
        isReady,
        messages: MessagesDB.find({}, { sort: { createdAt: props.sort ? 1 : -1 } }).fetch().map((item, index) => new MessageClass(item, index)),
    };
})(CandidateMessages);