import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import AdsManager from './classes/AdsManager';
import { isPermitted, ROLES } from "./classes/Const";
import moment from "moment-timezone";
export const PostPub = 'jobs';
export const RecordJobAd = 'record-job-ad';
export const DeleteJobAd = 'delete-job-ad';
export const GetPostingStat = 'posting-stat';
export const JobsDB = new Mongo.Collection(Meteor.settings.public.collections.jobs || 'jobs', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[RecordJobAd] = function (data) {
        this.unblock();
        try {
            check(this.userId, String);
            let user = Meteor.user();
            if (data.selectedJobPost && !isPermitted(user.profile.role, ROLES.MANAGE_JOB_POSTS))
                throw new Meteor.Error(403, 'Not authorized');
            return AdsManager.record(data, this.userId);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[DeleteJobAd] = function (id) {
        this.unblock();
        try {
            check(this.userId, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.MANAGE_JOB_POSTS)) {
                return AdsManager.recordDelete(id);
            }
            throw new Meteor.Error(403, "Not authorized");
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    Meteor.publish(PostPub, function (key = {}) {
        this.unblock();
        try {
            check(this.userId, String);
            return JobsDB.find(key);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    });
}
