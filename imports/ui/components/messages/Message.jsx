import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE, MESSAGES_STATUS, isPermitted, ROLES, VALUE, EMAIL_TIMEOUT } from '../../../api/classes/Const';
import { EmailFiles } from '../../../api/files';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Modal from '../extras/Modal';
import Link from '../extras/Link';
import ReactTooltip from 'react-tooltip';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggle: props.message.index === 0,
            confirmation: false,
            height: 0,
            menu: [{
                title: 'Menu 1',
                callback: null
            }],
            text: ''
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '210px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggle = this.toggle.bind(this);
        this.toggleConfirmation = this.toggleConfirmation.bind(this);
        this.remove = this.remove.bind(this);
        this.frame = null;
    }
    componentDidMount() {
        this.setFrame();
    }
    componentDidUpdate() {
        let self = this;
        $('.custom-menu li').click(function () {
            switch ($(this).attr('data-action')) {
                case 'name':
                case 'address':
                case 'number':
                case 'zip':
                    self.addInfo($(this).attr('data-action'));
                    break;
                default:
                    self.addInfo($(this).attr('data-action'), true);
                    break;
            }
            $('.custom-menu').hide(100);
        });
    }
    resend(data){
        this.props.Message.reSend(data.id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Message Resent!', 'success', 'growl-top-right');
        });
    }
    setFrame() {
        const iframe = this.frame;
        let self = this;
        if (iframe) {
            const document = iframe.contentDocument;
            let message = this.props.message.html.length ? this.props.message.html : this.props.message.text;
            message = message.replace(this.props.highlight, `<span style="background-color: yellow !important;">${this.props.highlight}</span>`);
            document.body.innerHTML = message;
            this.setState({ height: document.body.offsetHeight + 40 });
            document.addEventListener('contextmenu', (event) => {
                let text = this.getSelectionFrameText(this.props.message.id);
                this.setState({ text });
                if (text.length) {
                    event.preventDefault();
                    $('.custom-menu').finish().toggle(100).css({
                        top: event.pageY + 'px',
                        left: event.pageX + 'px'
                    });
                }
            });
            $(document).bind('mousedown', function (e) {
                if (!$(e.target).parents('.custom-menu').length > 0) {
                    $('.custom-menu').hide(100);
                }
            });
            $('.custom-menu li').click(function () {
                switch ($(this).attr('data-action')) {
                    case 'name':
                    case 'number':
                    case 'zip':
                        self.addInfo($(this).attr('data-action'));
                        break;
                    default:
                        self.addInfo($(this).attr('data-action'), true);
                        break;
                }
                $('.custom-menu').hide(100);
            });
        }
    }
    addInfo(info, stats = false) {
        let data = { id: this.props.candidate.id, info, value: this.state.text };
        if (stats)
            data.info = info + '_notes';
        this.props.Candidate.addInfo(data, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
        });
    }
    getSelectionFrameText(frameId) {
        let frame = document.getElementById("frame-" + frameId);
        let frameWindow = frame && frame.contentWindow;
        let frameDocument = frameWindow && frameWindow.document;
        if (frameDocument) {
            if (frameDocument.getSelection) {
                return String(frameDocument.getSelection());
            }
            else if (frameDocument.selection) {
                return frameDocument.selection.createRange().text;
            }
            else if (frameWindow.getSelection) {
                return String(frameWindow.getSelection());
            }
        }
        return '';
    }
    getSelectionText() {
        var text = '';
        var activeEl = document.activeElement;
        var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        if (
            (activeElTagName == 'textarea') || (activeElTagName == 'input' &&
                /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
            (typeof activeEl.selectionStart == 'number')
        ) {
            text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        } else if (window.getSelection) {
            text = window.getSelection().toString();
        }
        return text;
    }
    remove(callback) {
        this.props.Message.remove(this.props.message.id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Message removed!', 'success', 'growl-top-right');
            callback();
            this.setState({ confirmation: false });
        });
    }
    toggle() {
        this.setState({ toggle: !this.state.toggle }, () => {
            this.setFrame();
        });
    }
    toggleConfirmation() {
        this.setState({ confirmation: !this.state.confirmation });
    }
    renderAttachment() {
        return this.props.message.attachments.map((attachment, index) => {
            return (
                <div key={index} className="col-md-4">
                    <Link key={index} href={EmailFiles.link(attachment)} defaultImage={this.props.message.imgUrl}
                        target='_blank'>{attachment.name}</Link>
                </div>
            );
        });
    }
    createMarkup() {
        return { __html: this.props.message.html.length ? this.props.message.html : this.props.message.text };
    }
    render() {
        let message = this.props.message,
            type = 'Unknown',
            background = 'card-header ';
        if (MESSAGES_TYPE.EMAIL === message.type)
            type = 'EMAIL';
        if (MESSAGES_TYPE.SMS === message.type)
            type = 'SMS';
        if (MESSAGES_TYPE.SKYPE === message.type)
            type = 'SKYPE';
        if (MESSAGES_STATUS.SENT === message.status)
            background += 'bg-light';
        if (MESSAGES_STATUS.RECEIVED === message.status)
            background += 'bg-warning-custom';
        let emails = this.props.users.filter((user) => {
            let email = user.connectedEmails.filter((e) => e.user === message.from);
            if (email.length)
                return true;
            return false;
        });
        return (
            <div className="mb-2">
                <div className="row">
                    <div className="col-sm-12">
                        <small className="pull-left">
                            {type}
                        </small>
                        <small className="pull-right">
                            {
                                message.status === MESSAGES_STATUS.SENT &&
                                <i className="fa fa-check-circle-o text-success mr-1" data-tip="Sending Success" />
                            }
                            {
                                message.status === MESSAGES_STATUS.RECEIVED &&
                                <i className="fa fa-check-square text-info mr-1" data-tip="Received." />
                            }
                            {
                                (message.status === MESSAGES_STATUS.SENDING) ?
                                    ( message.type === MESSAGES_TYPE.EMAIL && message.createdAt + (EMAIL_TIMEOUT * 60000) < Date.now() ) ?
                                    <i className="fa fa-exclamation-triangle text-danger mr-1" data-tip="Sending failed" style={{ cursor: "pointer" }} onClick={this.resend.bind(this, message)} /> : //TODO for John to add retry click function here
                                    <i className="fa fa-spin fa-circle-o-notch text-info mr-1" data-tip="Sending..." /> :
                                    null
                            }
                            {
                                message.status === MESSAGES_STATUS.FAILED &&
                                <i className="fa fa-exclamation-triangle text-danger mr-1" data-tip="Sending failed" style={{ cursor: "pointer" }} onClick={this.resend.bind(this, message)} />
                            }
                            {
                                message.getDateTime()
                            }
                            {
                                isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) &&
                                message.retired !== VALUE.TRUE &&
                                <i className="link fa fa-trash ml-1 text-danger" data-tip="Remove Message" onClick={this.toggleConfirmation} />
                            }
                            {
                                message.retired === VALUE.TRUE &&
                                <span className="badge badge-secondary text-light ml-1" data-tip="Removed Message" >removed</span>
                            }
                        </small>
                        <ReactTooltip />
                    </div>
                </div>
                <div className="card">
                    <h6 className={background} onClick={this.toggle}>
                        {message.subject.length ? message.subject : message.text}
                        <span className="pull-right">
                            {this.state.toggle && <i className="fa fa-chevron-circle-down" />}
                            {!this.state.toggle && <i className="fa fa-chevron-circle-up" />}
                        </span>
                    </h6>
                    {
                        this.state.toggle &&
                        <div className="card-body">
                            <div className="mb-2">
                                <div className="">
                                    From:
                                    <b>
                                        {message.status === MESSAGES_STATUS.RECEIVED && this.props.candidate.getDisplayName()} &nbsp;
                                        {message.status === MESSAGES_STATUS.SENT && this.props.user.checkSender(message.from, message.type) && 'me'}
                                        {message.status === MESSAGES_STATUS.SENT && !this.props.user.checkSender(message.from, message.type) && emails.length > 0 && emails[0].username}
                                        &nbsp;
                                    </b>
                                    <small>via {message.from}</small>
                                </div>
                                <div className="">
                                    To: {message.to}
                                </div>
                            </div>
                            <div className="card-text">
                                <iframe id={`frame-${this.props.message.id}`} ref={(e) => { this.frame = e; }} style={{ height: this.state.height }}></iframe>
                            </div>
                            {this.renderAttachment()}
                        </div>
                    }
                </div>
                <Modal isOpen={this.state.confirmation} contentLabel="ConfirmationModal" style={this.styleSet}>
                    <form className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Remove Confirm
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleConfirmation}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            You are going to remove a message. Continue?
                        </div>
                        <div className="panel-footer p-2">
                            <hr />
                            <div className="container">
                                <div className="pull-right mb-2">
                                    <Button className="form-control btn btn-danger" onClick={this.remove}>Remove</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
                <ul className="custom-menu">
                    <li data-action="name">Attach to Name</li>
                    <li data-action="number">Attach to Phone Number</li>
                    <li data-action="zip">Attach to Zip Code</li>
                    <li data-action="disc">Attach to DISC</li>
                    <li data-action="values">Attach to VALUES</li>
                    <li data-action="iq">Attach to IQ</li>
                    <li data-action="resume">Attach to RESUME</li>
                    <li data-action="portfolio">Attach to PORTFOLIO</li>
                    <li data-action="TEST_METEOR">Attach to TEST_METEOR</li>
                    <li data-action="TEST_LIVE">Attach to TEST_LIVE</li>
                    <li data-action="TEST_WRITING">Attach to TEST_WRITING</li>
                    <li data-action="VIDEO">Attach to VIDEO</li>
                    <li data-action="INTERVIEW">Attach to INTERVIEW</li>
                    <li data-action="MANAGER">Attach to MANAGER</li>
                    <li data-action="TEST_IMAGE">Attach to TEST_IMAGE</li>
                    <li data-action="TEST_CREATIVE">Attach to TEST_CREATIVE</li>
                    <li data-action="TEST_WEBFLOW">Attach to TEST_WEBFLOW</li>
                    <li data-action="TEST_MOCK">Attach to TEST_MOCK</li>
                    <li data-action="TEST_SIMULATION">Attach to TEST_SIMULATION</li>
                    <li data-action="others">Attach to OTHERS</li>
                </ul>
            </div>
        );
    }
}

Message.propTypes = {
    message: PropTypes.object,
    candidate: PropTypes.object,
    user: PropTypes.object,
    users: PropTypes.array,
    Message: PropTypes.object,
    Candidate: PropTypes.object,
    isReady: PropTypes.bool
};

export default withTracker(() => {
    return {};
})(Message);
