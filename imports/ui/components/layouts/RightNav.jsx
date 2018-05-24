import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderNav from './HeaderNav';
import Client from '../../../api/classes/Client';
import Util from '../../../api/classes/Utilities';
import { MessagesIncomingPub, IncomingDB } from '../../../api/messages';
import Timezone from '../timezone/Timezone';
import MessageBox from '../messages/MessageBox';
import moment from 'moment-timezone';

class RightNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timestamp: moment().valueOf(),
        };
        this.toggleMute = this.toggleMute.bind(this);
        this.Client = new Client();
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
        this.Client.Account.toggleMute();
    }

    render() {
        let mute = this.props.user.mute ? 'fa fa-2x fa-volume-off' : 'fa fa-2x fa-volume-up';
        return (
            <div className="left-nav pull-right bg-secondary">
                <ul className="navbar-nav ml-auto text-center">
                    <HeaderNav key={0} type="navbar">
                        <MessageBox {...this.props} Message={this.Client.Message} />
                    </HeaderNav>
                    <HeaderNav key={1} type="navbar">
                        <a href="#" onClick={this.toggleMute} data-tip="Toggle Volume"
                            className="nav-link">
                            <i className={mute}
                                aria-hidden="true" />
                        </a>
                    </HeaderNav>
                    <HeaderNav key={2} type="navbar">
                        <Timezone {...this.props} Category={this.Client.Account} />
                    </HeaderNav>
                </ul>
            </div>
        );
    }
}

RightNav.propTypes = {
    user: PropTypes.object,
    timestamp: PropTypes.number,
    logs: PropTypes.array
};

export default withTracker(() => {
    Meteor.subscribe(MessagesIncomingPub, moment().valueOf());
    return {
        logs: IncomingDB.find().fetch(),
    };
})(RightNav);
