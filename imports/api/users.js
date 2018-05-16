import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ROLES, isPermitted, RETIRED, VERIFIED, VALUE } from './classes/Const';
import { check } from "meteor/check";

export const ValidUsers = 'users_valid';
export const UsersRegister = 'users_register';
export const UsersSendVerificationLink = 'users_sendVerificationLink';
export const UsersResetLink = 'users_resetLink';
// export const UsersSave = 'users_save';
// export const UsersRemove = 'users_remove';
export const UsersAddEmail = 'users_add_email';
export const UsersRemoveEmail = 'users_remove_email';
export const UsersDefaultEmail = 'users_default_email';
export const UsersTimezone = 'users_timezone';
export const UsersToggleMute = 'users_toggle_mute';
export const UsersGetRetired = 'users_get_retired';
export const UsersChangeRole = 'users_change_role';
export const UsersRetire = 'users_retire';
export const UsersRemove = 'users_remove';

// export const UsersIsPermitted = 'users_isPermitted';
// export const UsersToggleMute = 'users_toggleMute';
// export const UsersFirstLogin = 'users_first';
// export const UsersPubValid = 'users_valid';
// export const UsersPubStaffs = 'users_staffs';

if (Meteor.isServer) {
    let Future = require('fibers/future');
    functions[UsersRegister] = function (data) {
        try {
            check(data, Object);
            check(data.email, String);
            check(data.password, String);
            check(data.username, String);
            check(data.first, String);
            check(data.last, String);
            let user = {};
            user.username = data.username;
            user.emails = [{ address: data.email, verified: VERIFIED.FALSE }];
            user.profile = { username_sort: data.username.toLowerCase(), first: data.first, last: data.last, role: ROLES.GUESTS, retired: RETIRED.FALSE };
            user.email = data.email;
            user.password = data.password;
            Accounts.createUser(user);
        } catch (err) {
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersSendVerificationLink] = function (data) {
        try {
            check(data, Object);
            check(data.email, String);
            let user = Accounts.findUserByEmail(data.email),
                emailInfo = Meteor.settings.config.email;
            Accounts.emailTemplates.from = emailInfo.info.from;
            Accounts.emailTemplates.siteName = emailInfo.info.siteName;
            Accounts.emailTemplates.verifyEmail = {
                subject() {
                    return `[${Meteor.settings.public.config.title}] Verify Your Email Address`;
                },
                text(user, url) {
                    let emailAddress = user.emails[0].address;
                    let urlWithoutHash = url.replace('#/', '');
                    return emailBody = `To verify your email address (${emailAddress}) 
                visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, 
                please ignore this email. If you feel something is wrong, 
                please contact our support team: ${emailInfo.info.supportEmail}.`;
                }
            };
            if (user)
                return Accounts.sendVerificationEmail(user._id);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersResetLink] = function (data) {
        try {
            check(data, Object);
            check(data.email, String);
            let user = Accounts.findUserByEmail(data.email),
                emailInfo = Meteor.settings.config.email,
                myFuture = new Future();
            if (typeof user !== 'undefined') {
                Accounts.emailTemplates.from = emailInfo.info.from;
                Accounts.emailTemplates.siteName = emailInfo.info.siteName;
                Accounts.emailTemplates.resetPassword.subject = function () {
                    return `[${Meteor.settings.public.config.title}] Reset Password Link`;
                };
                Accounts.emailTemplates.resetPassword.text = Accounts.emailTemplates.resetPassword.html = function (user, url) {
                    return `Reset Password link for [${Meteor.settings.public.config.title}]: ` + url.replace('/#/reset-password', '/reset');
                };
                Accounts.sendResetPasswordEmail(user._id, data.email);
                myFuture.return('Reset Link is sent.');
            } else
                throw new Meteor.Error(400, "Email doesn't exist");
            return myFuture.wait();
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersAddEmail] = function (user, userid = this.userId) {
        try {
            check(this.userId, String);
            check(userid, String);
            check(user, Object);
            if (!isPermitted(Meteor.users.findOne({ _id: this.userId }).profile.role, ROLES.MANAGE_EMAILS))
                throw new Meteor.Error(403, 'Not authorized');
            return Meteor.users.update({ _id: userid }, { $push: { 'profile.emails': user } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersRemoveEmail] = function (user, userid = this.userId) {
        try {
            check(this.userId, String);
            check(user, Object);
            check(userid, String);
            return Meteor.users.update({ _id: userid }, { $pull: { 'profile.emails': user } }, { multi: true });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersDefaultEmail] = function (index, userid = this.userId) {
        try {
            check(this.userId, String);
            check(index, Number);
            check(userid, String);
            return Meteor.users.update({ _id: userid }, { $set: { 'profile.default_email': index } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersTimezone] = function (timezone, userid = this.userId) {
        try {
            check(this.userId, String);
            check(userid, String);
            return Meteor.users.update({ _id: userid }, { $set: { 'profile.default_timezone': timezone } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersToggleMute] = function () {
        try {
            check(this.userId, String);
            Meteor.users.update({ _id: this.userId }, { $set: { 'profile.mute': !(Meteor.user().profile && Meteor.user().profile.mute) } })
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersChangeRole] = function (role, id) {
        try {
            check(this.userId, String);
            check(id, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.VIEW_TEAMS)) {
                Meteor.users.update({ _id: id }, { $set: { 'profile.role': role } })
                return ('Changed Role!');
            }
            throw new Meteor.Error(403, "Not authorized");

        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersRetire] = function (id) {
        try {
            check(this.userId, String);
            check(id, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.VIEW_TEAMS)) {
                Meteor.users.update({ _id: id }, { $set: { 'profile.retired': VALUE.TRUE } })
                return ('User Retired!');
            }
            throw new Meteor.Error(403, "Not authorized");

        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersRemove] = function (id) {
        try {
            check(this.userId, String);
            check(id, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.VIEW_TEAMS)) {
                Meteor.users.remove({ _id: id })
                return ('User Removed!');
            }
            throw new Meteor.Error(403, "Not authorized");
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[UsersGetRetired] = function () {
        try {
            check(this.userId, String);
            return Meteor.users.find({ 'profile.retired': VALUE.TRUE }, { sort: { username_sort: 1 } }).fetch();
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    Meteor.publish(ValidUsers, function () {
        try {
            return Meteor.users.find({ 'profile.retired': VALUE.FALSE, 'emails.0.verified': true }, { sort: { username_sort: 1 } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    });
}