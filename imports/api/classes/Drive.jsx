import { google } from 'googleapis';
import { HTTP } from 'meteor/http';

class Drive {
    constructor() {
        this.jwt = null;
    }
    init() {
        this.setJWT();
        // this.getFiles().files.forEach((file) => {
        //     this.deleteFile(file.id);
        // });
    }
    setJWT() {
        this.jwt = new google.auth.JWT(
            Meteor.settings.drive.acc,
            null,
            Meteor.settings.drive.privateKey,
            [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.metadata',
                'https://www.googleapis.com/auth/drive.appdata'
            ],
            null
        );
        this.drive = google.drive({ version: 'v3', auth: this.jwt });
    }
    getToken() {
        let future = server.createFuture();
        if (this.jwt) {
            this.jwt.authorize(Meteor.bindEnvironment(function (err, tokens) {
                if (err) {
                    console.log(err);
                    future.return(false);
                }
                future.return(tokens);
            }));
            return future.wait();
        }
        return false;
    }
    getFiles(options = {}) {
        let future = server.createFuture();
        let retval = {};
        let query = {
            q: options.q || '',
            fields: options.fields || 'nextPageToken, files',
            pageToken: options.pageToken || '',
            pageSize: options.pageSize || 20,
            orderBy: options.orderBy
        };
        this.drive.files.list(query, function (err, res) {
            if (err) {
                throw new Meteor.Error(err);
            } else {
                retval.files = res.data.files;
                retval.pageToken = res.data.nextPageToken;
            }
            future.return(retval);
        });
        return future.wait();
    }
    removeFile(id, userId, undo) {
        this.getToken();
        let myFuture = server.createFuture();
        let options = {
            headers: {
                'Authorization': 'Bearer ' + this.jwt.credentials.access_token
            },
            data: { 'properties': { 'trashedBy': undo ? null : userId }, 'trashed': !undo }
        };
        HTTP.call('PATCH', 'https://www.googleapis.com/drive/v3/files/' + id, options, function (err, res) {
            if (err && err !== null)
                myFuture.throw(new Meteor.Error(err.message));
            myFuture.return(res);
        });
        return myFuture.wait();
    }
    deleteFile(id) {
        this.getToken();
        let myFuture = server.createFuture();
        let options = {
            headers: {
                'Authorization': 'Bearer ' + this.jwt.credentials.access_token
            }
        };
        HTTP.call('DELETE', 'https://www.googleapis.com/drive/v3/files/' + id, options, function (err, res) {
            if (err && err !== null)
                myFuture.throw(new Meteor.Error(err.message));
            myFuture.return(res);
        });
        return myFuture.wait();
    }
    insertPermission(file, value, type, role) {
        let body = {
            'role': role,
            'type': type
        };
        let params = {
            'fileId': file.id,
            'resource': body,
            'sendNotificationEmails': false,
            auth: this.jwt
        };
        if (value !== null) {
            body.emailAddress = value;
        }
        let future = server.createFuture();
        this.drive.permissions.create(params, function (err, response) {
            future.return(response.data);
        });
        return future.wait();
    }
    createFolder(name, email) {
        let self = this;
        this.getToken();
        let myFuture = server.createFuture();
        let options = {
            headers: {
                'Authorization': 'Bearer ' + this.jwt.credentials.access_token
            },
            data: {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [Meteor.settings.public.oAuth.google.folder]
            }
        };
        let search = {
            headers: {
                'Authorization': 'Bearer ' + this.jwt.credentials.access_token
            },
            params: {
                'q': "name contains '" + name + "' and '" + Meteor.settings.public.oAuth.google.folder + "' in parents",
                'fields': 'files',
                'pageSize': 1
            }
        };
        let continueProcess = false;
        HTTP.call('GET', 'https://www.googleapis.com/drive/v3/files/', search, function (err, res) {
            let process = false;
            if (err && err !== null) {
                console.error(err);
                myFuture.throw(new Meteor.Error(err.message));
            }
            if (!res.data.files[0])
                process = true;
            myFuture.return(process);
        });
        continueProcess = myFuture.wait();
        myFuture = server.createFuture();
        if (continueProcess)
            HTTP.call('POST', 'https://www.googleapis.com/drive/v3/files/', options, function (error, response) {
                if (error && error !== null) {
                    console.error(error);
                    myFuture.throw(new Meteor.Error(error.message));
                }
                self.insertPermission({ id: response.data.id }, email, 'user', 'writer');
                self.insertPermission({ id: response.data.id }, Meteor.settings.public.oAuth.google.owner, 'user', 'writer');
                myFuture.return(response.data);
            });
        else return false;
        return myFuture.wait();
    }
    moveToFolder(fileId, folderId) {
        let params = {
            'fileId': fileId.id,
            'fields': 'parents',
            auth: this.jwt
        };
        let params2 = {
            fileId: fileId,
            addParents: folderId,
            fields: 'id, parents',
            auth: this.jwt
        }
        let future = server.createFuture();
        this.drive.files.get(params, function (err, response) {
            let previousParents = response.data.parents.join(',');
            params2.removeParents = previousParents;
            this.drive.files.update(params2);
            future.return(true);
        });
        return future.wait();
    }
}

export default new Drive();