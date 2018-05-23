import { Mongo } from 'meteor/mongo';
import { FormsDB, FormsDDB } from '../forms';
import { CandidatesDB } from '../candidates';
import { VALUE } from './Const';

export default class FormManager {
    constructor(obj = {}) {
        this.json = {
            name: obj.name || {},
            dateModified: obj.dateModified || moment().valueOf(),
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
                'dateModified': moment().valueOf()
            },
            '$push': {
                'template': data.template
            }
        }, { upsert: true });
        return FormsDB.findOne({}, { sort: { dateModified: -1 } })._id._str;
    }
    static getForm(id) {
        return FormsDB.findOne({ _id: new Mongo.ObjectID(id) });
    }
    static getHeaders(id, version) {
        let form = FormsDB.findOne({ _id: new Mongo.ObjectID(id) });
        return { headers: (form && form.headers) ? form.headers[version] : [], max: Object.keys(form.headers).length };
    }
    static removeForm(id) {
        return FormsDB.update({ _id: id }, { $set: { retired: VALUE.TRUE } });
    }
    static formSubmit(data) {
        let dup = null,
            applicantId = data.applicantId ? data.applicantId : null;
        if (data.applicantId) {
            dup = FormsDDB.findOne({
                form_id: new Mongo.ObjectID(data._id),
                applicantId: data.applicantId,
                removed: VALUE.FALSE
            });
            if (dup)
                throw new Meteor.Error('BAD', 'Duplicate submission of form');
        }
        dup = CandidatesDB.findOne({ _id: new Mongo.ObjectID(data.applicantId) });
        if (!dup)
            throw new Meteor.Error('BAD', 'Applicant does not exist');
        FormsDDB.insert({
            'form_id': new Mongo.ObjectID(data._id),
            'data': data.obj,
            'version': data.version,
            'createdAt': moment().valueOf(),
            'applicantId': applicantId,
            'applicantName': dup.name || dup.email || dup.contact,
            'removed': VALUE.FALSE
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
    }
}