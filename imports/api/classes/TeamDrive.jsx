import { ROLES } from './Const';
class TeamDrive {
    constructor(apiKey, clientId, docs, scope) {
        this.apiKey = apiKey || Meteor.settings.public.oAuth.google.apiKey;
        this.clientId = clientId || Meteor.settings.public.oAuth.google.clientId;
        this.discoveryDocs = docs || ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.scope = scope || 'https://www.googleapis.com/auth/drive';
        this.auth = null;
        this.api = null;
        this.client = null;
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
        });
    }
    sync(callback) {
        let pageToken = '';
        let syncFunc = () => {
            let options = {
                'method': 'GET',
                'path': '/drive/v3/files',
                'params': {
                    'fields': 'files, nextPageToken',
                    'q': 'trashed=false',
                    'pageSize': 1000,
                    'pageToken': pageToken
                }
            };
            let request = this.client.request(options);
            request.execute((response) => {
                pageToken = response.nextPageToken;
                let files = response.files.filter((item) => item.ownedByMe).map((item) => {
                    let permissionObj = item.permissions.filter((permission) => permission.role === 'owner')[0];
                    return { id: item.id, name: item.name, permission: permissionObj.id };
                });
                let count = 0;
                if (files.length)
                    files.forEach((file) => {
                        let fileOptions = {
                            'method': 'POST',
                            'path': '/drive/v3/files/' + file.id + '/permissions',
                            'params': {
                                'fileId': file.id,
                                'sendNotificationEmail': false
                            },
                            'body': {
                                "role": "writer",
                                "type": "user",
                                "emailAddress": Meteor.settings.public.oAuth.google.owner
                            }
                        };
                        let fileRequest = this.client.request(fileOptions);
                        fileRequest.execute((fileResponse) => {
                            fileOptions.method = 'PATCH';
                            fileOptions.path = '/drive/v3/files/' + file.id + '/permissions/' + fileResponse.id;
                            fileOptions.params = {
                                'fileId': file.id,
                                'permissionId': fileResponse.id,
                                'transferOwnership': true,
                                'sendNotificationEmail': false
                            };
                            fileOptions.body = {
                                'role': 'owner'
                            };
                            let permissionRequest = this.client.request(fileOptions);
                            permissionRequest.execute(() => {
                                count++;
                                if (count === files.length) {
                                    callback();
                                    if (pageToken)
                                        syncFunc();
                                    else
                                        setTimeout(() => {
                                            pageToken = '';
                                            syncFunc();
                                        }, parseInt(Meteor.settings.public.oAuth.google.interval) || 60000);
                                }
                            });
                        });
                    });
                else
                    callback();
            });
        };
        syncFunc();
    }
    newFolder(parent, callback) {
        let reqOptions = {
            'method': 'POST',
            'path': '/drive/v3/files',
            'params': {},
            'body': {
                'name': 'New Folder',
                'parents': [parent[parent.length - 1]],
                'mimeType': 'application/vnd.google-apps.folder',
            }
        };
        let request = this.client.request(reqOptions);
        request.execute(callback);
    }
    paste(file, parent, callback) {
        let reqOptions = {
            'method': 'POST',
            'path': '/drive/v3/files/' + file.id + '/copy',
            'params': {
                fileId: file.id
            },
            'body': {
                'name': 'Copy of ' + file.name,
                'parents': parent,
            }
        };
        let request = window.gapi.client.request(reqOptions);
        request.execute((fileResponse) => {
            let fileOptions = {
                'method': 'POST',
                'path': '/drive/v3/files/' + fileResponse.id + '/permissions',
                'params': {
                    'fileId': fileResponse.id,
                    'sendNotificationEmails': false
                },
                'body': {
                    "role": "writer",
                    "type": "user",
                    "emailAddress": Meteor.settings.public.oAuth.google.owner
                }
            };
            let fileRequest = window.gapi.client.request(fileOptions);
            fileRequest.execute((fileRequestResponse) => {
                fileOptions.method = 'PATCH';
                fileOptions.path = '/drive/v3/files/' + fileResponse.id + '/permissions/' + fileRequestResponse.id;
                fileOptions.params = {
                    'fileId': fileResponse.id,
                    'permissionId': fileRequestResponse.id,
                    'transferOwnership': true,
                    'sendNotificationEmails': false
                };
                fileOptions.body = {
                    'role': 'owner'
                };
                let permissionRequest = window.gapi.client.request(fileOptions);
                permissionRequest.execute(() => {
                    callback();
                });
            });
        });
    }
    setEmail(user, Drive) {
        this.email = this.auth.currentUser.get().getBasicProfile().getEmail();
        if (user.role === ROLES.ADMINS || user.role === ROLES.SUPERUSER)
            Drive.insertAdminPermission({ id: '1j3VEEcer_y9BEHTGPmlYmNFD-2pjNJVn' }, this.email, 'user', 'writer', () => { });
    }
    setDrive(Drive, callback) {
        Drive.addFolder(this.email, (err, res) => {
            callback(err, res);
        });
    }
}

export default new TeamDrive();