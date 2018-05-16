import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';

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
            PostingDB.insert({
                timestamp: data.timestamp,
                site: data.site,
                url: data.link,
                category: new Mongo.ObjectID(data.category),
                postedBy: this.userId
            });
        } catch (err) {
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[GetPostingStat] = function (opt) {
        try {
            check(this.userId, String);
            check(opt.agentId, String);
            let retval = {};
            let criteria = '$category';
            let query = {};
            if (opt.category !== '0')
                query.category = new MongoInternals.NpmModule.ObjectID(opt.category);
            if (opt.range && opt.range.from && opt.range.to) {
                let range = moment(opt.range.to).diff(moment(opt.range.from), 'days');
                query.timestamp = { $lte: opt.range.to, $gte: opt.range.from };
                if (opt.agentId !== '0')
                    query.postedBy = opt.agentId;
                if (range < 32) {
                    criteria = {
                        category: '$category',
                        criteria: '$day',
                        day: '$day',
                        month: '$month',
                        year: '$year'
                    };
                } else if (range < 32 * 12) {
                    criteria = {
                        category: '$category',
                        criteria: '$month',
                        month: '$month',
                        year: '$year'
                    };
                } else {
                    criteria = {
                        category: '$category',
                        criteria: '$year',
                        year: '$year'
                    };
                }
            }
            let pipeline = [
                {
                    $match: query
                },
                {
                    $project: {
                        category: '$category',
                        hour: {
                            $hour: {
                                $add: [new Date(0), '$timestamp']
                            }
                        },
                        day: {
                            $dayOfMonth: {
                                $add: [new Date(0), '$timestamp']
                            },
                        },
                        month: {
                            $month: {
                                $add: [new Date(0), '$timestamp']
                            }
                        },
                        year: {
                            $year: {
                                $add: [new Date(0), '$timestamp']
                            }
                        }

                    }
                },
                {
                    $group: {
                        _id: {
                            id: criteria,
                        },
                        total: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        '_id.id.year': 1,
                        '_id.id.month': 1,
                        '_id.id.day': 1,
                        '_id.id.hr': 1,
                    }
                }
            ];
            PostingDB.aggregate(pipeline).forEach((item) => {
                let date = '';
                if (criteria != '$category') {
                    if (criteria.criteria == '$month')
                        date = moment(new Date(`${item._id.id.month} 1, ${item._id.id.year} 00:00:00`)).format('MM (MMM), YYYY');
                    else if (criteria.criteria == '$year')
                        date = item._id.id.year;
                    else
                        date = moment(new Date(`${item._id.id.month} ${item._id.id.day}, ${item._id.id.year} 00:00:00`)).format('DD-MMM-YYYY');
                }
                if (!retval[date]) {
                    retval[date] = { [item._id.id.category]: item.total };
                } else {
                    retval[date][item._id.id.category] = item.total;
                }
            });
            let temp = [];
            for (key in retval) {
                temp.push({ date: key, ...retval[key] });
            }
            return temp;
        } catch (err) {
            console.log(err);
            throw new Meteor.Error(403, 'Not authorized');
        }
    }
    functions[SettingsSave] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            return SettingsDB.update({}, data, { upsert: true });
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