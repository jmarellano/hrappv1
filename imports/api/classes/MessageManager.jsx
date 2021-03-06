import { Mongo } from 'meteor/mongo';
import { MessagesDB, TemplatesDB } from '../messages';
import { CandidatesDB } from '../candidates';
import { VALUE } from './Const';
import child_process from 'child_process';
import moment from 'moment';
import { Meteor } from "meteor/meteor";

export default class MessageManager {
    constructor(obj = {}) {
        this.json = {

        };
        if (obj._id)
            this.json._id = obj._id;
    }
    parseCandidate(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json._id) {
            if (MessagesDB.update(this.json._id, this.json)) {
                return;
            }
        }
        return (this.json._id = MessagesDB.insert(this.json));
    }
    static import(file, userId, UserDB = Meteor.users) {
        try {
            UserDB.update({ _id: userId }, { $set: { 'profile.importing': VALUE.TRUE } });
            let spawn = child_process.spawn;
            let emails = UserDB.findOne({ _id: userId }).profile.emails;
            let addresses = '';
            if (emails)
                emails.forEach((email) => {
                    addresses = addresses + ',' + email.user;
                });
            const ls = spawn('java', ['-jar', '/data/JavaPST.jar', file, userId, '67.205.159.172', 9001, addresses]);
            ls.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            ls.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
            });
            ls.on('close', Meteor.bindEnvironment(() => {
                console.log(`JavaPST close! userID: ${userId}`);
                UserDB.update({ _id: userId }, { $set: { 'profile.importing': VALUE.FALSE } });
            }));
            ls.on('end', Meteor.bindEnvironment(() => {
                console.log(`JavaPST end! userID: ${userId}`);
                UserDB.update({ _id: userId }, { $set: { 'profile.importing': VALUE.FALSE } });
            }));
            ls.on('exit', Meteor.bindEnvironment(() => {
                console.log(`JavaPST exit! userID: ${userId}`);
                UserDB.update({ _id: userId }, { $set: { 'profile.importing': VALUE.FALSE } });
            }));
            return true;
        } catch (err) {
            UserDB.update({ _id: userId }, { $set: { 'profile.importing': VALUE.FALSE } });
            throw new Meteor.Error('bad', err.message);
        }
    }

    static remove(id) {
        return MessagesDB.update({ _id: id }, { $set: { retired: VALUE.TRUE } });
    }

    static read(id) {
        return CandidatesDB.update({ _id: id }, { $set: { 'lastMessage.read': VALUE.TRUE } });
    }

    static templateUpdate(id, name, template) {
        id = id !== '' ? new Mongo.ObjectID(id) : id;
        TemplatesDB.update({ _id: id }, {
            '$set': {
                'name': name,
                'template': template,
                'dateModified': moment().utc().valueOf()
            }
        }, { upsert: true });
        return TemplatesDB.findOne({}, { sort: { dateModified: -1 } })._id._str;
    }
    static templateFetch(id) {
        id = id !== '' ? new Mongo.ObjectID(id) : id;
        return TemplatesDB.findOne({ _id: id });
    }
    static templateRemove(data) {
        return TemplatesDB.update({ _id: data.id }, { $set: { retired: VALUE.TRUE } });
    }
}