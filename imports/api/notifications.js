import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';
export const NotifPub = 'notifications';
export const NotificationsDB = new Mongo.Collection(Meteor.settings.public.collections.notifications || 'notifications', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    Meteor.publish(NotifPub, function (key = {}, option = {}) {
        try {
            check(this.userId, String);
            this.unblock();
            option.sort = { createdAt: -1 };
            key.createdAt = {
                $gte: moment().startOf('day').valueOf(),
                $lt: moment().endOf('day').valueOf()
            };
            return NotificationsDB.find(key, option);
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    });
}