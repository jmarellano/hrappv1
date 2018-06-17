import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const DriveGetFiles = 'drive_get_files';
export const DriveGetToken = 'drive_get_token';
export const DriveSupervisorPermission = 'drive_supervisor_permission';
export const DriveInsertPermission = 'drive_insert_permission';
export const DriveRemoveFile = 'drive_remove_file';
export const DriveAddFolder = 'drive_add_folder';
export const DriveMoveToFolder = 'drive_move_to_folder';
export const DriveInitiateUpload = 'drive_initiate_upload';
export const DriveGetAccessToken = 'drive_get_access_token';
export const DriveCreateFolder = 'drive_create_folder';
export const DriveSyncMain = 'drive_sync_main';
export const DriveRenameFile = 'drive_rename_file';
export const DriveCopyFile = 'drive_copy_file';
export const DriveNewFolder = 'drive_new_folder';

if (Meteor.isServer) {
    functions[DriveNewFolder] = function (name, parent, mimeType) {
        return server.getDrive().newFolder(name, parent, mimeType);
    }
    functions[DriveCopyFile] = function (id, name, parent) {
        return server.getDrive().copy(id, name, parent);
    }
    functions[DriveRenameFile] = function (name, fileId) {
        return server.getDrive().rename(name, fileId);
    }
    functions[DriveSyncMain] = function (id, name, parents) {
        return server.getDrive().syncMain(id, name, parents);
    }
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
        if (!Meteor.user().profile.drive) {
            let folder = functions[DriveAddFolder].call(this, Meteor.user().username, email);
            if (folder)
                return Meteor.users.update({ _id: this.userId }, { $set: { 'profile.drive': folder.id } });
        }
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
    functions[DriveSupervisorPermission] = function (value, type, role) {
        try {
            check(this.userId, String);
            Meteor.users.find({ supervised_by: this.userId }).fetch().forEach((user) => {
                if (!user.profile.drive)
                    return true;
                else server.getDrive().insertPermission(user.profile.drive, value, type, role);
            });
            return true;
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
            return server.getDrive().removeFile(id, this.userId, undo);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
}