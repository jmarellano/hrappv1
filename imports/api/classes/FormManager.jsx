import { Mongo } from 'meteor/mongo';
import { FormsDB, FormsCandidatesDataDB, FormsUsersDataDB } from '../forms';
import { CandidatesDB } from '../candidates';
import { VALUE } from './Const';
import moment from 'moment-timezone';

export default class FormManager {
    constructor(obj = {}) {
        this.json = {
            name: obj.name || {},
            dateModified: obj.dateModified || moment().utc().valueOf(),
            headers: obj.headers || [],
            template: obj.template || [],
            progress: obj.progress || [],
        };
        if (obj._id)
            this.json._id = obj._id;
    }
    parseForm(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json._d) {
            if (FormsDB.update(this.json._id, this.json)) {
                return;
            }
        }
        return (this.json._id = FormsDB.insert(this.json));
    }
    static formUpdate(id, data) {
        FormsDB.update({ _id: new Mongo.ObjectID(id) }, {
            '$set': {
                'name': data.name,
                'dateModified': moment().utc().valueOf()
            },
            '$push': {
                'template': data.template
            }
        }, { upsert: true });
        return FormsDB.findOne({}, { sort: { dateModified: -1 } })._id._str;
    }
    static getForm(id, applicant) {
        if (applicant)
            applicant = CandidatesDB.findOne({ _id: new Mongo.ObjectID(applicant) });
        return { form: FormsDB.findOne({ _id: new Mongo.ObjectID(id) }), applicant };
    }
    static getHeaders(id, version) {
        let form = FormsDB.findOne({ _id: new Mongo.ObjectID(id) });
        return { headers: (form && form.headers) ? form.headers[version] : [], max: (form && form.headers) ? Object.keys(form.headers) : [] };
    }
    static removeForm(id) {
        return FormsDB.update({ _id: id }, { $set: { retired: VALUE.TRUE } });
    }
    static formSubmit(data) {
        let dup = null,
            applicantId = data.applicantId ? data.applicantId : null;
        if (data.applicantId) {
            dup = FormsCandidatesDataDB.findOne({
                form_id: new Mongo.ObjectID(data._id),
                applicantId: data.applicantId,
                removed: VALUE.FALSE
            });
            if (dup)
                throw new Meteor.Error('BAD', 'Duplicate submission of form');
            dup = CandidatesDB.findOne({ _id: new Mongo.ObjectID(data.applicantId) });
            if (!dup)
                throw new Meteor.Error('BAD', 'Applicant does not exist');
            FormsCandidatesDataDB.insert({
                'form_id': new Mongo.ObjectID(data._id),
                'data': data.obj,
                'version': data.version,
                'createdAt': moment().utc().valueOf(),
                'applicantId': applicantId,
                'applicantName': dup.name || dup.email || dup.contact,
                'removed': VALUE.FALSE
            }, function() {
                let fData = FormsDB.findOne({ _id: new Mongo.ObjectID(data._id) });
                let set = {};
                set['headers.' + data.version] = data.obj.map((item) => item.label).filter(item => item.length > 0);
                if (fData) {
                    FormsDB.update({ _id: new Mongo.ObjectID(data._id) }, {
                        $set: set,
                        $push: {
                            progress: {
                                member: null,
                                message: 'A data is added to this form.',
                                dateAdded: moment().utc().valueOf()
                            }
                        }
                    });
                }
            });
        } else {
            dup = Meteor.users.findOne({ _id: data.userId });
            if (!dup)
                throw new Meteor.Error('BAD', 'Applicant does not exist');
            FormsUsersDataDB.insert({
                'form_id': new Mongo.ObjectID(data._id),
                'data': data.obj,
                'version': data.version,
                'createdAt': moment().utc().valueOf(),
                'applicantId': data.userId,
                'applicantName': dup.username,
                'removed': VALUE.FALSE
            }, function() {
                let fData = FormsDB.findOne({ _id: new Mongo.ObjectID(data._id) });
                let set = {};
                set['headers.' + data.version] = data.obj.map((item) => item.label).filter(item => item.length > 0);
                if (fData) {
                    FormsDB.update({ _id: new Mongo.ObjectID(data._id) }, {
                        $set: set,
                        $push: {
                            progress: {
                                member: null,
                                message: 'A data is added to this form.',
                                dateAdded: moment().utc().valueOf()
                            }
                        }
                    });
                }
            });
        }
        return ('Form saved.');
    }
}