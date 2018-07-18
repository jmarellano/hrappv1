import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import SettingManager from './classes/SettingManager';
import { isPermitted, ROLES } from "./classes/Const";
import MessageManager from "./classes/MessageManager";

export const SettingsPub = 'settings';
export const PostPub = 'posts';
export const SettingsSave = 'settings_save';
export const RecordJob = 'record-job';
export const DeleteJob = 'delete-job';
export const GetPostingStat = 'posting-stat';
export const GetReports = 'get-reports';
export const SettingsDB = new Mongo.Collection(Meteor.settings.public.collections.settings || 'settings', { idGeneration: 'MONGO' });
export const PostingDB = new Mongo.Collection(Meteor.settings.public.collections.posts || 'posts', { idGeneration: 'MONGO' });


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
    functions[RecordJob] = function (data) {
        this.unblock();
        try {
            check(this.userId, String);
            return SettingManager.record(data, this.userId);
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