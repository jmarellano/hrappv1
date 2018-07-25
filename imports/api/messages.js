import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ROLES, isPermitted, MESSAGES_TYPE, MESSAGES_STATUS } from './classes/Const';
import { check } from 'meteor/check';
import { CandidateCreate, CandidatesDB } from './candidates';
import { SettingsDB } from './settings';
import { EmailFiles } from './files';
import { LinkPreview } from './link-preview';
import { simpleParser } from 'mailparser';
import Util from './classes/Utilities';
import moment from 'moment-timezone';
import POP3Client from 'poplib';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import MessageManager from './classes/MessageManager';

export const ValidTemplates = 'templates_valid';
export const AppointmentsPub = 'appointments_pub';
export const MessagesAddSender = 'messages_add_sender';
export const MessagesRemoveSender = 'messages_remove_sender';
export const MessagesAddListener = 'messages_add_listener';
export const MessagesSend = 'messages_send';
export const MessageReSend = 'message_re_send';
export const MessagesSave = 'messages_save';
export const MessagesRemove = 'messages_remove';
export const MessagesRead = 'messages_read';
export const ValidMessages = 'messages_pub';
export const MessagesIncomingPub = 'messages_incoming_pub';
export const MessagesImport = 'messages_import';
export const MessagesSaveTemplate = 'messages_templates_save';
export const MessagesGetTemplate = 'messages_templates_get';
export const MessagesDeleteTemplate = 'messages_templates_delete';
export const MessagesICS = 'messages_ics';

