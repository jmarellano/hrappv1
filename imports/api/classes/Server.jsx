import { Accounts } from 'meteor/accounts-base';
import { MessagesAddSender } from '../messages';
import SettingManager from './SettingManager';
import Future from 'fibers/future';
import Fiber from 'fibers';
import nodemailer from 'nodemailer';
import Imap from 'imap';
import Drive from './Drive';
import WebShot from './WebShot';
import clamscan from 'clamscan';
import twilio from 'twilio';
import fs from 'fs';
import ics from 'ics';

export default class Server {
    constructor() {
        this.messageSender = [];
        this.messageListener = [];
    }

    createFuture() {
        return new Future();
    }

    getICS() {
        return ics;
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

    getFileSystem() {
        return fs;
    }

    later() {
        return later;
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
        return Drive;
    }

    addSender(id, email, connection) {
        let messenger = this.messageSender;
        messenger.push({ id, email, connection });
        messenger = this.messageSender;
    }

    addListener(id, credit, imap) {
        this.messageListener.push({ id, credit, imap });
    }

    removeListener(id, credit) {
        let connections = this.messageListener.filter((listener) => {
            if (listener.id == id && listener.credit.user === credit.user)
                listener.imap.end();
            return listener.id !== id && listener.credit.user !== credit.user;
        });
        this.messageListener = connections;
    }

    initListener() {
        console.log('Running listener for emails...');
        Meteor.users.find({ $or: [{ retired: { $exists: false } }, { retired: 0 }] }).fetch().forEach((user) => {
            if (user.profile.emails)
                user.profile.emails.forEach((credit) => {
                    if (credit.status === 'connected')
                        Meteor.call(MessagesAddSender, credit, user._id);
                });
        });
    }

    removeSender(id, email) {
        let connection = {};
        let connections = this.messageSender.filter((sender) => {
            if (sender.id == id && sender.email === email)
                connection = sender;
            return sender.id !== id && sender.email !== email;
        });
        this.messageSender = connections;
        return connection;
    }

    generateReports() {
        var task = new ScheduledTask('at 23:58 pm', function () {
            SettingManager.savePrevReports();
        });
        task.start();
    }

    generateMemberFolders() {
        Drive.init();
        if (Meteor.settings.public.oAuth.google.folders)
            Meteor.users.find({ $or: [{ 'profile.retired': 0 }, { 'profile.retired': { $exists: false } }], 'profile.role': { $ne: 0 } }).fetch().forEach((user) => {
                if (!user.profile.drive) {
                    let fileResource = Drive.newFolder(
                        `${user.profile.first || user.username}-${user.profile.last}-${Meteor.settings.public.config.title}`,
                        [Meteor.settings.public.oAuth.google.folders[1].id],
                        'application/vnd.google-apps.folder'
                    );
                    if (fileResource)
                        Meteor.users.update({ _id: user._id }, { $set: { 'profile.drive': fileResource.id } });
                }
            });
    }

    run() {
        console.log('Initializing server setup...');
        let appVersion = 'MeteorJS + ReactJS';
        console.log(`Version: ${appVersion}`);
        console.log(`Meteor Version: ${Meteor.release}`);
        console.log('Running server scheduled events...');
        later.date.localTime();
        this.generateReports();
        this.generateMemberFolders();
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