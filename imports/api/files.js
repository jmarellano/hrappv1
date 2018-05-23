import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';
import ClamAv from './classes/ClamAv';
import path from 'path';

let isWindows = (process.env.OS && process.env.OS === 'Windows_NT');
let separator = isWindows ? '\\' : '/';
let basepath = path.resolve('.').split(separator + '.meteor')[0] + separator;
PATH = {
    BASE: basepath,
    UPLOAD: `${separator}data${separator}uploads${separator}`,
    INFECTED: `${separator}data${separator}infected${separator}`,
    THUMB: `${separator}data${separator}uploads${separator}thumb${separator}`,
    GIT: `${basepath}.git${separator}`,
    METEOR: `${basepath}.meteor${separator}`
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
            new ClamAv().scanFile(EmailFiles.link(fileRef), (data) => {
                console.log(data);
            })
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