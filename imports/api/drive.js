import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted } from './classes/Const';
import { check } from 'meteor/check';

export const DriveGetFiles = 'drive_get_files';
export const DriveGetToken = 'drive_get_token';
export const DriveInsertPermission = 'drive_insert_permission';
export const DriveRemoveFile = 'drive_remove_file';
export const DriveAddFolder = 'drive_add_folder';
export const DriveMoveToFolder = 'drive_move_to_folder';
export const DriveInitiateUpload = 'drive_initiate_upload';
export const DriveGetAccessToken = 'drive_get_access_token';
export const DriveCreateFolder = 'drive_create_folder';

if (Meteor.isServer) {
    functions[DriveMoveToFolder] = function (fileId, folderId) {
        return server.getDrive().moveToFolder(fileId, folderId);
    }
    functions[DriveGetFiles] = function (data) {
        return server.getDrive().getFiles(data);
    }
    functions[DriveGetToken] = function () {
        return server.getDrive().getToken();
    }
    functions[DriveAddFolder] = function (name, email) {
        return server.getDrive().createFolder(name, email);
    }
    functions[DriveCreateFolder] = function (email) {
        check(this.userId, String);
        let folder = functions[DriveAddFolder].call(this, Meteor.user().username, email);
        if (folder)
            return Meteor.users.update({ _id: this.userId }, { $set: { 'profile.drive': folder.id } });
        return 1;
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