import { Accounts } from 'meteor/accounts-base';
import { UsersSendVerificationLink, UsersRegister, UsersResetLink, UsersAddEmail, UsersRemoveEmail, UsersDefaultEmail, UsersTimezone, UsersToggleMute, UsersGetRetired, UsersChangeRole, UsersRetire, UsersRemove } from '../users';
import { DriveGetFiles, DriveGetToken, DriveInsertPermission, DriveRemoveFile } from '../drive';
import { FormsSave, GetForm, DeleteForm, FormsSubmit, FormHeaders } from '../forms';
import { CategoriesAdd, CategoriesRemove } from '../categories';
import { MessagesAddSender, MessagesSend, MessagesRemoveSender } from '../messages';
import { CandidatesGetId, CandidatesInfo, CandidatesStats, CandidatesClaim, CandidatesUnclaim, CandidatesTransferClaim, CandidatesFollower } from '../candidates';
import { RecordJob, GetPostingStat, SettingsSave } from '../settings';

export default class Client {
    constructor() {
        this.Account = new Account();
        this.Auth = new Auth();
        this.Drive = new Drive();
        this.Form = new Form();
        this.Category = new Category();
        this.Message = new Message();
        this.Candidate = new Candidate();
        this.Statistics = new Statistics();
        this.Settings = new Settings();
    }
}

class Auth {
    constructor() { }
    accountLogin(email, password, callback) {
        Meteor.loginWithPassword(email, password, (err) => {
            callback(err);
        });
    }
    sendVerificationLink(data, callback) {
        Meteor.call(UsersSendVerificationLink, data, (err) => {
            callback(err);
        });
    }
    accountRegister(data, callback) {
        Meteor.call(UsersRegister, data, (err) => {
            callback(err);
        });
    }
    accountSendResetLink(data, callback) {
        Meteor.call(UsersResetLink, data, (err) => {
            callback(err);
        });
    }
    accountResetPassword(data, callback) {
        Accounts.resetPassword(data.url, data.password, (err) => {
            callback(err);
        });
    }
}

class Account {
    constructor() { }
    changePassword(data, callback) {
        Accounts.changePassword(data.old, data.new, (err) => {
            callback(err);
        });
    }
    addEmail(email, userId, callback) {
        Meteor.call(UsersAddEmail, email, userId, (err) => {
            callback(err);
        });
    }
    removeEmail(email, user, callback) {
        Meteor.call(UsersRemoveEmail, email, user, (err) => {
            callback(err);
        });
    }
    setDefaultEmail(index, callback) {
        Meteor.call(UsersDefaultEmail, index, (err) => {
            callback(err);
        });
    }
    setTimezone(timezone, callback) {
        Meteor.call(UsersTimezone, timezone, (err) => {
            callback(err);
        });
    }
    getRetiredUsers(callback) {
        Meteor.call(UsersGetRetired, (err, data) => {
            callback(data);
        });
    }
    changeRole(data, callback) {
        Meteor.call(UsersChangeRole, data.role, data.id, (err) => {
            callback(err);
        });
    }
    retire(id, callback) {
        Meteor.call(UsersRetire, id, (err) => {
            callback(err);
        });
    }
    remove(id, callback) {
        Meteor.call(UsersRemove, id, (err) => {
            callback(err);
        });
    }
    toggleMute(callback) {
        Meteor.call(UsersToggleMute, (err) => {
            callback(err);
        });
    }
}

class Drive {
    constructor() { }
    getFiles(data, callback) {
        Meteor.call(DriveGetFiles, data, (err, result) => {
            callback(err, result);
        });
    }
    getToken(callback) {
        Meteor.call(DriveGetToken, (err, data) => {
            callback(err, data);
        });
    }
    insertPermission(data, callback) {
        Meteor.call(DriveInsertPermission, data, null, 'anyone', 'reader', (err, result) => {
            callback(err, result);
        });
    }
    removeFile(data, undo, callback) {
        Meteor.call(DriveRemoveFile, data.id, undo, (err, result) => {
            callback(err, result);
        });
    }
}

