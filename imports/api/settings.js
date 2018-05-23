import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import SettingManager from './classes/SettingManager';

export const SettingsPub = 'settings';
export const SettingsSave = 'settings_save';
export const RecordJob = 'record-job';
export const GetPostingStat = 'posting-stat';
export const SettingsDB = new Mongo.Collection(Meteor.settings.public.collections.settings || 'settings', { idGeneration: 'MONGO' });
export const PostingDB = new Mongo.Collection(Meteor.settings.public.collections.posts || 'posts', { idGeneration: 'MONGO' });


if (Meteor.isServer) {
    functions[RecordJob] = function (data) {
        this.unblock();
        try {
            check(this.userId, String);
            return SettingManager.record(data);
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
}