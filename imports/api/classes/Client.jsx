import { Accounts } from 'meteor/accounts-base';
import { ROLES } from './Const';
import { UsersSendVerificationLink, UsersRegister, UsersResetLink, UsersAddEmail, UsersRemoveEmail, UsersDefaultEmail, UsersTimezone, UsersToggleMute, UsersGetRetired, UsersChangeRole, UsersRetire, UsersRemove, UpdateUserLogin } from '../users';
import { DriveGetFiles, DriveGetToken, DriveInsertPermission, DriveRemoveFile, DriveMoveToFolder, DriveCreateFolder, DriveSupervisorPermission, DriveRenameFile, DriveCopyFile, DriveNewFolder, DrivePST } from '../drive';
import { FormsSave, GetForm, DeleteForm, FormsSubmit, FormHeaders } from '../forms';
import { CategoriesAdd, CategoriesRemove } from '../categories';
import { MessagesAddSender, MessagesSend, MessagesRemoveSender, MessagesRemove, MessagesRead, MessagesImport, MessagesSaveTemplate, MessagesGetTemplate, MessagesDeleteTemplate } from '../messages';
import { CandidatesGetId, CandidatesInfo, CandidatesStats, CandidatesClaim, CandidatesUnclaim, CandidatesTransferClaim, CandidatesFollower, CandidatesAddInfo, CandidatesAddFileStats, CandidatesRemoveFileStats, CandidatesStatus } from '../candidates';
import { RecordJob, GetPostingStat, SettingsSave, GetReports } from '../settings';
import { PSTFiles } from '../files';
import '../../ui/components/extras/MediaUploader.js';

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
        this.PST = new PST();
    }
}

