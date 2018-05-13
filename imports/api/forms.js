import { Meteor } from 'meteor/meteor';
//import { IncomingDB } from './messages';
import { ROLES, ROUTES, isPermitted, VALUE } from './classes/Const';
import Util from './classes/Utilities';
//import Notification from './Classes/Notification';
//import { Candidates } from './candidates';
import { check } from 'meteor/check';
import moment from 'moment';
import Forms from '../ui/components/forms/Forms';

// export const FormsRemoveData = "forms_remove_data";
export const ValidForms = "forms_valid";
// export const FormsDPub = "formsd";
export const FormsSave = 'forms_save';
export const GetForm = 'forms_get';
export const DeleteForm = 'forms_delete';
// export const FormsRemove = "forms_remove";
// export const FormsSubmit = "forms_submit";
let databaseName = Meteor.settings.public.collections.forms || 'forms';
export const FormsDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });
export const FormsDDB = new Mongo.Collection(Meteor.settings.public.collections.formsData || 'formsd', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    // functions[FormsRemoveData] = function (id) {
    //     try {
    //         check(this.userId, String);
    //         check(id, Meteor.Collection.ObjectID);
    //         let user = Meteor.user();
    //         if (user && isPerimitted(user.profile.role, ROLES.MANAGE_FORMS)) {
    //             FormsDDB.update({ _id: id }, {
    //                 "$set": {
    //                     "removed": FORMS_REMOVE.TRUE,
    //                 }
    //             });
    //             return ('Form saved.');
    //         }
    //         throw new Meteor.Error(403, "Not authorized");
    //     } catch (err) {
    //         console.error(err);
    //         throw new Meteor.Error('bad', err.message);
    //     }
    // };
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
                FormsDB.update({ _id: id }, {
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
    // functions[FormsRemove] = function (data) {
    //     try {
    //         check(this.userId, String);
    //         check(data, Object);
    //         let user = Meteor.user();
    //         if (user && isPerimitted(user.profile.role, ROLES.MANAGE_FORMS)) {
    //             FormsDB.remove({ _id: data._id });
    //             return ('Form deleted.');
    //         }
    //         throw new Meteor.Error(403, "Not authorized");
    //     } catch (err) {
    //         console.error(err);
    //         throw new Meteor.Error('bad', err.message);
    //     }
    // };
    // functions[FormsSubmit] = function (data) {
    //     try {
    //         check(data, Object);
    //         let dup = null;
    //         if (data.applicantId) {
    //             dup = FormsDDB.findOne({
    //                 form_id: new Mongo.ObjectID(data._id),
    //                 applicantId: data.applicantId,
    //                 removed: FORMS_REMOVE.FALSE
    //             });
    //             if (dup)
    //                 throw new Meteor.Error("BAD", "Duplicate submission of form");
    //         }
    //         dup = Candidates.findOne({_id: new Mongo.ObjectID(data.applicantId)});
    //         if (!dup)
    //             throw new Meteor.Error("BAD", "Applicanyt does not exist");
    //         FormsDDB.insert({
    //             "form_id": new Mongo.ObjectID(data._id),
    //             "data": data.obj,
    //             "version": data.version,
    //             "createdAt": moment().valueOf(),
    //             "dateDisplay": new Date().toDateString(),
    //             "applicantId": data.applicantId ? data.applicantId : null,
    //             "removed": FORMS_REMOVE.FALSE
    //         }, function () {
    //             let fData = FormsDB.findOne({ _id: new Mongo.ObjectID(data._id) });
    //             if (fData) {
    //                 FormsDB.update({ _id: data._id }, {
    //                     $push: {
    //                         progress: {
    //                             member: null,
    //                             message: 'A data is added to this form.',
    //                             dateAdded: new Date().toDateString()
    //                         }
    //                     }
    //                 });
    //                 let notif = new Notification('A guest submitted data to <a href="/' + ROUTES.FORMS_DATA + '/' + data._id + '" target="_blank">' + fData.name + '</a> form');
    //                 notif.flush();
    //                 IncomingDB.insert({
    //                     title: 'Form submission',
    //                     message: 'A guest submitted data to ' + fData.name + ' form',
    //                     timestamp: moment().valueOf(),
    //                     options: {
    //                         icon: `http://maps.google.com/maps/api/staticmap?center=${data.location.latitude},${data.location.longitude}&zoom=8&markers=icon:|${data.location.latitude},${data.location.longitude}&path=color:0x0000FF80|weight:5|${data.location.latitude},${data.location.longitude}&size=80x80`,
    //                         onClick: `/${ROUTES.FORMS_DATA}/${data._id}`,
    //                     }
    //                 });
    //             }
    //         });
    //         return ('Form saved.');
    //     } catch (err) {
    //         console.error(err);
    //         throw new Meteor.Error('bad', err.message);
    //     }
    // }
    //     ;
    Meteor.publish(ValidForms, function (limit) {
        let cursor = null;
        try {
            let count = FormsDB.find({ retired: { $exists: false } }, { sort: { name: 1 } }).count();
            cursor = FormsDB.find({ retired: { $exists: false } }, { sort: { name: 1 }, limit });
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
    // Meteor.publish(FormsDPub, function (key) {
    //     try {
    //         check(this.userId, String);
    //         key.form_id = new Mongo.ObjectID(key.form_id);
    //         key.removed = FORMS_REMOVE.FALSE;
    //         return FormsDDB.find(key);
    //     } catch (err) {
    //         console.error(err);
    //         throw new Meteor.Error('bad', err.message);
    //     }
    // });
}