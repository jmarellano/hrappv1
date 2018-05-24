import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ValidUsers } from '../../api/users';
import { SettingsDB, SettingsPub } from '../../api/settings';

import Client from '../../api/classes/Client';
import User from '../../api/classes/User';
import Section from './Section';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.Client = new Client();
    }

    componentDidUpdate(prevProps) {
        if ((this.props.user !== prevProps.user) && this.props.user)
            moment.tz.setDefault(this.props.user.default_timezone || 'Asia/Manila');
    }

    render() {
        return (
            <Section {...this.props} Client={this.Client} />
        );
    }
}

Main.propTypes = {
    user: PropTypes.object
};

export default withTracker(props => {
    let isReady = Accounts.loginServicesConfigured(),
        user = Meteor.user();
    if (user)
        user = new User(user, 0);
    if (isReady && user) {
        isReady = Meteor.subscribe(ValidUsers).ready() && Meteor.subscribe(SettingsPub).ready();
    }
    return {
        component: props.match.params.component || '',
        title: Meteor.settings.public.config.title,
        isReady,
        user,
        users: Meteor.users.find({}, { sort: { username_sort: 1 } }).fetch().map((item, index) => new User(item, index)),
        settings: SettingsDB.findOne()
    };
})(Main);
