import { Mongo } from 'meteor/mongo';
import { CategoriesDB } from '../categories';
import { SettingsDB, PostingDB, PostingSitesDB, ReportsDB } from '../settings';
import { CANDIDATE_STATUS, COUNTRIES } from './Const';
import { CandidatesDB } from '../candidates';

import moment from 'moment-timezone';

export default class SettingManager {
    constructor(obj = {}) {
        this.json = {
            emailGetInterval: obj.emailGetInterval || 9000,
            country: obj.country || 172
        };
        if (obj._id)
            this.json._id = obj._id;
    }
    parseCategory(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json._d) {
            if (SettingsDB.update(this.json._id, this.json)) {
                return;
            }
        }
        return (this.json._id = SettingsDB.insert(this.json));
    }
    static save(data) {
        return SettingsDB.update({}, data, { upsert: true });
    }
    static addSite(site) {
        return PostingSitesDB.insert({ site: site.toLowerCase() });
    }
    static record(data, userId) {
        return PostingDB.update({ _id: data.selectedJobPost }, {
            '$set': {
                timestamp: data.timestamp,
                site: data.site,
                url: data.link,
                category: new Mongo.ObjectID(data.category),
                country: data.country,
                postedBy: userId
            }
        }, { upsert: true });
    }
    static recordDelete(id) {
        return PostingDB.remove({ _id: id });
    }
    static getReports(type, start, country) {
        let dayStart = null,
            dayEnd = null,
            report = [],
            query = {},
            result = {};
        switch (type) {
            case 0:
                dayStart = moment().tz('EST').subtract(10, 'days').startOf('day');
                dayEnd = moment().tz('EST').endOf('day');
                report = this.generateReport(dayStart, dayEnd, country);
                break;
            case 1:
                dayStart = moment().tz('EST').startOf('month');
                dayEnd = moment().tz('EST').endOf('month');
                report = this.generateReport(dayStart, dayEnd, country);
                break;
            case 2:
                dayStart = moment().tz('EST').startOf('week');
                dayEnd = moment().tz('EST').endOf('week');
                report = this.generateReport(dayStart, dayEnd, country);
                break;
            case 3:
                query[start] = { '$exists': true }
                result = ReportsDB.findOne(query);
                if (result)
                    report = result[start];
                else
                    report = [[], []];
                break;
        }
        return [
            report[0],
            report[1]
        ];
    }
    static generateReport(dayStart, dayEnd, PostDB, country = null) {
        let categories = CategoriesDB.find().fetch();
        let positions = {};
        let positionsLabel = [];
        let positionsObj = {};
        let positions2 = {};
        let positionsLabel2 = [];
        let positionsObj2 = {};
        let positionColors = [];
        let positionColors2 = [];
        categories.forEach((category) => {
            if (category.technical === "true") {
                positions[category._id._str] = category.category;
                positionsObj[category.category] = 0;
                positionsLabel.push(category.category);
                positionColors.push(category.color);
            } else {
                positions2[category._id._str] = category.category;
                positionsObj2[category.category] = 0;
                positionsLabel2.push(category.category);
                positionColors2.push(category.color);
            }
        });
        let query = { timestamp: { $lte: dayEnd.valueOf(), $gte: dayStart.valueOf() } };
        let query2 = { joinedDate: { $lte: dayEnd.valueOf(), $gte: dayStart.valueOf() } };
        if (country) {
            query['country'] = country.toString();
            query2['country'] = COUNTRIES[country.toString()].name;
        }
        let posts2 = PostDB.find(query, { sort: { timestamp: 1 } }).fetch();
        let newApplicants2 = CandidatesDB.find(query2, { sort: { joinedDate: 1 } }).fetch();

        let postData = [];
        let newData = [];
        let preData = [];
        let intData = [];
        let quaData = [];
        let hiredData = [];
        let postLabel = [];
        let postData2 = [];
        let newData2 = [];
        let preData2 = [];
        let intData2 = [];
        let quaData2 = [];
        let hiredData2 = [];
        let postLabel2 = [];
        let advData2 = [];
        let countDiff = dayEnd.diff(dayStart, 'days');
        for (let i = 0; i < (countDiff + 1); i++) {
            let date = dayStart.tz('EST').format('MMM-DD-YYYY');
            postLabel.push(date);
            postData.push({ date, ...positionsObj });
            newData.push({ date, ...positionsObj });
            preData.push({ date, ...positionsObj });
            intData.push({ date, ...positionsObj });
            quaData.push({ date, ...positionsObj });
            hiredData.push({ date, ...positionsObj });
            postLabel2.push(date);
            postData2.push({ date, ...positionsObj2 });
            newData2.push({ date, ...positionsObj2 });
            preData2.push({ date, ...positionsObj2 });
            intData2.push({ date, ...positionsObj2 });
            quaData2.push({ date, ...positionsObj2 });
            hiredData2.push({ date, ...positionsObj2 });
            advData2.push({ date, 'METEOR_TEST': 0, 'LIVE_TEST': 0, 'GD_LIVE_TEST': 0 });
            dayStart.tz('EST').add(1, 'days').format('MMM-DD-YYYY');
        }
        posts2.forEach((post) => {
            let category = positions[post.category._str];
            if (category) {
                let date = moment(post.timestamp).tz('EST').format('MMM-DD-YYYY');
                let index = postData.map(function (e) { return e.date; }).indexOf(date);
                postData[index][category]++;
            } else {
                category = positions2[post.category._str];
                let date = moment(post.timestamp).tz('EST').format('MMM-DD-YYYY');
                let index = postData2.map(function (e) { return e.date; }).indexOf(date);
                postData2[index][category]++;
            }
        });
        newApplicants2.forEach((applicant) => {
            let date = moment(applicant.createdAt).tz('EST').format('MMM-DD-YYYY');
            let index = newData.map(function (e) { return e.date; }).indexOf(date);
            if (index > -1) {
                if (newData[index][applicant.category] > -1) {
                    newData[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.PRE_QUALIFIED.toString())
                        preData[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.INT.toString())
                        intData[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.QUALIFIED.toString())
                        quaData[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.HIRED.toString())
                        hiredData[index][applicant.category]++;
                    if (applicant.TEST_METEOR)
                        advData2[index]['METEOR_TEST']++;
                    if (applicant.TEST_LIVE) {
                        if (applicant.category === 'Dev')
                            advData2[index]['LIVE_TEST']++;
                        else
                            advData2[index]['GD_LIVE_TEST']++;
                    }
                } else {
                    index = newData2.map(function (e) { return e.date; }).indexOf(date);
                    newData2[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.PRE_QUALIFIED.toString())
                        preData2[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.INT.toString())
                        intData2[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.QUALIFIED.toString())
                        quaData2[index][applicant.category]++;
                    if (applicant.status === CANDIDATE_STATUS.HIRED.toString())
                        hiredData2[index][applicant.category]++;
                }
            }
        });
        return [
            { post: postData, new: newData, pre: preData, int: intData, qua: quaData, hired: hiredData, labels: positionsLabel, dates: postLabel, adv: advData2, colors: positionColors },
            { post: postData2, new: newData2, pre: preData2, int: intData2, qua: quaData2, hired: hiredData2, labels: positionsLabel2, dates: postLabel, colors: positionColors2 }
        ];
    }
    static savePrevReports() {
        let monthly = this.getReports(1, null, null),
            datetime = moment();
        let query = {},
            obj = {};
        query[datetime.format('YYYY-MM')] = { '$exists': true };
        obj[datetime.format('YYYY-MM')] = monthly;
        if (ReportsDB.update(query, { $set: obj }, { upsert: true }))
            console.log("Created Report for today...", moment().format('MM-DD-YYYY'));
    }
    static getPostingStat(opt) {
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
            if (opt.agentId === '')
                query.postedBy = { $exists: true };
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
                    date = moment(new Date(`${item._id.id.month} 1, ${item._id.id.year} 00:00:00`)).utc().format('MM (MMM), YYYY');
                else if (criteria.criteria == '$year')
                    date = item._id.id.year;
                else
                    date = moment(new Date(`${item._id.id.month} ${item._id.id.day}, ${item._id.id.year} 00:00:00`)).utc().format('DD-MMM-YYYY');
            }
            if (!retval[date]) {
                retval[date] = { [item._id.id.category]: item.total };
            } else {
                retval[date][item._id.id.category] = item.total;
            }
        });
        let temp = [];
        Object.keys(retval).forEach((key) => {
            temp.push({ date: key, ...retval[key] });
        });
        return temp;
    }
}