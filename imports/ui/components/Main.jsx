import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ValidUsers } from '../../api/users';

import Client from '../../api/classes/Client';
import User from '../../api/classes/User';
import Section from './Section';
import { SettingsDB, SettingsPub } from '../../api/settings';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.Client = new Client();
    }

    render() {
        return (
            <Section {...this.props} Client={this.Client} />
        );
    }
}

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
