import { Meteor } from 'meteor/meteor';
import { MESSAGES_STATUS, MESSAGES_TYPE } from '../../api/classes/Const';
import { CandidatesDB, CandidateCreate } from '../../api/candidates';
import { MessagesSave, MessagesDB, AppointmentDB } from '../../api/messages';
import { EmailFiles } from '../../api/files';
import bodyParser from 'body-parser';
import Future from 'fibers/future';
import extName from 'ext-name';
import urlUtil from 'url';
import path from 'path';
import moment from 'moment-timezone';
Picker.middleware(bodyParser.urlencoded({ extended: false }));
Picker.middleware(bodyParser.json());

if (Meteor.isServer) {
    Picker.route('/sms', function (params, req, res) {
        let from = CandidatesDB.findOne({ number: req.body.From }),
            messageId = req.body.MessageSid;
        let newAttachments = [],
            mediaItems = [];
        if (!from)
            CandidatesDB.insert({ contact: req.body.From, number: req.body.From });
        function saveMedia(mediaItem) {
            const { mediaUrl } = mediaItem;
            let myFuture = new Future();
            Util.downloadFile(mediaUrl, PATH.UPLOAD, Meteor.bindEnvironment((output) => {
                if (!output.failed) {
                    EmailFiles.addFile(`${PATH.UPLOAD}/${output.savepath}`, {
                        fileName: output.filename,
                        type: output.mimetype,
                    }, (err, data) => {
                        if (err)
                            console.err(`Method Save Media error:`, output);
                        else
                            myFuture.return(data);
                    });

                } else {
                    console.err(`Method Downloading File error:`, output);
                }
            }));
            newAttachments.push(myFuture.wait());
        }

        for (let i = 0; i < parseInt(req.body.NumMedia); i++) {
            let mediaUrl = req.body[`MediaUrl${i}`];
            const contentType = req.body[`MediaContentType${i}`];
            const extension = extName.mime(contentType)[0].ext;
            const mediaSid = path.basename(urlUtil.parse(mediaUrl).pathname);
            const filename = `${mediaSid}.${extension}`;

            mediaItems.push({ mediaSid, MessageSid: req.body.MessageSid, mediaUrl, filename });
            mediaItems.map(mediaItem => saveMedia(mediaItem));
        }
        let msgTime = moment().utc().valueOf();
        Meteor.call(MessagesSave, {
            createdAt: msgTime,
            read: false,
            contact: req.body.From,
            to: req.body.To,
            cc: '',
            bcc: '',
            subject: '',
            text: req.body.Body,
            html: req.body.Body,
            attachments: newAttachments,
            type: MESSAGES_TYPE.SMS,
            status: MESSAGES_STATUS.RECEIVED,
            messageId
        }, false);
        Meteor.call(CandidateCreate, {
            contact: req.body.From,
            number: req.body.From,
            createdAt: msgTime,
            lastMessage: {
                createdAt: msgTime,
                read: false,
                from: req.body.From,
                to: req.body.To,
                text: req.body.Body,
                subject: ''
            }
        }, true);
        res.end("Successful sending messages!");
    });
    Picker.route('/pst', function (params, req, res) {
        EmailFiles.addFile(`${PATH.UPLOAD}/${params.query.filename}`, {
            fileName: params.query.filename,
            type: params.query.mime,
        }, (err, data) => {
            if (err)
                console.err('Method update pst message error:', output);
            else {
                if (params.query.type === "messages")
                    MessagesDB.update({ _id: new Mongo.ObjectID(params.query.id) }, { $push: { 'attachments': data } });
                else if (params.query.type === "appointments")
                    AppointmentDB.update({ _id: new Mongo.ObjectID(params.query.id) }, { $push: { 'attachments': data } });
            }
        });
        res.end("Successful saving attachments!");
    });
}