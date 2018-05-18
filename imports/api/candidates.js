import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted, VALUE, SEARCH } from './classes/Const';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import Util from './classes/Utilities';
import moment from 'moment';

export const ValidCandidates = 'candidates_valid';
export const CandidateCreate = 'candidates_create';
export const CandidatesGetId = 'candidates_get_id';
export const CandidatesInfo = 'candidates_info';
export const CandidatesStats = 'candidates_info';
let databaseName = Meteor.settings.public.collections.candidates || 'candidates';
export const CandidatesDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[CandidatesInfo] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            return CandidatesDB.update({ contact: data.contact }, {
                $set: {
                    'name': data.name,
                    'category': data.category,
                    'address': data.address,
                    'zip': data.zip,
                    'email': data.email,
                    'number': data.number && Util.numberValidator(data.number).isValid ? Util.numberValidator(data.number).e164Format : ''
                }
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesStats] = function (data, contact) {
        try {
            check(this.userId, String);
            check(data, Object);
            return CandidatesDB.update({ contact }, {
                $set: data
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
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
    Meteor.publish(ValidCandidates, function (candidate) {
        try {
            let query = { 'retired': VALUE.FALSE };
            let or = [];
            let searchString = candidate.search;
            let claimed = null;
            if (candidate.filter.indexOf(SEARCH.CLAIMED) > -1)
                claimed = { $exists: true };
            if (candidate.filter.indexOf(SEARCH.UNCLAIMED) > -1)
                claimed = { $exists: false };
            if (candidate.filter.indexOf(SEARCH.UNCLAIMED) < 0 && candidate.filter.indexOf(SEARCH.CLAIMED) < 0)
                claimed = null;
            if (candidate.filter.indexOf(SEARCH.UNCLAIMED) > -1 && candidate.filter.indexOf(SEARCH.CLAIMED) > -1)
                claimed = null;
            if (candidate.filter.indexOf(SEARCH.ASSIGNED) > -1 && (candidate.filter.indexOf(SEARCH.CLAIMED) < 0 && candidate.filter.indexOf(SEARCH.UNCLAIMED) < 0))
                claimed = this.userId;
            query['claimed'] = claimed;
            if (candidate.filter.indexOf(SEARCH.NAME) > -1)
                or.push({ name: { $regex: searchString, $options: 'i' } });
            if (candidate.filter.indexOf(SEARCH.EMAIL) > -1) {
                or.push({ email: { $regex: searchString, $options: 'i' } });
                or.push({ contact: { $regex: searchString, $options: 'i' } });
            }
            if (candidate.filter.indexOf(SEARCH.NUMBER) > -1) {
                or.push({ number: { $regex: searchString, $options: 'i' } });
                or.push({ contact: { $regex: searchString, $options: 'i' } });
            }
            if (candidate.filter.indexOf(SEARCH.CATEGORIES) > -1)
                or.push({ category: { $regex: searchString, $options: 'i' } });
            if (or.length && searchString.length)
                query['$or'] = or;
            let count = CandidatesDB.find(query, { sort: { createdAt: -1 } }).count();
            let cursor = CandidatesDB.find(query, { sort: { createdAt: -1 }, limit: candidate.limit });
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
}