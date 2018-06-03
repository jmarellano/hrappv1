import { Accounts } from 'meteor/accounts-base';
import Future from 'fibers/future';
import Fiber from 'fibers';
import nodemailer from 'nodemailer';
import Imap from 'imap';
import Drive from './Drive';
import WebShot from './WebShot';
import clamscan from 'clamscan';
import twilio from 'twilio';
import { MessagesAddListener } from '../messages';

export default class Server {
    constructor() {
        this.messageSender = [];
        this.messageListener = [];
    }

    createFuture() {
        return new Future();
    }

    createTwilio(sid, token) {
        return new twilio(sid, token);
    }

    createImap(data) {
        return Imap(data);
    }

    getFiber(data) {
        return Fiber(data);
    }

    getNodemailer() {
        return nodemailer;
    }

    getClamscan(options) {
        return clamscan(options);
    }

    getWebshot(link, filename, options, callback) {
        return new WebShot(link, filename, options, callback);
    }

    getDrive() {
        Drive.init();
        return Drive;
    }

    addSender(id, email, connection) {
        this.messageSender.push({ id, email, connection });
    }

    initListener() {
        console.log('Running listener for emails...');
        Meteor.users.find({ retired: { $exists: false } }).fetch().forEach((user) => {
            if (user.profile.emails)
                user.profile.emails.forEach((credit) => {
                    if (credit.status === 'connected')
                        Meteor.call(MessagesAddListener, credit, user._id);
                });
        });
    }

    removeSender(id, email) {
        let connections = this.messageSender.filter((e) => {
            return ![{ id, email }].some(function (s) {
                return s.id === e.id && s.email === e.email;
            });
        });
        this.messageSender = connections;
    }

    run() {
        console.log('Initializing server setup...');
        let appVersion = 'MeteorJS + ReactJS';
        console.log(`Version: ${appVersion}`);
        console.log(`Meteor Version: ${Meteor.release}`);
        console.log('Running server scheduled events...');
        Accounts.validateLoginAttempt((data) => {
            if (data.error)
                return data.error;
            if (!data.user.emails[0].verified)
                throw new Meteor.Error('BAD', 'Verify email account first!');
            if (data.user.emails[0].verified && data.user.profile.role === 0)
                throw new Meteor.Error('BAD', 'Account must be accepted by an admin!');
            if (data.user.profile && data.user.profile.retired)
                throw new Meteor.Error('BAD', 'User account disabled!');
            else
                return true;
        });
    }

}