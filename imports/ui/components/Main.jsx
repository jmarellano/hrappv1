import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ValidUsers } from '../../api/users';
import { CheckAppointments, SettingsDB, SettingsPub } from '../../api/settings';

import Client from '../../api/classes/Client';
import User from '../../api/classes/User';
import Section from './Section';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Util from "../../api/classes/Utilities";

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.Client = new Client();
        this.willContinueCheckingAppointments = true;
    }

    notify(data){
        let option = {"icon" : "/img/e-mail-10.png"};
        Util.notifyClient("Incoming Appointment Alert", `Hello you have an incoming appointment with subject:  in the next 100 minutes`, option);
    }

    componentDidMount(){
        Meteor.setInterval(() => {
            Meteor.call(CheckAppointments);
        }, 20 * 1000);
    }

    componentDidUpdate(prevProps) {
        let option = {"icon" : "/img/e-mail-10.png"};
        if ((this.props.user !== prevProps.user) && this.props.user)
            moment.tz.setDefault(this.props.user.default_timezone || 'Asia/Manila');
        if (this.props.scheduledTask !== prevProps.scheduledTask && Meteor.user()) {
            let didNotify = false;
            let tasks = this.props.scheduledTask;
            if(tasks.length && this.willContinueCheckingAppointments){
                for(let i = 0; i < tasks.length; i++){
                    let task = tasks[i];
                    let remainingTime = Util.getTimeRemaining(new Date(task.startTime));
                    console.log(`checking a task with startTime: ${new Date(task.startTime)} with remaining time: ${JSON.stringify(remainingTime)}`);
                    if(remainingTime){
                        console.log('remaining time: ', remainingTime.minutes);
                        switch(remainingTime.minutes){
                            case 5:
                                console.log('should show 5 mins');
                                Util.notifyClient("Incoming Appointment Alert", `Hello you have an incoming appointment with subject: ${task.subject} in the next 5 minutes`, option);
                                didNotify = true;
                                break;
                            case 3:
                                console.log('should show 3 mins');
                                Util.notifyClient("Incoming Appointment Alert", `Hello you have an incoming appointment with subject: ${task.subject} in the next 3 minutes`, option);
                                didNotify = true;
                                break;
                            case 0:
                                console.log('should show now');
                                Util.notifyClient("Incoming Appointment Alert", `Hello you have a scheduled appointment with subject: ${task.subject} right now`, option);
                                didNotify = true;
                                break;
                        }
                    }
                }
                if(didNotify){
                    this.audio = new Audio('/Woosh.mp3');
                    this.audio.play();
                    this.willContinueCheckingAppointments = false;
                    Meteor.setTimeout(()=>{
                        this.willContinueCheckingAppointments = true;
                    }, 60 * 1000);
                }
            }
        }

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
    Meteor.subscribe(ValidUsers);
    if (user)
        user = new User(user, 0);
    let users = db['#users'].find({}, { sort: { username_sort: 1 } }).fetch().map((item, index) => new User(item, index));
    if (isReady && user) {
        isReady = users.length && Meteor.subscribe(SettingsPub).ready();
    }
    return {
        component: props.match.params.component || '',
        title: Meteor.settings.public.config.title,
        isReady,
        user,
        users: users,
        settings: SettingsDB.findOne(),
        scheduledTask: db['#task-lists'].find({}, {sort: {startTime: -1}}).fetch()
    };
})(Main);
