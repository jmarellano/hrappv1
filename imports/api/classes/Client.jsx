import { UsersSendVerificationLink, UsersRegister, UsersResetLink, UsersAddEmail, UsersRemoveEmail, UsersDefaultEmail, UsersTimezone, UsersToggleMute, UsersGetRetired, UsersChangeRole, UsersRetire, UsersRemove } from '../users';
import { DriveGetFiles, DriveGetToken, DriveInsertPermission, DriveRemoveFile } from '../drive';
import { FormsSave, GetForm, DeleteForm } from '../forms';
import { CategoriesAdd, CategoriesRemove } from '../categories';

export default class Client {
    constructor() {
        this.Account = new Account();
        this.Auth = new Auth();
        this.Drive = new Drive();
        this.Form = new Form();
        this.Category = new Category();
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
}

class Drive {
    constructor() { }
    getFiles(data, callback) {
        Meteor.call(DriveGetFiles, data, (err, data) => {
            callback(err, data);
        });
    }
    getToken(callback) {
        Meteor.call(DriveGetToken, (err, data) => {
            callback(err, data);
        });
    }
    insertPermission(data, callback) {
        Meteor.call(DriveInsertPermission, data, null, "anyone", "reader", (err, data) => {
            callback(err, data);
        });
    }
    removeFile(data, undo, callback) {
        Meteor.call(DriveRemoveFile, data.id, undo, (err, data) => {
            callback(err, data);
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
            template: (formBuilder !== null) ? JSON.stringify(formBuilder.getData()) : ""
        }, (err, data) => {
            callback(err, data);
        });
    }
    getForm(data, callback) {
        Meteor.call(GetForm, data.id, (err, data) => {
            callback(err, data);
        });
    }
    deleteForm(data, callback) {
        Meteor.call(DeleteForm, data.id, (err, data) => {
            callback(err, data);
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
