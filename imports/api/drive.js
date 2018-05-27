import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted } from './classes/Const';
import { check } from 'meteor/check';

export const DriveGetFiles = 'drive_get_files';
export const DriveGetToken = 'drive_get_token';
export const DriveInsertPermission = 'drive_insert_permission';
export const DriveRemoveFile = 'drive_remove_file';

if (Meteor.isServer) {
    functions[DriveGetFiles] = function (data) {
        return server.getDrive().getFiles(data);
    }
    functions[DriveGetToken] = function () {
        return server.getDrive().getToken();
    }
    functions[DriveInsertPermission] = function (file, value, type, role) {
        try {
            check(this.userId, String);
            check(file, Object);
            return server.getDrive().insertPermission(file, value, type, role);
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
                return server.getDrive().removeFile(id, this.userId, undo);
            throw new Meteor.Error(403, 'Unauthorized!');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
}