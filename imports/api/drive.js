import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ROLES, isPermitted } from './classes/Const';
import { check } from "meteor/check";

export const DriveGetFiles = 'drive_get_files';
export const DriveGetToken = 'drive_get_token';
export const DriveInsertPermission = 'drive_insert_permission';
export const DriveRemoveFile = 'drive_remove_file';

if (Meteor.isServer) {
    import Future from 'fibers/future';
    import Drive from './classes/Drive';
    Drive.init();
    functions[DriveGetFiles] = function (data) {
        return Drive.getFiles(data);
    }
    functions[DriveGetToken] = function () {
        return Drive.getToken();
    }
    functions[DriveInsertPermission] = function (file, value, type, role) {
        try {
            check(this.userId, String);
            check(file, Object);
            return Drive.insertPermission(file, value, type, role);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[DriveRemoveFile] = function (id, undo) {
        try {
            check(this.userId, String);
            check(id, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_FILES))
                return Drive.removeFile(id, undo);
            throw new Meteor.Error(403, "Unauthorized!");
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
}