class Form {
    constructor() { }
    save(data, callback) {
        let id = data.id,
            formBuilder = data.formBuilder;
        Meteor.call(FormsSave, {
            _id: id,
            name: formBuilder.getData().form.title,
            template: (formBuilder !== null) && JSON.stringify(formBuilder.getData())
        }, (err, result) => {
            callback(err, result);
        });
    }
    getForm(data, callback) {
        Meteor.call(GetForm, data.id, (err, result) => {
            callback(err, result);
        });
    }
    deleteForm(data, callback) {
        Meteor.call(DeleteForm, data.id, (err, result) => {
            callback(err, result);
        });
    }
    submit(path, location, data, version, callback) {
        Meteor.call(FormsSubmit, {
            _id: path[2],
            location: { latitude: location.latitude, longitude: location.longitude },
            applicantId: path[3],
            obj: data,
            version: version
        }, (err, result) => {
            callback(err, result);
        });
    }
    getHeaders(id, version, callback) {
        Meteor.call(FormHeaders, id, version, (err, result) => {
            callback(err, result);
        });
    }
}

class Category {
    constructor() {

    }

    add(data, callback) {
        Meteor.call(CategoriesAdd, data, (err) => {
            callback(err);
        });
    }

    remove(categoryId, callback) {
        Meteor.call(CategoriesRemove, categoryId, (err) => {
            callback(err);
        });
    }
}

class Message {
    constructor() {

    }
    addSender(data, callback) {
        Meteor.call(MessagesAddSender, data.credit, data.id, (err) => {
            callback(err, data);
        });
    }
    removeSender(data, callback) {
        Meteor.call(MessagesRemoveSender, data.credit, data.id, (err) => {
            callback(err);
        });
    }
    sendMessage(data, callback) {
        Meteor.call(MessagesSend, data, (err) => {
            callback(err);
        });
    }
}

class Candidate {
    constructor() {

    }

    getId(data, callback) {
        Meteor.call(CandidatesGetId, data, (err, result) => {
            callback(err, result);
        });
    }

    changeInfo(data, callback) {
        Meteor.call(CandidatesInfo, data, (err, result) => {
            callback(err, result);
        });
    }

    changeStats(data, contact, callback) {
        Meteor.call(CandidatesStats, data, contact, (err, result) => {
            callback(err, result);
        });
    }

    claim(id, callback) {
        Meteor.call(CandidatesClaim, id, (err, result) => {
            callback(err, result);
        });
    }

    unclaim(id, callback) {
        Meteor.call(CandidatesUnclaim, id, (err, result) => {
            callback(err, result);
        });
    }

    transferClaim(data, callback) {
        Meteor.call(CandidatesTransferClaim, data.id, data.user, (err, result) => {
            callback(err, result);
        });
    }

    removeFollower(data, callback) {
        Meteor.call(CandidatesFollower, data.id, data.user, false, (err, result) => {
            callback(err, result);
        });
    }

    addFollower(data, callback) {
        Meteor.call(CandidatesFollower, data.id, data.user, true, (err, result) => {
            callback(err, result);
        });
    }
}

class Statistics {
    constructor() {
        this.lineData = [];
        this.barData = [];
        this.recording = false;
        this.barChart = null;
        this.lineChart = null;
    }

    setLineData(data) {
        this.lineData = data;
    }

    setBarData(data) {
        this.barData = data;
    }

    getDataFromServer(opt, callback) {
        Meteor.call(GetPostingStat, opt, (err, data) => {
            if (!err) {
                if (this.barChart) {
                    this.barChart.setData(data);
                } else if (this.lineChart) {
                    this.lineChart.setData(data);
                }
            } else {
                console.log(err);
            }
            if (callback)
                callback();
        });
    }

    createLineGraph(options) {
        this.lineChart = new Morris.Line({
            data: this.lineData,
            ...options
        });
    }

    createBarGraph(options) {
        this.barChart = new Morris.Bar({
            data: this.barData,
            ...options
        });
    }

    recordPosting(data) {
        if (!this.recording) {
            this.recording = true;
            Meteor.call(RecordJob, data, (err) => {
                this.recording = false;
                if (err)
                    console.log(err);
            });
        }
    }
}

class Settings {
    constructor() {

    }

    save(settings, callback) {
        Meteor.call(SettingsSave, { emailGetInterval: settings.interval, country: settings.country }, (err) => {
            callback(err);
        });
    }
}