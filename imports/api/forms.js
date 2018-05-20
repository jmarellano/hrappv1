import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
//import { IncomingDB } from './messages';
import { ROLES, isPermitted, VALUE } from './classes/Const';
import Util from './classes/Utilities';
//import Notification from './Classes/Notification';
import { CandidatesDB } from './candidates';
import { check } from 'meteor/check';
import moment from 'moment';

export const ValidForms = "forms_valid";
export const FormsDPub = "formsd";
export const FormsSave = 'forms_save';
export const GetForm = 'forms_get';
export const DeleteForm = 'forms_delete';
export const FormsSubmit = "forms_submit";
export const FormHeaders = "forms_header";
let databaseName = Meteor.settings.public.collections.forms || 'forms';
let databaseName2 = Meteor.settings.public.collections.formsData || 'formsd';
export const FormsDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });
export const FormsDDB = new Mongo.Collection(databaseName2, { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[GetForm] = function (id) {
        try {
            check(this.userId, String);
            check(id, String);
            return FormsDB.findOne({ _id: new Mongo.ObjectID(id) });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[FormHeaders] = function (id, version) {
        try {
            check(this.userId, String);
            check(id, String);
            check(version, String);
            let form = FormsDB.findOne({ _id: new Mongo.ObjectID(id) });
            return { headers: (form && form.headers) ? form.headers[version] : [], max: Object.keys(form.headers).length };
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[DeleteForm] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_FILES))
                return FormsDB.update({ _id: id }, { $set: { retired: VALUE.TRUE } });
            throw new Meteor.Error(403, "Unauthorized!");
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[FormsSave] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_FORMS)) {
                let id = data._id;
                FormsDB.update({ _id: new Mongo.ObjectID(id) }, {
                    '$set': {
                        'name': data.name,
                        'dateModified': moment().valueOf()
                    },
                    '$push': {
                        'template': data.template
                    }
                }, { upsert: true });
                return FormsDB.findOne({}, { sort: { dateModified: -1 } })._id._str;
            }
            throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[FormsSubmit] = function (data) {
        try {
            check(data, Object);
            let dup = null;
            if (data.applicantId) {
                dup = FormsDDB.findOne({
                    form_id: new Mongo.ObjectID(data._id),
                    applicantId: data.applicantId,
                    removed: VALUE.FALSE
                });
                if (dup)
                    throw new Meteor.Error("BAD", "Duplicate submission of form");
            }
            dup = CandidatesDB.findOne({ _id: new Mongo.ObjectID(data.applicantId) });
            if (!dup)
                throw new Meteor.Error("BAD", "Applicant does not exist");
            FormsDDB.insert({
                "form_id": new Mongo.ObjectID(data._id),
                "data": data.obj,
                "version": data.version,
                "createdAt": moment().valueOf(),
                "applicantId": data.applicantId ? data.applicantId : null,
                "removed": VALUE.FALSE
            }, function () {
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
                                dateAdded: moment().valueOf()
                            }
                        }
                    });
                    // let notif = new Notification('A guest submitted data to <a href="/' + ROUTES.FORMS_DATA + '/' + data._id + '" target="_blank">' + fData.name + '</a> form');
                    // notif.flush();
                    // IncomingDB.insert({
                    //     title: 'Form submission',
                    //     message: 'A guest submitted data to ' + fData.name + ' form',
                    //     timestamp: moment().valueOf(),
                    //     options: {
                    //         icon: `http://maps.google.com/maps/api/staticmap?center=${data.location.latitude},${data.location.longitude}&zoom=8&markers=icon:|${data.location.latitude},${data.location.longitude}&path=color:0x0000FF80|weight:5|${data.location.latitude},${data.location.longitude}&size=80x80`,
                    //         onClick: `/${ROUTES.FORMS_DATA}/${data._id}`,
                    //     }
                    // });
                }
            });
            return ('Form saved.');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    }
        ;
    Meteor.publish(ValidForms, function (key, limit) {
        let cursor = null;
        let query = { retired: { $exists: false } };
        if (key && key.length)
            query['name'] = { $regex: key, $options: 'i' };
        try {
            let count = FormsDB.find(query, { sort: { name: 1 } }).count();
            cursor = FormsDB.find(query, { sort: { name: 1 }, limit });
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
    Meteor.publish(FormsDPub, function (key, limit) {
        let cursor = null;
        try {
            check(this.userId, String);
            key.form_id = new Mongo.ObjectID(key.form_id);
            key.removed = VALUE.FALSE;
            key.version = parseInt(key.version);
            let count = FormsDDB.find(key, { sort: { createdAt: -1 } }).count();
            cursor = FormsDDB.find(key, { sort: { createdAt: -1 }, limit });
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
}