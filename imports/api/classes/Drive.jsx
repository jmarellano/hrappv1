import { google } from 'googleapis';
import HTTP from 'meteor/http';

class Drive {
    constructor() {
        this.jwt = null;
    }
    init() {
        this.setJWT();
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
            pageSize: options.pageSize || 1
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
    removeFile(id, undo = false) {
        let myFuture = server.createFuture();
        let options = {
            headers: {
                'Authorization': 'Bearer ' + this.jwt.credentials.access_token
            },
            data: { 'properties': { 'trashedBy': undo ? null : this.userId }, 'trashed': !undo }
        };
        HTTP.call('PATCH', 'https://www.googleapis.com/drive/v3/files/' + id, options, function (err, res) {
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
            auth: this.jwt
        };
        if (value !== null) {
            body.emailAddress = value;
        }
        let future = server.createFuture();
        this.drive.permissions.create(params, function () {
            future.return(true);
        });
        return future.wait();
    }
}

export default new Drive();