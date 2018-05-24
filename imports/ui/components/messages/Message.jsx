import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE, MESSAGES_STATUS, isPermitted, ROLES, VALUE } from '../../../api/classes/Const';
import { EmailFiles } from '../../../api/files';
import { Menu } from 'react-data-menu';
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
            menu: {

            }
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
    }
    componentDidMount() {
        window.iframely && window.iframely.load();
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
        this.setState({ toggle: !this.state.toggle });
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
                                message.status === MESSAGES_STATUS.FAILED &&
                                <i className="fa fa-exclamation-triangle text-danger mr-1" data-tip="Sending failed" />
                            }
                            {
                                message.getDateTime()
                            }
                            {
                                isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) &&
                                message.retired !== VALUE.TRUE &&
                                <i className="link fa fa-trash ml-1 text-danger" onClick={this.toggleConfirmation} />
                            }
                            {
                                message.retired === VALUE.TRUE &&
                                <span className="badge badge-secondary text-light ml-1" data-tip="Removing Message" >removed</span>
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
                                {message.type === MESSAGES_TYPE.EMAIL ? <div dangerouslySetInnerHTML={this.createMarkup()}></div> : message.text}
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
            </div>
        );
    }
}

Message.propTypes = {
    message: PropTypes.object,
    candidate: PropTypes.object,
    user: PropTypes.object,
    users: PropTypes.array,
    Message: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Message);
