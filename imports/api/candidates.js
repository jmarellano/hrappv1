import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted, VALUE, SEARCH, CANDIDATE_STATUS } from './classes/Const';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import Util from './classes/Utilities';
import CandidateManager from './classes/CandidateManager';
import moment from "moment-timezone";

export const ValidCandidates = 'candidates_valid';
export const CandidatesPub = 'candidates_pub';
export const CandidateCreate = 'candidates_create';
export const CandidatesGetId = 'candidates_get_id';
export const CandidatesInfo = 'candidates_info';
export const CandidatesStats = 'candidates_stats';
export const CandidatesClaim = 'candidates_claim';
export const CandidatesUnclaim = 'candidates_unclaim';
export const CandidatesTransferClaim = 'candidates_transfer';
export const CandidatesFollower = 'candidates_follower';
export const CandidatesAddInfo = 'candidates_add_info';
export const CandidatesAddFileStats = 'candidates_add_file_stats';
export const CandidatesRemoveFileStats = 'candidates_remove_file_stats';
export const MessagesUnreadCountPub = 'candidates_messages_read';
export const CandidatesStatus = 'candidates_status';

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
            return CandidateManager.claimCandidate(id, this.userId);
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
    functions[CandidatesStatus] = function (id, flag) {
        try {
            check(this.userId, String);
            check(id, Mongo.ObjectID);
            return CandidateManager.status(id, flag);
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
    functions[CandidatesAddInfo] = function (contact, info, value) {
        try {
            check(this.userId, String);
            check(contact, Mongo.ObjectID);
            check(info, String);
            check(value, String);
            return CandidateManager.updateCandidateSelectedInfo(contact, info, value);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesAddFileStats] = function (contact, info, value) {
        try {
            check(this.userId, String);
            check(contact, Mongo.ObjectID);
            check(info, String);
            check(value, String);
            let info_trim = info.replace(/_notes|_file/gi, '');
            return CandidateManager.updateCandidateSelectedInfo(contact, info, value, `${Meteor.user().username} attached a file / notes to ${info_trim}`);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CandidatesRemoveFileStats] = function (contact, info) {
        try {
            check(this.userId, String);
            check(contact, Mongo.ObjectID);
            check(info, String);
            let info_trim = info.replace(/_notes|_file/gi, '');
            return CandidateManager.updateCandidateSelectedRemoveFile(contact, info, `${Meteor.user().username} removed a file to ${info_trim}`);
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
            return CandidateManager.getId(email);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    Meteor.publish(CandidatesPub, function () {
        try {
            let cursor = CandidatesDB.find({
                name: { $exists: true },
                createdAt: { $exists: true },
                '$or': [
                    { email: { $exists: true } },
                    { number: { $exists: true } },
                    { address: { $exists: true } },
                ]
            }, { sort: { name: 1, createdAt: -1 } });
            Util.setupHandler(this, databaseName, cursor, (doc) => {
                //setup doc
                let newDoc = doc;
                if (doc.createdAt)
                    newDoc.joinedDt = moment(doc.createdAt).format('MMMM DD, YYYY');
                if (doc.status) {
                    let friendlyStatus = "";
                    switch (parseInt(doc.status)) {
                        case CANDIDATE_STATUS.NA:
                            friendlyStatus = "N/A Status";
                            break;
                        case CANDIDATE_STATUS.ABANDONED:
                            friendlyStatus = "ABANDONED";
                            break;
                        case CANDIDATE_STATUS.DEV_METEOR:
                            friendlyStatus = "DEV_METEOR";
                            break;
                        case CANDIDATE_STATUS.DEV_LT:
                            friendlyStatus = "DEV_LT";
                            break;
                        case CANDIDATE_STATUS.DQ_FOREIGNER:
                            friendlyStatus = "DQ_FOREIGNER";
                            break;
                        case CANDIDATE_STATUS.DQ_GREY:
                            friendlyStatus = "DQ_GREY";
                            break;
                        case CANDIDATE_STATUS.DQ_ECO:
                            friendlyStatus = "DQ_ECO";
                            break;
                        case CANDIDATE_STATUS.DQ_SAL:
                            friendlyStatus = "DQ_SAL";
                            break;
                        case CANDIDATE_STATUS.DQ_NOT_FIT:
                            friendlyStatus = "DQ_NOT_FIT";
                            break;
                        case CANDIDATE_STATUS.FAILED_INT:
                            friendlyStatus = "FAILED_INT";
                            break;
                        case CANDIDATE_STATUS.FAILED_METEOR:
                            friendlyStatus = "FAILED_METEOR";
                            break;
                        case CANDIDATE_STATUS.HIRED:
                            friendlyStatus = "HIRED";
                            break;
                        case CANDIDATE_STATUS.INC:
                            friendlyStatus = "INC";
                            break;
                        case CANDIDATE_STATUS.INQ:
                            friendlyStatus = "INQ";
                            break;
                        case CANDIDATE_STATUS.INT:
                            friendlyStatus = "INT";
                            break;
                        case CANDIDATE_STATUS.NO_RESPONSE:
                            friendlyStatus = "NO_RESPONSE";
                            break;
                        case CANDIDATE_STATUS.NO_SHOW:
                            friendlyStatus = "NO_SHOW";
                            break;
                        case CANDIDATE_STATUS.QUALIFIED:
                            friendlyStatus = "QUALIFIED";
                            break;
                        case CANDIDATE_STATUS.REDIRECT:
                            friendlyStatus = "REDIRECT";
                            break;
                        case CANDIDATE_STATUS.RESCHEDULED:
                            friendlyStatus = "RESCHEDULED";
                            break;
                        case CANDIDATE_STATUS.SCHED_INT:
                            friendlyStatus = "SCHED_INT";
                            break;
                        case CANDIDATE_STATUS.SCHED_LT:
                            friendlyStatus = "SCHED_LT";
                            break;
                        case CANDIDATE_STATUS.WITHDREW:
                            friendlyStatus = "WITHDREW";
                            break;
                        case CANDIDATE_STATUS.PRE_QUALIFIED:
                            friendlyStatus = "PRE_QUALIFIED";
                            break;
                    }
                    newDoc.friendlyStatus = friendlyStatus;
                } else
                    newDoc.friendlyStatus = "N/A Status";
                return newDoc;
            });
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    });
    Meteor.publish(ValidCandidates, function (candidate) {
        try {
            let query = { 'retired': VALUE.FALSE };
            let or = [];
            let or1 = [];
            let or2 = [];
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
            if (candidate.filter.indexOf(SEARCH.CONTEXT) > -1)
                or.push({ 'lastMessage.text': { $regex: searchString, $options: 'i' } });
            if (candidate.filter.indexOf(SEARCH.TITLE) > -1)
                or.push({ 'lastMessage.subject': { $regex: searchString, $options: 'i' } });
            if (!(or.length && searchString.length))
                or = [];
            if (candidate.filter.indexOf(SEARCH.CLAIMED) > -1) {
                or1.push({ claimed: { $exists: true } });
                or1.push({ claimed: { $ne: null } });
            }
            if (candidate.filter.indexOf(SEARCH.UNCLAIMED) > -1)
                or1.push({ claimed: { $exists: false } });
            if (candidate.filter.indexOf(SEARCH.ASSIGNED) > -1)
                or1.push({ claimed: this.userId });
            if (candidate.filter.indexOf(SEARCH.FOLLOWING) > -1)
                or1.push({ 'followers.id': this.userId });

            if (candidate.filter.indexOf(CANDIDATE_STATUS.NA) > -1)
                or2.push({ 'status': { $exists: false } });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.ABANDONED) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.ABANDONED + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DEV_METEOR) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DEV_METEOR + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DEV_LT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DEV_LT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DQ_FOREIGNER) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DQ_FOREIGNER + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DQ_GREY) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DQ_GREY + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DQ_ECO) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DQ_ECO + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DQ_SAL) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DQ_SAL + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.DQ_NOT_FIT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.DQ_NOT_FIT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.FAILED_INT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.FAILED_INT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.FAILED_METEOR) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.FAILED_METEOR + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.HIRED) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.HIRED + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.INC) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.INC + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.INQ) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.INQ + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.INT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.INT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.NO_RESPONSE) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.NO_RESPONSE + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.NO_SHOW) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.NO_SHOW + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.QUALIFIED) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.QUALIFIED + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.REDIRECT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.REDIRECT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.RESCHEDULED) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.RESCHEDULED + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.SCHED_INT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.SCHED_INT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.SCHED_LT) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.SCHED_LT + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.WITHDREW) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.WITHDREW + '' });
            if (candidate.filter.indexOf(CANDIDATE_STATUS.PRE_QUALIFIED) > -1)
                or2.push({ 'status': CANDIDATE_STATUS.PRE_QUALIFIED + '' });

            if (candidate.filter.indexOf(SEARCH.resume) > -1)
                query['resume'] = { $gte: 5 };
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

            let andQ = [];
            if (or.length)
                andQ.push({ '$or': or });
            if (or1.length)
                andQ.push({ '$or': or1 });
            if (or2.length)
                andQ.push({ '$or': or2 });
            if (andQ.length > 1)
                query['$and'] = andQ;
            else if (or.length)
                query['$or'] = or;
            else if (or1.length)
                query['$or'] = or1;
            else if (or2.length)
                query['$or'] = or2;
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
    Meteor.publish(MessagesUnreadCountPub, function () {
        Counts.publish(this, MessagesUnreadCountPub, CandidatesDB.find({ retired: VALUE.FALSE, 'lastMessage.read': false }));
        Counts.publish(this, MessagesUnreadCountPub + '_claimed', CandidatesDB.find({ retired: VALUE.FALSE, 'lastMessage.read': false, claimed: { $exists: true } }));
        Counts.publish(this, MessagesUnreadCountPub + '_unclaimed', CandidatesDB.find({ retired: VALUE.FALSE, 'lastMessage.read': false, claimed: { $exists: false } }));
    });
}