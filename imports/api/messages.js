import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ROLES, isPermitted, MESSAGES_TYPE, MESSAGES_STATUS, VALUE } from './classes/Const';
import { check } from 'meteor/check';
import { CandidateCreate } from './candidates';
import { EmailFiles } from './files';
import { LinkPreview } from './link-preview';
import { simpleParser } from 'mailparser';
import Util from './classes/Utilities';
import moment from 'moment';
import POP3Client from 'poplib';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import MessageManager from './classes/MessageManager';

export const MessagesAddSender = 'messages_add_sender';
export const MessagesRemoveSender = 'messages_remove_sender';
export const MessagesAddListener = 'messages_add_listener';
export const MessagesSend = 'messages_send';
export const MessagesSave = 'messages_save';
export const MessagesRemove = 'messages_remove';
export const MessagesRead = 'messages_read';
export const ValidMessages = 'messages_pub';
export const MessagesIncomingPub = 'messages_incoming_pub';
export const MessagesImport = 'messages_import';

let databaseName = Meteor.settings.public.collections.messages || 'messages';
export const MessagesDB = new Mongo.Collection(Meteor.settings.public.collections.messages || 'messages', { idGeneration: 'MONGO' });
export const IncomingDB = new Mongo.Collection(Meteor.settings.public.collections.incoming || 'incoming_logs', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[MessagesImport] = function (file) {
        try {
            check(this.userId, String);
            check(file, String);
            return MessageManager.import(file);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesRemove] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.VIEW_MESSAGES_PRIVATE))
                return MessageManager.remove(id);
            throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesRead] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return MessageManager.read(id);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesAddListener] = function (credit, id = this.userId) {
        if (credit.imap_host) {
            let imap = server.createImap({
                user: credit.user,
                password: credit.password,
                host: credit.imap_host,
                port: credit.imap_port,
                tls: true
            });
            imap.once('error', Meteor.bindEnvironment((err) => {
                console.error(`Connection for ${credit.user}: ${err}`);
                Meteor.users.update({
                    _id: id,
                    'profile.emails': credit
                }, { $set: { 'profile.emails.$.status': 'disconnected' } });
            }));
            imap.once('end', Meteor.bindEnvironment(() => {
                console.error(`Connection for ${credit.user} ended`);
            }));
            imap.once('ready', Meteor.bindEnvironment(() => {
                console.error(`Connection for ${credit.user} resumed`);
                imap.openBox('INBOX', false, Meteor.bindEnvironment((err) => {
                    if (err) {
                        Meteor.users.update({
                            _id: id,
                            'profile.emails': credit
                        }, { $set: { 'profile.emails.$.status': 'disconnected' } });
                        throw err;
                    }
                    Meteor.setInterval(() => {
                        imap.search(['UNSEEN', ['SINCE', moment().format('MMMM DD, YYYY')]], Meteor.bindEnvironment((error, results) => {
                            if (error)
                                console.error(`Connection for ${credit.user}: ${error}`);
                            if (results.length) {
                                let f = imap.fetch(results, { markSeen: true, bodies: '' });
                                f.on('message', Meteor.bindEnvironment((msg) => {
                                    msg.on('body', Meteor.bindEnvironment((stream) => {
                                        simpleParser(stream, Meteor.bindEnvironment((errorParse, mail) => {
                                            let messageId = Util.hash(`${mail.date}${mail.to.value}${mail.subject}${mail.text}${credit.user}`);
                                            let attachments = [];
                                            let bool = null;
                                            if (mail.attachments) {
                                                mail.attachments.forEach(function (attachment) {
                                                    let future = server.createFuture();
                                                    server.getFiber(function () {
                                                        EmailFiles.write(attachment.content, {
                                                            fileName: attachment.filename
                                                        }, Meteor.bindEnvironment(function (errorFiber, fileRef) {
                                                            if (errorFiber) {
                                                                throw errorFiber;
                                                            } else {
                                                                console.log(fileRef.name + ' is successfully saved to FS. _id: ' + fileRef._id);
                                                                Meteor.defer(() => {
                                                                    Meteor.call(LinkPreview, EmailFiles.link(fileRef), messageId);
                                                                });
                                                                future.return(fileRef);
                                                            }
                                                        }), true);
                                                    }).run();
                                                    if (bool = future.wait())
                                                        attachments.push(bool);
                                                });
                                            }
                                            mail.to.value.forEach((obj) => {
                                                functions[MessagesSave].call(this, {
                                                    createdAt: moment(mail.date).valueOf(),
                                                    read: false,
                                                    contact: obj.address,
                                                    from: obj.address,
                                                    to: credit.user,
                                                    cc: mail.cc ? mail.cc.value.join(',') : '',
                                                    bcc: mail.bcc ? mail.bcc.value.join(',') : '',
                                                    text: mail.text,
                                                    subject: mail.subject,
                                                    html: mail.textAsHtml,
                                                    attachments,
                                                    type: MESSAGES_TYPE.EMAIL,
                                                    status: MESSAGES_STATUS.RECEIVED,
                                                    messageId
                                                }, false);
                                                functions[CandidateCreate].call(this, obj.address, {
                                                    createdAt: moment(mail.date).valueOf(),
                                                    read: false,
                                                    from: obj.address,
                                                    to: credit.user,
                                                    text: mail.text,
                                                    subject: mail.subject,
                                                }, true);
                                            });
                                        }));
                                    }));
                                }));
                                f.once('error', function (errorFetch) {
                                    console.log('Fetch error: ' + errorFetch);
                                });
                            }
                        }));
                    }, 9000);
                }));
            }));
            imap.connect();
        } else if (credit.pop_host) {
            let count = 1;
            let connection = new POP3Client(credit.pop_port, credit.pop_host, {
                tlserrs: false,
                enabletls: (credit.pop_port === '995'),
                debug: false
            });
            connection.on('error', Meteor.bindEnvironment((err) => {
                if (err.errno === 111) console.error(`Connection for ${credit.user}: Unable to connect to server`);
                else console.error(`Connection for ${credit.user}: ${err}`);
                Meteor.users.update({
                    _id: id,
                    'profile.emails': credit
                }, { $set: { 'profile.emails.$.status': 'disconnected' } });
            }));
            connection.on('connect', function () {
                connection.login(credit.user, credit.password);
            });
            connection.on('login', Meteor.bindEnvironment((status) => {
                if (status) {
                    console.log("LOGIN/PASS success");
                    Meteor.defer(() => {
                        connection.list();
                    });
                } else {
                    connection.quit();
                    Meteor.users.update({
                        _id: id,
                        'profile.emails': credit
                    }, { $set: { 'profile.emails.$.status': 'disconnected' } });
                }
            }));
            connection.on('list', Meteor.bindEnvironment((status, msgcount) => {
                if (status === false) {
                    console.log('LIST failed');
                    Meteor.setTimeout(() => { connection.list() }, 1000);
                } else {
                    console.log("LIST success with " + msgcount + " element(s)");
                    connection.retr(count);
                }
            }));
            connection.on('retr', Meteor.bindEnvironment((status, msgnumber) => {
                if (status === true) {
                    console.log("RETR success for msgnumber " + msgnumber);
                    connection.dele(msgnumber);
                } else {
                    console.log("RETR failed for msgnumber " + msgnumber);
                    Meteor.setTimeout(() => { count = 1; connection.list(); }, 1000);
                }
            }));
            connection.on('dele', Meteor.bindEnvironment((status, msgnumber) => {
                if (status === true) {
                    console.log("DELE success for msgnumber " + msgnumber);
                    count++;
                    connection.retr(count);
                } else {
                    console.log("DELE failed for msgnumber " + msgnumber);
                    Meteor.setTimeout(() => { connection.dele(msgnumber); }, 1000);
                }
            }));
        }
    };
    functions[MessagesAddSender] = function (credit, id = this.userId) {
        try {
            check(this.userId, String);
            check(credit, Object);
            check(id, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_EMAILS)) {
                let connection = new SMTPConnection({
                    port: credit.smtp_port,
                    host: credit.smtp_host,
                    secure: (credit.smtp_port === '465')
                });
                connection.connect(Meteor.bindEnvironment(() => {
                    connection.login({
                        credentials: {
                            user: credit.user,
                            pass: credit.password
                        }
                    }, Meteor.bindEnvironment((err) => {
                        if (err) {
                            console.error(err);
                            Meteor.users.update({
                                _id: id,
                                'profile.emails': credit
                            }, { $set: { 'profile.emails.$.status': 'disconnected' } });
                        } else {
                            Meteor.users.update({
                                _id: id,
                                'profile.emails': credit
                            }, { $set: { 'profile.emails.$.status': 'connected' } });
                            server.addSender(id, credit.user, connection);
                            functions[MessagesAddListener].call(this, credit, id);
                        }
                        connection.quit();
                    }));
                }));
                return true;
            }
            throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesRemoveSender] = function (credit, id = this.userId) {
        try {
            check(this.userId, String);
            check(credit, Object);
            check(id, String);
            server.removeSender(id, credit.user);
            return true;
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesSend] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            let smtpConfig = {
                host: data.sender.smtp_host,
                port: data.sender.smtp_port,
                secure: (data.sender.smtp_port === '465'),
                auth: {
                    user: data.sender.user,
                    pass: data.sender.password,
                },
                tls: {
                    rejectUnauthorized: false
                },
                ignoreTLS: true
            };
            let transporter = server.getNodemailer().createTransport(smtpConfig);
            let arrFiles = [];
            for (let i = 0; i < data.files.length; i++) {
                arrFiles.push(data.files[i]);
            }
            let mailOptions = {
                from: data.sender.user,
                to: data.contact,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                text: data.text,
                html: data.html,
                attachments: arrFiles,
            };
            let toArr = data.contact.split(",");
            let msgArr = [];
            toArr.forEach((eadd) => {
                let msgTime = moment().valueOf();
                msgArr.push(functions[MessagesSave].call(this, {
                    createdAt: msgTime,
                    read: true,
                    contact: eadd,
                    from: data.sender.user,
                    to: eadd,
                    cc: data.cc,
                    bcc: data.bcc,
                    text: data.text,
                    subject: data.subject,
                    html: data.html,
                    attachments: arrFiles,
                    type: MESSAGES_TYPE.EMAIL,
                    status: MESSAGES_STATUS.SENDING
                }, true));
                functions[CandidateCreate].call(this, eadd, {
                    createdAt: msgTime,
                    read: true,
                    from: data.sender.user,
                    to: eadd,
                    text: data.text,
                    subject: data.subject,
                }, true);
            });
            transporter.sendMail(mailOptions, Meteor.bindEnvironment((error, infoObj) => {
                if (error && error !== null) {
                    console.error(`Error sending EMAIL with '${data.sender.user}'(EMAIL):`, error);
                    MessagesDB.update({ _id: { $in: msgArr } }, {
                        $set: {
                            status: MESSAGES_STATUS.FAILED,
                        }
                    });
                } else {
                    infoObj.accepted.forEach((toInd) => {
                        MessagesDB.update({ _id: msgArr[toArr.indexOf(toInd)] }, {
                            $set: {
                                status: MESSAGES_STATUS.SENT
                            }
                        });
                    });
                }
            }));
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesSave] = function (data, outgoing = false) {
        try {
            check(data, Object);
            let msgId = MessagesDB.insert(data);
            let icon = "";
            if (data.text && data.text.length > 360)
                data.text = data.text.substr(0, 360) + '...';
            if (outgoing)
                return msgId;
            if (data.type === MESSAGES_TYPE.EMAIL)
                icon = '/img/e-mail-10.png';
            if (data.type === MESSAGES_TYPE.SMS)
                icon = '/img/sms-256.png';
            if (data.type === MESSAGES_TYPE.SKYPE)
                icon = '/img/Skype.png';
            if (data.type === MESSAGES_TYPE.WA)
                icon = '/img/Whatsapp.png';
            IncomingDB.insert({
                title: `Received a message from ${data.contact}`,
                message: data.text,
                timestamp: data.createdAt,
                options: { icon },
            });
            return msgId;
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    Meteor.publish(ValidMessages, function (contact, limit) {
        try {
            let count = null,
                cursor = null;
            if (isPermitted(Meteor.user().profile.role, ROLES.VIEW_MESSAGES_PRIVATE)) {
                count = MessagesDB.find({ contact }, { sort: { createdAt: -1 } }).count();
                cursor = MessagesDB.find({ contact }, { sort: { createdAt: -1 }, limit });
            } else {
                count = MessagesDB.find({ contact, $or: [{ retired: { $exists: false } }, { retired: VALUE.FALSE }] }, { sort: { createdAt: -1 } }).count();
                cursor = MessagesDB.find({ contact, $or: [{ retired: { $exists: false } }, { retired: VALUE.FALSE }] }, { sort: { createdAt: -1 }, limit });
            }
            Util.setupHandler(this, databaseName, cursor, (doc) => {
                doc.max = count;
                return doc;
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
        this.ready();
    });
    Meteor.publish(MessagesIncomingPub, function (datetime) {
        this.unblock();
        try {
            return IncomingDB.find({ timestamp: { $gt: datetime } }, { sort: { timestamp: 1 } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    });
}