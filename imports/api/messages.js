import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted, MESSAGES_TYPE, MESSAGES_STATUS } from './classes/Const';
import { check } from 'meteor/check';
import moment from 'moment';
import { CandidateCreate } from './candidates';
export const MessagesAddSender = 'messages_add_sender';
export const MessagesSend = 'messages_send';
export const MessagesSave = 'messages_save';
export const MessagesDB = new Mongo.Collection(Meteor.settings.public.collections.messages || 'messages', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    import nodemailer from 'nodemailer';
    import SMTPConnection from 'nodemailer/lib/smtp-connection';
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
                        } else
                            Meteor.users.update({
                                _id: id,
                                'profile.emails': credit
                            }, { $set: { 'profile.emails.$.status': 'connected' } });
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
            let transporter = nodemailer.createTransport(smtpConfig);
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
            let info = {};
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
            transporter.sendMail(mailOptions, Meteor.bindEnvironment((error, info, mail) => {
                if (error && error !== null) {
                    console.error(`Error sending EMAIL with '${from.user}'(SMS):`, error);
                    MessagesDB.update({ _id: { $in: msgArr } }, {
                        $set: {
                            status: MESSAGES_STATUS.FAILED,
                        }
                    });
                } else {
                    info.accepted.forEach((toInd) => {
                        MessagesDB.update({ _id: msgArr[toArr.indexOf(toInd)] }, {
                            $set: {
                                status: MESSAGES_STATUS.SENT,
                                "info.info": info
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
                icon = '/images/e-mail-10.png';
            if (data.type === MESSAGES_TYPE.SMS)
                icon = '/images/sms-256.png';
            if (data.type === MESSAGES_TYPE.SKYPE)
                icon = '/images/Skype.png';
            if (data.type === MESSAGES_TYPE.WA)
                icon = '/images/Whatsapp.png';
            // IncomingDB.insert({
            //     title: `Received a message from ${candidate.json.name ? candidate.json.name : data.eadd}`,
            //     message: data.info.text,
            //     timestamp: data.createdAt,
            //     options: {icon},
            // });
            return msgId;
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
}