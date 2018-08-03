import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderNav from './HeaderNav';
import Util from '../../../api/classes/Utilities';
import { MessagesIncomingPub, IncomingDB } from '../../../api/messages';
import Timezone from '../timezone/Timezone';
import MessageBox from '../messages/MessageBox';
import Calendar from '../calendar/Calendar';
import Tasklist from '../tasklist/Tasklist';
import moment from 'moment-timezone';
import Help from './Help';
class RightNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timestamp: moment().valueOf(),
        };
        this.toggleMute = this.toggleMute.bind(this);
        this.audio = null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.logs !== prevProps.logs) {
            let lastTimestamp = this.state.timestamp;
            this.props.logs.forEach((data) => {
                if (lastTimestamp < data.timestamp)
                    Util.notifyClient(data.title, data.message, data.options);
                if (!this.props.user.mute && this.audio === null && lastTimestamp < data.timestamp) {
                    this.audio = new Audio('/Woosh.mp3');
                    this.audio.play();
                }
            });
            this.setState({ timestamp: moment().valueOf() });
        }
    }

    toggleMute() {
        this.props.Account.toggleMute();
    }

    render() {
        if (!this.props.user)
            return null;
        let mute = this.props.user.mute ? 'fa fa-2x fa-volume-off' : 'fa fa-2x fa-volume-up';
        return (
            <div className="left-nav pull-right bg-secondary">
                <ul className="navbar-nav ml-auto text-center">
                    <HeaderNav key={0} type="navbar">
                        <MessageBox {...this.props} Message={this.props.Message} />
                    </HeaderNav>
                    <HeaderNav key={1} type="navbar">
                        <a href="#" onClick={this.toggleMute} data-tip="Toggle Volume"
                            className="nav-link">
                            <i className={mute}
                                aria-hidden="true" />
                        </a>
                    </HeaderNav>
                    <HeaderNav key={2} type="navbar">
                        <Timezone {...this.props} Category={this.props.Account} />
                    </HeaderNav>
                    <HeaderNav key={4} type="navbar">
                        <Calendar {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={5} type="navbar">
                        <Tasklist {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={3} type="navbar">
                        <Help {...this.props} />
                    </HeaderNav>
                </ul>
            </div>
        );
    }
}

RightNav.propTypes = {
    user: PropTypes.object,
    timestamp: PropTypes.number,
    logs: PropTypes.array,
    Account: PropTypes.object,
    Message: PropTypes.object,
};

export default withTracker(() => {
    Meteor.subscribe(MessagesIncomingPub, moment().valueOf());
    return {
        logs: IncomingDB.find().fetch(),
    };
})(RightNav);