let databaseName = Meteor.settings.public.collections.messages || 'messages';
let databaseName2 = Meteor.settings.public.collections.templates || 'templates';
let databaseAppointments = Meteor.settings.public.collections.appointments || 'appointments';
export const TemplatesDB = new Mongo.Collection(databaseName2, { idGeneration: 'MONGO' });
export const MessagesDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });
export const AppointmentDB = new Mongo.Collection(databaseAppointments, { idGeneration: 'MONGO' });
export const IncomingDB = new Mongo.Collection(Meteor.settings.public.collections.incoming || 'incoming_logs', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[MessagesSaveTemplate] = function (id, name, template) {
        try {
            check(this.userId, String);
            check(name, String);
            check(template, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.ADMIN)) {
                return MessageManager.templateUpdate(id, name, template);
            }
            throw new Meteor.Error(403, "Not authorized");
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesDeleteTemplate] = function (id) {
        try {
            check(this.userId, String);
            return MessageManager.templateRemove(id);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesGetTemplate] = function (id) {
        try {
            check(this.userId, String);
            check(id, String);
            return MessageManager.templateFetch(id);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesImport] = function (file) {
        try {
            check(this.userId, String);
            check(file, String);
            return MessageManager.import(file, this.userId);
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
                        imap.search(['UNSEEN', ['SINCE', moment().utc().format('MMMM DD, YYYY')]], Meteor.bindEnvironment((error, results) => {
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
                                                            fileName: attachment.filename,
                                                            type: attachment.contentType
                                                        }, Meteor.bindEnvironment(function (errorFiber, fileRef) {
                                                            if (errorFiber) {
                                                                throw errorFiber;
                                                            } else {
                                                                console.log(fileRef.name + ' is successfully saved to FS. _id: ' + fileRef._id);
                                                                Meteor.defer(() => {
                                                                    Meteor.call(LinkPreview, EmailFiles.link(bool), messageId);
                                                                });
                                                                server.getFileSystem().readFile(fileRef.path, Meteor.bindEnvironment(function (errr, data) {
                                                                    let content = data.toString('utf8'),
                                                                        startEvent = '',
                                                                        endEvent = '',
                                                                        description = '',
                                                                        location = '',
                                                                        attendee = '',
                                                                        summary = '';
                                                                    if (/BEGIN:VCALENDAR/i.test(content)) {
                                                                        if (/METHOD:ACCEPTED/i.test(content) || /PARTSTAT=ACCEPTED/i.test(content)) {
                                                                            startEvent = /[\n\r].*DTSTART;.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            endEvent = /[\n\r].*DTEND;.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            description = /[\n\r].*DESCRIPTION.*:\s*([^\n\r]*)/i.exec(content);
                                                                            if (description)
                                                                                description = description[1];
                                                                            else
                                                                                description = /[\n\r].*COMMENT.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            location = /[\n\r].*LOCATION.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            attendee = /[\n\r].*attendee.*:mailto:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            summary = /[\n\r].*SUMMARY.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            AppointmentDB.insert({
                                                                                createdAt: moment(startEvent).valueOf(),
                                                                                read: true,
                                                                                contact: attendee,
                                                                                from: credit.user,
                                                                                to: attendee,
                                                                                cc: '',
                                                                                bcc: '',
                                                                                html: description,
                                                                                text: description,
                                                                                subject: summary,
                                                                                type: 1,
                                                                                status: 1,
                                                                                importedBy: Meteor.users.findOne({ 'profile.emails.user': credit.user })._id,
                                                                                startTime: moment(startEvent).valueOf(),
                                                                                endTime: moment(endEvent).valueOf()
                                                                            });
                                                                        }
                                                                        if (/METHOD:DELETED/i.test(content) || /METHOD:CANCELLED/i.test(content) || /PARTSTAT=DELETED/i.test(content) || /PARTSTAT=CANCELLED/i.test(content)) {
                                                                            startEvent = /[\n\r].*DTSTART;.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            endEvent = /[\n\r].*DTEND;.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            description = /[\n\r].*DESCRIPTION.*:\s*([^\n\r]*)/i.exec(content);
                                                                            if (description)
                                                                                description = description[1];
                                                                            else
                                                                                description = /[\n\r].*COMMENT.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            location = /[\n\r].*LOCATION.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            attendee = /[\n\r].*attendee.*:mailto:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            summary = /[\n\r].*SUMMARY.*:\s*([^\n\r]*)/i.exec(content)[1];
                                                                            AppointmentDB.remove({
                                                                                contact: attendee,
                                                                                from: credit.user,
                                                                                to: attendee,
                                                                                html: description,
                                                                                text: description,
                                                                                subject: summary,
                                                                                importedBy: Meteor.users.findOne({ 'profile.emails.user': credit.user })._id,
                                                                                startTime: moment(startEvent).valueOf(),
                                                                                endTime: moment(endEvent).valueOf()
                                                                            });
                                                                        }
                                                                    }
                                                                }));
                                                                future.return(fileRef);
                                                            }
                                                        }), true);
                                                    }).run();
                                                    bool = future.wait();
                                                    if (bool)
                                                        attachments.push(bool);
                                                });
                                            }
                                            let msgTime = moment(mail.date).utc().valueOf();
                                            mail.from.value.forEach((obj) => {
                                                functions[MessagesSave].call(this, {
                                                    createdAt: msgTime,
                                                    read: false,
                                                    contact: obj.address,
                                                    from: obj.address,
                                                    to: credit.user,
                                                    cc: mail.cc ? mail.cc.value.join(',') : '',
                                                    bcc: mail.bcc ? mail.bcc.value.join(',') : '',
                                                    text: mail.text,
                                                    subject: mail.subject,
                                                    html: mail.html,
                                                    attachments,
                                                    type: MESSAGES_TYPE.EMAIL,
                                                    status: MESSAGES_STATUS.RECEIVED,
                                                    messageId
                                                }, false);
                                                functions[CandidateCreate].call(this, {
                                                    contact: obj.address,
                                                    email: obj.address,
                                                    createdAt: msgTime,
                                                    lastMessage: {
                                                        createdAt: msgTime,
                                                        read: false,
                                                        from: obj.address,
                                                        to: credit.user,
                                                        text: mail.text,
                                                        subject: mail.subject
                                                    }
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
                    }, SettingsDB.findOne().emailGetInterval);
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
    functions[MessageReSend] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            let message = MessagesDB.findOne({ _id: id });
            if (!message)
                throw new Meteor.Error('bad', 'Invalid Data');
            let account = Meteor.user().profile.emails;
            if (account)
                account = account.filter((obj) => { return (obj.user === message.from) && obj.status === 'connected' });
            else
                throw new Meteor.Error('BAD', 'Cannot resend the message. Please create new one!');
            if (account.length < 1)
                throw new Meteor.Error('BAD', 'Cannot resend the message. Please create new one!');
            let smtpConfig = null;
            let transporter = null;
            let arrFiles = null;
            let mailOptions = null;
            switch (message.type) {
                case MESSAGES_TYPE.EMAIL:
                    smtpConfig = {
                        host: account[0].smtp_host,
                        port: account[0].smtp_port,
                        secure: (account[0].smtp_port === '465'),
                        auth: {
                            user: account[0].user,
                            pass: account[0].password,
                        },
                        tls: {
                            rejectUnauthorized: false
                        },
                        ignoreTLS: true
                    };
                    transporter = server.getNodemailer().createTransport(smtpConfig);
                    if (!transporter)
                        throw new Meteor.Error('bad', 'Server Error, Contact Administrator');
                    arrFiles = [];
                    for (let i = 0; i < message.attachments.length; i++) {
                        arrFiles.push(message.attachments[i]);
                    }
                    mailOptions = {
                        from: message.from,
                        to: message.contact,
                        cc: message.cc,
                        bcc: message.bcc,
                        subject: message.subject,
                        text: message.text,
                        html: message.html,
                        attachments: message.attachments,
                    };
                    MessagesDB.update({ _id: message._id }, {
                        $set: {
                            status: MESSAGES_STATUS.SENDING,
                        }
                    });
                    transporter.sendMail(mailOptions, Meteor.bindEnvironment((error, infoObj) => {
                        if (error && error !== null) {
                            console.error(`Error re-sending EMAIL with '${message.from}'(EMAIL):`, error);
                            MessagesDB.update({ _id: message._id }, {
                                $set: {
                                    status: MESSAGES_STATUS.FAILED,
                                }
                            });
                        } else {
                            MessagesDB.update({ _id: message._id }, {
                                $set: {
                                    status: MESSAGES_STATUS.SENT
                                }
                            });
                        }
                    }));
                    break;
            }
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    }
    functions[MessagesSend] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            if (data.type === MESSAGES_TYPE.EMAIL) {
                let messageId = Util.hash(`${moment().utc().valueOf()}${data.contact}${data.subject}${data.text}${data.sender.user}`);
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
                    Meteor.defer(() => {
                        Meteor.call(LinkPreview, EmailFiles.link(data.files[i]), messageId);
                    });
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
                let attendees = [];
                toArr.forEach((to) => {
                    attendees.push({ email: to, rsvp: true });
                });
                let msgArr = [];
                if (data.event) {
                    let file = functions[MessagesICS].call(this, data, attendees);
                    let attachments = mailOptions['attachments'];
                    attachments.push(file);
                    mailOptions['attachments'] = attachments;
                }
                toArr.forEach((eadd) => {
                    let msgTime = moment().utc().valueOf();
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
                        status: MESSAGES_STATUS.SENDING,
                        messageId
                    }, true));
                    functions[CandidateCreate].call(this, {
                        contact: eadd,
                        email: eadd,
                        createdAt: msgTime,
                        lastMessage: {
                            createdAt: msgTime,
                            read: true,
                            from: data.sender.user,
                            to: eadd,
                            text: data.text,
                            subject: data.subject
                        }
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
            } else if (data.type === MESSAGES_TYPE.SMS) {
                let msgTime = moment().utc().valueOf();
                let messageId = Util.hash(`${msgTime}${data.contact}${data.subject}${data.text}${data.sender}`);
                let accountSid = Meteor.settings.twilioCreds.accountSid;
                let authToken = Meteor.settings.twilioCreds.authToken;
                let client = server.createTwilio(accountSid, authToken);
                let contact = null,
                    from = null;
                if (!Util.numberValidator(data.contact).isValid)
                    throw new Meteor.Error('BAD', 'Phone number invalid!');
                contact = Util.numberValidator(data.contact).e164Format;
                from = Util.numberValidator(data.sender).e164Format;
                let obj = {
                    body: data.text,
                    to: contact,
                    from,
                };
                if (data.files.length)
                    obj.mediaUrl = EmailFiles.link(data.files[0]);
                let msg = functions[MessagesSave].call(this, {
                    createdAt: msgTime,
                    read: true,
                    contact,
                    from: data.sender,
                    to: contact,
                    cc: data.cc,
                    bcc: data.bcc,
                    text: data.text,
                    subject: data.subject,
                    html: data.html,
                    attachments: data.files,
                    type: MESSAGES_TYPE.SMS,
                    status: MESSAGES_STATUS.SENDING,
                    messageId
                }, true);
                functions[CandidateCreate].call(this, {
                    contact,
                    number: contact,
                    createdAt: msgTime,
                    lastMessage: {
                        createdAt: msgTime,
                        read: true,
                        from,
                        to: contact,
                        text: data.text,
                        subject: data.subject
                    }
                }, true);
                client.messages.create(obj, Meteor.bindEnvironment((err) => {
                    if (err) {
                        console.error(`Error sending SMS with '${from}'(SMS):`, err);
                        MessagesDB.update({ _id: msg }, {
                            $set: {
                                status: MESSAGES_STATUS.FAILED,
                            }
                        });
                    } else {
                        MessagesDB.update({ _id: msg }, {
                            $set: {
                                status: MESSAGES_STATUS.SENT
                            }
                        });
                    }
                }));
            }
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[MessagesICS] = function (data, attendees) {
        let future = server.createFuture();
        server.getICS().createEvent({
            title: data.subject,
            description: data.text,
            start: moment(data.startEvent).format('YYYY-MM-DD-k-m').split('-'),
            end: moment(data.endEvent).format('YYYY-MM-DD-k-m').split('-'),
            location: data.locationEvent,
            organizer: { email: data.sender.user },
            attendees
        }, Meteor.bindEnvironment((error, value) => {
            let time = moment().valueOf();
            if (error) {
                console.log(error)
            }
            //future.return(value);
            server.getFileSystem().writeFileSync(`${PATH.UPLOAD}/${time}_${data.sender.user}_event.ics`, value);
            // future.return(`${PATH.UPLOAD}/${time}_${data.sender.user}_event.ics`);
            EmailFiles.addFile(`${PATH.UPLOAD}/${time}_${data.sender.user}_event.ics`, {
                fileName: 'invitation.ics',
                type: 'text/calendar'
            }, (err, fileRef) => {
                future.return(fileRef);
            });
        }));
        return future.wait();
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
    Meteor.publish(AppointmentsPub, function (currentUserOnly) {
        try {
            let cursor = AppointmentDB.find({});
            if (currentUserOnly && this.userId) {
                let today = new Date();
                today.setHours(0, 0, 0, 0);
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                cursor = AppointmentDB.find({ importedBy: this.userId, startTime: { $gte: moment(today).valueOf(), $lt: moment(tomorrow).valueOf() } });
            }
            Util.setupHandler(this, currentUserOnly ? "#task-lists" : databaseAppointments, cursor, (doc) => {
                if (doc.subject)
                    doc.title = doc.subject;
                return doc;
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
        this.ready();
    });
    Meteor.publish(ValidMessages, function (contact, limit, search, start, end, sort) {
        try {
            let count = null,
                cursor = null;
            let candidate = CandidatesDB.findOne({ contact });
            let or = [{ contact: candidate.contact }];
            let or2 = [];
            if (search)
                or2 = [{ text: { $regex: search, $options: 'i' } }, { html: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
            let user = Meteor.user();
            if (candidate.email)
                or.push({ contact: candidate.email });
            if (candidate.number)
                or.push({ contact: candidate.number });
            let query = { $or: or };
            if (or.length && or2.length)
                query = { $and: [{ $or: or }, { $or: or2 }] }

            if (user && !isPermitted(user.profile.role, ROLES.VIEW_MESSAGES_PRIVATE))
                query.retired = { $exists: false };
            if (start.length && end.length)
                query.createdAt = { $lte: moment(end).endOf('day').valueOf(), $gte: moment(start).startOf('day').valueOf() };
            count = MessagesDB.find(query, { sort: { createdAt: sort ? 1 : -1 } }).count();
            cursor = MessagesDB.find(query, { sort: { createdAt: sort ? 1 : -1 }, limit });
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
    Meteor.publish(ValidTemplates, function (key, limit) {
        let cursor = null;
        let query = { retired: { $exists: false } };
        if (key && key.length)
            query['name'] = { $regex: key, $options: 'i' };
        try {
            let count = TemplatesDB.find(query, { sort: { name: 1 } }).count();
            cursor = TemplatesDB.find(query, { sort: { name: 1 }, limit });
            Util.setupHandler(this, databaseName2, cursor, (doc) => {
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