class Auth {
    constructor() { }
    accountLogin(email, password, callback) {
        Meteor.loginWithPassword(email, password, (err) => {
            callback(err);
            if(!err){
                Meteor.call(UpdateUserLogin);
            }
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
    retire(id, unRetire, callback) {
        Meteor.call(UsersRetire, id, unRetire, (err) => {
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
    constructor() {
        this.drive_uploading = null;
        this.setProgress = null;
        this.apiKey = Meteor.settings.public.oAuth.google.apiKey;
        this.clientId = Meteor.settings.public.oAuth.google.clientId;
        this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.scope = 'https://www.googleapis.com/auth/drive';
        this.auth = null;
        this.api = null;
        this.client = null;
        this.pickerApiLoaded = null;
        this.email = '';
    }
    init(callback) {
        $.getScript('https://apis.google.com/js/api.js', () => {
            this.api = window.gapi;
            this.api.load('client:auth2', () => {
                this.client = window.gapi.client;
                this.client.init({
                    apiKey: this.apiKey,
                    clientId: this.clientId,
                    discoveryDocs: this.docs,
                    scope: this.scope
                }).then(() => {
                    this.auth = this.api.auth2.getAuthInstance();
                    callback();
                });
            });
            this.api.load('picker', () => {
                this.pickerApiLoaded = true;
            });
        });
    }
    createPicker(token, failCallback, successCallback) {
        if (this.pickerApiLoaded && token) {
            let google = window.google;
            let picker = new google.picker.PickerBuilder().
                addView(google.picker.ViewId.DOCS).
                setOAuthToken(token).
                setDeveloperKey(this.apiKey).
                setCallback(
                    (data) => {
                        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                            let doc = data[google.picker.Response.DOCUMENTS][0];
                            if (/\.(gdrive)$/i.test(doc.name))
                                Meteor.call(DrivePST, doc, (err) => {
                                    if (err)
                                        failCallback('Problem on uploading PST File');
                                    else
                                        successCallback('PST file selected! Importing started...');
                                });
                            else
                                failCallback('Invalid File Type!');
                        }
                    }
                ).
                build();
            picker.setVisible(true);
        }
    }
    sync(drive, callback) {
        let pageToken = '';
        let syncI = 0;
        let syncFunc = () => {
            let options = {
                'method': 'GET',
                'path': '/drive/v3/files',
                'params': {
                    'fields': 'files, nextPageToken',
                    'q': `trashed=false and not appProperties has { key='synced' and value='true' }`,
                    'pageSize': 1, //1000
                    'pageToken': pageToken
                }
            };
            let request = this.client.request(options);
            request.execute((response) => {
                pageToken = response.nextPageToken;
                if (response.files) {
                    let files = response.files.filter((file) => file.ownedByMe);
                    if (files.length) {
                        let i = 0;
                        let interval = setInterval(() => {
                            if (i < files.length) {
                                let file = files[i];
                                i++;
                                this.syncToMain(file.id, file.name, [drive]);
                            } else
                                clearInterval(interval);
                        }, 1000);
                    }
                    else {
                        if (pageToken)
                            setTimeout(() => {
                                syncI++;
                                console.log("Syncing #" + syncI);
                                syncFunc();
                            }, Meteor.settings.public.oAuth.google.interval);
                        else
                            callback();
                    }
                }
                callback();
            });
        };
        syncFunc();
    }
    syncToMain(fileId, name, parents) {
        let reqOptions = {
            'method': 'POST',
            'path': `/drive/v3/files/${fileId}/copy`,
            'params': {
                fileId
            },
            'body': {
                name,
                parents
            }
        };
        let request = this.client.request(reqOptions);
        request.execute((res) => {
            if (res.id) {
                reqOptions = {
                    'method': 'PATCH',
                    'path': `/drive/v3/files/${fileId}`,
                    'params': {
                        fileId: fileId
                    },
                    'body': {
                        appProperties: {
                            synced: true
                        }
                    }
                };
                request = this.client.request(reqOptions);
                request.execute((patchResult) => {
                    console.log('patch 1', patchResult);
                    Meteor.call(DriveCopyFile, res.id, res.name, parents, (err, result) => {
                        console.log('copy 2', result.data);
                        if (!err) {
                            reqOptions = {
                                'method': 'DELETE',
                                'path': `/drive/v3/files/${res.id}`,
                                'params': {
                                    fileId: res.id
                                }
                            };
                            request = this.client.request(reqOptions);
                            request.execute((deleteResult) => {
                                console.log('delete 1', deleteResult);
                                reqOptions = {
                                    'method': 'PATCH',
                                    'path': `/drive/v3/files/${result.data.id}`,
                                    'params': {
                                        fileId: result.data.id
                                    },
                                    'body': {
                                        appProperties: {
                                            synced: true
                                        }
                                    }
                                };
                                request = this.client.request(reqOptions);
                                request.execute((permissionResult) => {
                                    console.log('patch 2', permissionResult);
                                });
                            });
                        }
                    });
                });
            }
        });
    }
    newFolder(parent, callback) {
        Meteor.call(DriveNewFolder, 'New Folder', [parent[parent.length - 1]], 'application/vnd.google-apps.folder', (err, result) => {
            callback(err, result);
        });
    }
    paste(file, parent, callback) {
        Meteor.call(DriveCopyFile, file.id, `Copy of ${file.name}`, parent, (err, result) => {
            callback(err, result);
        });
    }
    setEmail(user) {
        this.email = this.auth.currentUser.get().getBasicProfile().getEmail();
        if (user.role === ROLES.ADMIN || user.role === ROLES.SUPERUSER)
            this.insertAdminPermission({ id: Meteor.settings.public.oAuth.google.folder }, this.email, 'user', 'writer', () => { });
        if (user.role === ROLES.SUPERVISOR)
            this.insertSupervisorPermission(this.email, 'user', 'writer', () => { });
    }
    setDrive(callback) {
        this.addFolder(this.email, (err, res) => {
            callback(err, res);
        });
    }
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
    insertSupervisorPermission(value, type, role, callback) {
        Meteor.call(DriveSupervisorPermission, value, type, role, (err, result) => {
            callback(err, result);
        });
    }
    insertAdminPermission(data, value, type, role, callback) {
        Meteor.call(DriveInsertPermission, data, value, type, role, (err, result) => {
            callback(err, result);
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
    moveToFolder(fileId, folderId) {
        Meteor.call(DriveMoveToFolder, fileId, folderId);
    }
    initiateUpload(data) {
        let uploader = new MediaUploader({
            file: data.file,
            token: data.token,
            metadata: data.metadata,
            onError: data.onError,
            onComplete: (response) => {
                data.onComplete(response);
                this.setProgress = null;
                this.drive_uploading = null;
            },
            onProgress: (event) => {
                let progress = (event.loaded / event.total * 100);
                data.onProgress(progress);
                this.updateUploading(progress);
                if (this.setProgress)
                    this.setProgress(progress);
            },
            params: {
                convert: false,
                ocr: false
            }
        });
        uploader.upload();
    }
    updateUploading(progress) {
        this.drive_uploading = progress;
    }
    setOnProgress(func) {
        this.setProgress = func;
    }
    addFolder(email, callback) {
        Meteor.call(DriveCreateFolder, email, (err, result) => {
            callback(err, result);
        });
    }
    rename(data, callback) {
        Meteor.call(DriveRenameFile, data.name, data.fileId, (err, result) => {
            callback(err, result);
        });
    }
}

class PST {
    constructor() {
        this.pst_uploading = null;
        this.setProgress = null;
    }
    initiateUpload(data) {
        // let uploader = new MediaUploader({
        //     file: data.file,
        //     token: data.token,
        //     metadata: data.metadata,
        //     onError: data.onError,
        //     onComplete: data.onComplete,
        //     onProgress: (event) => {
        //         let progress = (event.loaded / event.total * 100);
        //         data.onProgress(progress);
        //         this.updateUploading(progress);
        //         if (this.setProgress)
        //             this.setProgress(progress);
        //     },
        //     params: {
        //         convert: false,
        //         ocr: false
        //     }
        // });
        // uploader.upload();
        PSTFiles.insert({
            file: data.file,
            onStart: data.onStart,
            onUploaded: data.onUploaded,
            onAbort: data.onAbort,
            onError: data.onError,
            onProgress: (progress) => {
                data.onProgress(progress);
                this.updateUploading(progress);
                if (this.setProgress)
                    this.setProgress(progress);
            },
            onBeforeUpload: () => {
                if (/pst/i.test(data.file.extension))
                    return true;
                else {
                    return 'Invalid file type';
                }
            }
        });
    }
    updateUploading(progress) {
        this.pst_uploading = progress;
    }
    setOnProgress(func) {
        this.setProgress = func;
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
        Meteor.call(GetForm, data.id, data.applicant, (err, result) => {
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
    remove(data, callback) {
        Meteor.call(MessagesRemove, data, (err) => {
            callback(err);
        });
    }
    read(data) {
        Meteor.call(MessagesRead, data);
    }
    import(file, callback) {
        Meteor.call(MessagesImport, file, (err, result) => {
            if (err && callback)
                callback(err, result);
        });
    }
    saveTemplate(data, callback) {
        Meteor.call(MessagesSaveTemplate, data.id, data.name, data.template, (err, result) => {
            callback(err, result);
        });
    }
    getTemplate(id, callback) {
        Meteor.call(MessagesGetTemplate, id, (err, result) => {
            callback(err, result);
        });
    }
    deleteTemplate(id, callback) {
        Meteor.call(MessagesDeleteTemplate, id, (err, result) => {
            callback(err, result);
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

    addInfo(data, callback) {
        Meteor.call(CandidatesAddInfo, data.id, data.info, data.value, (err, result) => {
            callback(err, result);
        });
    }

    addFileStats(data, callback) {
        Meteor.call(CandidatesAddFileStats, data.id, data.info, data.value, (err, result) => {
            callback(err, result);
        });
    }

    removeFileStats(data, callback) {
        Meteor.call(CandidatesRemoveFileStats, data.id, data.info, (err, result) => {
            callback(err, result);
        });
    }

    status(id, flag, callback) {
        Meteor.call(CandidatesStatus, id, flag, (err, result) => {
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

    setData(data) {
        this.barChart.setData(data);
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

    getReports(callback) {
        Meteor.call(GetReports, (err, data) => {
            callback(err, data);
        });
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