import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import SettingManager from './classes/SettingManager';
import { isPermitted, ROLES } from "./classes/Const";
import MessageManager from "./classes/MessageManager";
import moment from "moment-timezone";

export const SettingsPub = 'settings';
export const PostingSitesPub = 'posting_sites';
export const PostPub = 'posts';
export const SettingsSave = 'settings_save';
export const AddSite = 'add-site';
export const RecordJob = 'record-job';
export const DeleteJob = 'delete-job';
export const GetPostingStat = 'posting-stat';
export const GetReports = 'get-reports';
export const SettingsDB = new Mongo.Collection(Meteor.settings.public.collections.settings || 'settings', { idGeneration: 'MONGO' });
export const PostingDB = new Mongo.Collection(Meteor.settings.public.collections.posts || 'posts', { idGeneration: 'MONGO' });
export const PostingSitesDB = new Mongo.Collection(Meteor.settings.public.collections.posts || 'posting_sites', { idGeneration: 'MONGO' });


if (Meteor.isServer) {
    functions[GetReports] = function (type, start, end) {
        try {
            check(this.userId, String);
            return SettingManager.getReports(type, start, end);
        } catch (err) {
            console.log(err);
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[RecordJob] = function (data, multi) {
        this.unblock();
        try {
            check(this.userId, String);
            if(!multi)
                return SettingManager.record(data, this.userId);
            let data_ = data.jobPost;
            if(!data_)
                throw new Meteor.Error(403, 'No Valid Data');
            for (let key in data_) {
                if (data_.hasOwnProperty(key)) {
                    let temp = {};
                    temp.site = key;
                    temp.link = data_[key].link;
                    temp.timestamp = moment().valueOf();
                    temp.category = data_[key].category;
                    temp.selectedJobPost = null;
                    console.log("temp: ", temp);
                    SettingManager.record(temp, this.userId);
                }
            }
            return true;
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[AddSite] = function(site){
        this.unblock();
        try {
            check(this.userId, String);
            return SettingManager.addSite(site);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[DeleteJob] = function (id) {
        this.unblock();
        try {
            check(this.userId, String);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.ADMIN) || isPermitted(this.props.user.role, ROLES.SUPERUSER)) {
                return SettingManager.recordDelete(id);
            }
            throw new Meteor.Error(403, "Not authorized");
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[GetPostingStat] = function (opt) {
        try {
            check(this.userId, String);
            check(opt.agentId, String);
            return SettingManager.getPostingStat(opt);
        } catch (err) {
            console.log(err);
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[SettingsSave] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            return SettingManager.save(data);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    };
    Meteor.publish(SettingsPub, function (key = {}) {
        this.unblock();
        try {
            check(this.userId, String);
            return SettingsDB.find(key);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    });
    Meteor.publish(PostingSitesPub, function (key = {}) {
        this.unblock();
        try {
            check(this.userId, String);
            return PostingSitesDB.find(key);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    });
    Meteor.publish(PostPub, function (key = {}) {
        this.unblock();
        try {
            check(this.userId, String);
            return PostingDB.find(key);
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    });
}