import { Mongo } from 'meteor/mongo';
import { CategoriesDB } from '../categories';
import { CandidatesDB } from '../candidates';
import { SettingsDB, PostingDB } from '../settings';
import { CANDIDATE_STATUS } from './Const';
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
    static record(data, userId) {
        return PostingDB.insert({
            timestamp: data.timestamp,
            site: data.site,
            url: data.link,
            category: new Mongo.ObjectID(data.category),
            postedBy: userId
        });
    }
    static getReports() {
        let categories = CategoriesDB.find().fetch();
        let lastMonth = moment().subtract(1, 'month').add(1, 'day');
        let endLastMonth = lastMonth.add(1, 'month').subtract(1, 'day');
        let row = [],
            row2 = [];
        let positions = {};
        let positionsLabel = [];
        let positionsObj = {};
        let positions2 = {};
        let positionsLabel2 = [];
        let positionsObj2 = {};
        categories.forEach((category) => {
            if (category.technical === "true") {
                positions[category._id._str] = category.category;
                positionsObj[category.category] = 0;
                positionsLabel.push(category.category);
            } else {
                positions2[category._id._str] = category.category;
                positionsObj2[category.category] = 0;
                positionsLabel2.push(category.category);
            }
            let posts = PostingDB.find({ category: category._id, timestamp: { $lte: endLastMonth.valueOf(), $gte: lastMonth.valueOf() } }).count();
            let newApplicants = CandidatesDB.find({ category: category._id, timestamp: { $lte: endLastMonth.valueOf(), $gte: lastMonth.valueOf() } }).fetch();
            let applicants = 0,
                preQualified = 0,
                interviewed = 0,
                qualified = 0,
                hired = 0;
            newApplicants.forEach((applicant) => {
                applicants++;
                if (applicant.status === CANDIDATE_STATUS.PRE_QUALIFIED)
                    preQualified++;
                if (applicant.status === CANDIDATE_STATUS.INT)
                    interviewed++;
                if (applicant.status === CANDIDATE_STATUS.QUALIFIED)
                    qualified++;
                if (applicant.status === CANDIDATE_STATUS.HIRED)
                    hired++;
            });

            let percentage = (newApplicants / posts) * 100;
            row.push({ post: category.category, jobPosts: posts, new: applicants, percentage: isNaN(percentage) ? 0 : percentage });
            row2.push({ post: category.category, new: applicants, preQualified, interviewed, qualified, hired });
        });

        let dayStart = moment().subtract(11, 'days').startOf('day');
        let dayEnd = moment().startOf('day');
        let posts2 = PostingDB.find({ timestamp: { $lt: dayEnd.valueOf(), $gte: dayStart.valueOf() } }, { sort: { timestamp: 1 } }).fetch();
        let newApplicants2 = CandidatesDB.find({ createdAt: { $lt: dayEnd.valueOf(), $gte: dayStart.valueOf() } }, { sort: { createdAt: 1 } }).fetch();

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

        for (let i = 0; i < 10; i++) {
            let date = dayStart.add(1, 'days').format('MMM-DD-YYYY');
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
        }
        posts2.forEach((post) => {
            let category = positions[post.category._str];
            if (category) {
                let date = moment(post.timestamp).format('MMM-DD-YYYY');
                let index = postData.map(function (e) { return e.date; }).indexOf(date);
                postData[index][category]++;
            } else {
                category = positions2[post.category._str];
                let date = moment(post.timestamp).format('MMM-DD-YYYY');
                let index = postData2.map(function (e) { return e.date; }).indexOf(date);
                postData2[index][category]++;
            }
        });
        newApplicants2.forEach((applicant) => {
            let date = moment(applicant.createdAt).format('MMM-DD-YYYY');
            let index = newData.map(function (e) { return e.date; }).indexOf(date);
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
        });
        return [
            row,
            row2,
            { post: postData, new: newData, pre: preData, int: intData, qua: quaData, hired: hiredData, labels: positionsLabel },
            { post: postData2, new: newData2, pre: preData2, int: intData2, qua: quaData2, hired: hiredData2, labels: positionsLabel2 }
        ];
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