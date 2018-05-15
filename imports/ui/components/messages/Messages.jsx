import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ROUTES } from '../../../api/classes/Const';
import { NotificationsDB, NotifPub } from '../../../api/notifications';
import Button from '../extras/Button';
import Candidates from './Candidates';
import CandidatesContent from './CandidatesContent';
import Notification from './Notification';
import Notif from '../../../api/classes/Notif';

class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div id="messages" className="pull-left main">
                <div className="row m-0 p-0">
                    <div className="col-md-3 bg-secondary-light vh">
                        <Candidates {...this.props} />
                    </div>
                    <div className="col-md-7">
                        <CandidatesContent {...this.props} />
                    </div>
                    <div className="col-md-2 p-0 m-0">
                        <Notification {...this.props} />
                    </div>
                </div>
            </div>
        );
    }
}

Messages.propTypes = {};

export default withTracker(props => {
    Meteor.subscribe(NotifPub);
    return {
        notifications: NotificationsDB.find({}, { sort: { "status": -1, "createdAt": -1 } }).fetch().map((item) => new Notif(item))
    };
})(Messages);
