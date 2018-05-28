import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ROLES, isPermitted, VALUE } from './classes/Const';
import { CandidatesDB } from './candidates';
import { check } from 'meteor/check';
//import { IncomingDB } from './messages';
import Util from './classes/Utilities';
import FormManager from './classes/FormManager';
//import Notification from './Classes/Notification';

export const ValidForms = 'forms_valid';
export const FormsDPub = 'formsd';
export const FormsSave = 'forms_save';
export const GetForm = 'forms_get';
export const DeleteForm = 'forms_delete';
export const FormsSubmit = 'forms_submit';
export const FormHeaders = 'forms_header';
let databaseName = Meteor.settings.public.collections.forms || 'forms';
let databaseName2 = Meteor.settings.public.collections.formsData || 'formsd';
export const FormsDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });
export const FormsDDB = new Mongo.Collection(databaseName2, { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[GetForm] = function (id, applicant) {
        try {
            check(id, String);
            return FormManager.getForm(id, applicant);
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
            return FormManager.getHeaders(id, version);
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
                return FormManager.removeForm(id);
            throw new Meteor.Error(403, 'Unauthorized!');
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
                return FormManager.formUpdate(id, data);
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
            return FormManager.formSubmit(data);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
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