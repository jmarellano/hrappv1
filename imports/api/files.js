import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';
import ClamAv from './classes/ClamAv';

let isWindows = (process.env.OS && process.env.OS === 'Windows_NT');
let separator = (process.env.OS && process.env.OS === 'Windows_NT') ? '\\' : '/';
PATH = {
    UPLOAD: `${separator}data${separator}uploads${separator}`,
    INFECTED: `${separator}data${separator}infected${separator}`,
};
let EmailFiles = new FilesCollection({
    debug: false,
    collectionName: Meteor.settings.public.collections.emailFiles || 'emailfiles',
    permissions: '0774',
    parentDirPermissions: '0774',
    allowClientCode: true,
    storagePath: PATH.UPLOAD,
    onAfterUpload: function (fileRef) {
        if (!isWindows)
            new ClamAv().scanFile(EmailFiles.link(fileRef));
        return true;
    }
});
let PSTFiles = new FilesCollection({
    debug: false,
    collectionName: Meteor.settings.public.collections.pstFiles || 'pstfiles',
    permissions: '0774',
    parentDirPermissions: '0774',
    allowClientCode: true,
    storagePath: PATH.UPLOAD
});
if (Meteor.isServer) {
    EmailFiles.allowClient();
    PSTFiles.allowClient();
    Meteor.publish('emailfiles.files.all', function () {
        return EmailFiles.find().cursor;
    });
    Meteor.publish('pstfiles.files.all', function () {
        return PSTFiles.find().cursor;
    });
}
export { EmailFiles, PSTFiles }