import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MESSAGES_TYPE, MESSAGES_STATUS } from '../../../api/classes/Const';
import PropTypes from 'prop-types';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false
        };
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({ toggle: !this.state.toggle });
    }
    render() {
        let message = this.props.message,
            type = 'Unknown';
        if (MESSAGES_TYPE.EMAIL === message.type)
            type = 'EMAIL';
        if (MESSAGES_TYPE.SMS === message.type)
            type = 'SMS';
        if (MESSAGES_TYPE.SKYPE === message.type)
            type = 'SKYPE';
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
                            {message.getDateTime()}
                            <i className="fa fa-trash ml-1 text-danger" />
                        </small>
                    </div>
                </div>
                <div className="card">
                    <h6 className="card-header" onClick={this.toggle}>
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
                                        {message.status === MESSAGES_STATUS.SENT && !this.props.user.checkSender(message.from, message.type) && emails.length && emails[0].username}
                                        &nbsp;
                                    </b>
                                    <small>via {message.from}</small>
                                </div>
                                <div className="">
                                    To: {message.to}
                                </div>
                            </div>
                            <p className="card-text">
                                {message.text}
                            </p>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

Message.propTypes = {
    message: PropTypes.object,
    candidate: PropTypes.object,
    user: PropTypes.object,
    users: PropTypes.array
};

export default withTracker(() => {
    return {};
})(Message);
