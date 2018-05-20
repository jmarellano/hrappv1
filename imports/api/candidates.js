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
export const CandidatesStats = 'candidates_stats';
export const CandidatesClaim = 'candidates_claim';
export const CandidatesUnclaim = 'candidates_unclaim';
export const CandidatesTransferClaim = 'candidates_transfer';
export const CandidatesFollower = 'candidates_follower';


let databaseName = Meteor.settings.public.collections.candidates || 'candidates';
export const CandidatesDB = new Mongo.Collection(databaseName, { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[CandidatesFollower] = function (id, user, follow = false) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            check(user, String);
            console.log('test', user);
            if (follow)
                return CandidatesDB.update({ _id: id }, { $push: { 'followers': { id: user, typing: false } } });
            else
                return CandidatesDB.update({ _id: id }, { $pull: { 'followers': { id: user } } });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesTransferClaim] = function (id, user) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            check(user, String);
            return CandidatesDB.update({ _id: id }, {
                $set: {
                    'claimed': user
                }
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesClaim] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return CandidatesDB.update({ _id: id }, {
                $set: {
                    'claimed': this.userId
                }
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesUnclaim] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return CandidatesDB.update({ _id: id }, {
                $unset: {
                    'claimed': ''
                }
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
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
            if (!(or.length && searchString.length))
                or = [];
            if (candidate.filter.indexOf(SEARCH.CLAIMED) > -1) {
                or.push({ claimed: { $exists: true } });
                or.push({ claimed: { $ne: null } });
            }
            if (candidate.filter.indexOf(SEARCH.UNCLAIMED) > -1)
                or.push({ claimed: { $exists: false } });
            if (candidate.filter.indexOf(SEARCH.ASSIGNED) > -1)
                or.push({ claimed: this.userId });
            if (candidate.filter.indexOf(SEARCH.FOLLOWING) > -1)
                or.push({ 'followers.id': this.userId });
            if (or.length)
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