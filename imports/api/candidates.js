import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted, VALUE, SEARCH } from './classes/Const';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import Util from './classes/Utilities';
import CandidateManager from './classes/CandidateManager';

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
    functions[CandidatesFollower] = function (id, user, follow) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            check(user, String);
            return CandidateManager.updateCandidateFollowers(id, user, follow);
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
            return CandidateManager.claimCandidate(id, user);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesClaim] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return CandidateManager.claimCandidate(id);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesUnclaim] = function (id) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return CandidateManager.claimCandidate(id, '');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesInfo] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            return CandidateManager.updateCandidateInfo(data.contact, data);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesStats] = function (data, contact) {
        try {
            check(this.userId, String);
            check(data, Object);
            return CandidateManager.updateCandidateStats(contact, data);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidateCreate] = function (obj) {
        try {
            check(obj, Object);
            let candidate = new CandidateManager(obj);
            candidate.flush();
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
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_FORMS))
                return CandidateManager.getId(email);
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

            if (candidate.filter.indexOf(SEARCH.resume) > -1)
                query['resume'] = { $gte: 1 };
            if (candidate.filter.indexOf(SEARCH.portfolio) > -1)
                query['portfolio'] = { $gte: 5 };
            if (candidate.filter.indexOf(SEARCH.disc) > -1)
                query['disc'] = { $gte: 5 };
            if (candidate.filter.indexOf(SEARCH.values) > -1)
                query['values'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.iq) > -1)
                query['iq'] = { $gte: 110 };
            if (candidate.filter.indexOf(SEARCH.TEST_METEOR) > -1)
                query['TEST_METEOR'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_LIVE) > -1)
                query['TEST_LIVE'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_WRITING) > -1)
                query['TEST_WRITING'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.VIDEO) > -1)
                query['VIDEO'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.INTERVIEW) > -1)
                query['INTERVIEW'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.MANAGER) > -1)
                query['MANAGER'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_IMAGE) > -1)
                query['TEST_IMAGE'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_CREATIVE) > -1)
                query['TEST_CREATIVE'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_WEBFLOW) > -1)
                query['TEST_WEBFLOW'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_MOCK) > -1)
                query['TEST_MOCK'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.TEST_SIMULATION) > -1)
                query['TEST_SIMULATION'] = { $gte: 10 };
            if (candidate.filter.indexOf(SEARCH.others) > -1)
                query['others'] = { $gte: 10 };

            if (or.length)
                query['$or'] = or;
            let count = CandidatesDB.find(query, { sort: { 'lastMessage.createdAt': -1 } }).count();
            let cursor = CandidatesDB.find(query, { sort: { 'lastMessage.createdAt': -1 }, limit: candidate.limit });
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