import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

class Notifications extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.audio = null;
    }

    renderNotif() {
        return this.props.notifications.map((notification, index) => {
            return (
                <div key={index} className="notif p-sm" style={{
                    backgroundColor: (notification.status === "unread") ? "#e5e5e5" : "#f7f7f7"
                }}>
                    <div dangerouslySetInnerHTML={{ __html: notification.message }} />
                    <br />
                    <small><i className="fa fa-calendar-o" aria-hidden="true" />
                        &nbsp; {notification.getDateCreated(this.props.user.default_timezone)}
                    </small>
                </div>
            );
        });
    }

    render() {
        return (
            <div className="">
                {this.renderNotif()}
            </div>
        );
    }
}
Notifications.propTypes = {
    notifications: PropTypes.array,
    notifUnread: PropTypes.array,
    user: PropTypes.object,
    title: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};
export default withTracker(() => {
    return {};
})(Notifications);