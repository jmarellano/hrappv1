import { Meteor } from 'meteor/meteor';
import { ROLES, ROUTES, isPermitted, VALUE } from './classes/Const';
import Util from './classes/Utilities';
import { check } from 'meteor/check';
import moment from 'moment';

export const ValidCandidates = "candidates_valid";
export const CandidateCreate = "candidates_create";
export const CandidatesGetId = "candidates_get_id";
let databaseName = Meteor.settings.public.collections.candidates || 'candidates';
export const CandidatesDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[CandidateCreate] = function (contact, lastMessage) {
        try {
            check(this.userId, String);
            check(contact, String);
            let candidate = CandidatesDB.findOne({ contact });
            if (candidate)
                return CandidatesDB.update({ contact }, {
                    $set: {
                        lastMessage
                    }
                });
            else
                return CandidatesDB.insert({
                    contact,
                    createdAt: moment().valueOf(),
                    retired: VALUE.FALSE,
                    lastMessage
                });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesGetId] = function (email) {
        try {
            check(this.userId, String);
            check(email, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_FORMS)) {
                let candidate = CandidatesDB.findOne({ $or: [{ contact: email }, { email }] });
                if (candidate)
                    return candidate._id._str;
                throw new Meteor.Error('BAD', 'No candidate associated in this email');
            }
            throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    Meteor.publish(ValidCandidates, function () {
        try {
            return CandidatesDB.find({ 'retired': VALUE.FALSE });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
        this.ready();
    });
}