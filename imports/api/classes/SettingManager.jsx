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
        return PostingDB.update({ _id: data.selectedJobPost }, {
            '$set': {
                timestamp: data.timestamp,
                site: data.site,
                url: data.link,
                category: new Mongo.ObjectID(data.category),
                postedBy: userId
            }
        }, { upsert: true });
    }
    static recordDelete(id) {
        return PostingDB.remove({ _id: id });
    }
    static getReports() {
        let categories = CategoriesDB.find().fetch();
        let lastMonth = moment().subtract(1, 'month').add(1, 'day');
        let endLastMonth = lastMonth.add(1, 'month').subtract(1, 'day');
        let row = [],
            row2 = [],
            row3 = [];
        let positions = {};
        let positionsLabel = [];
        let positionsObj = {};
        categories.forEach((category) => {
            positions[category._id._str] = category.category;
            positionsObj[category.category] = 0;
            positionsLabel.push(category.category);
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
        for (let i = 0; i < 10; i++) {
            let date = dayStart.add(1, 'days').format('MMM-DD-YYYY');
            postLabel.push(date);
            postData.push({ date, ...positionsObj });
            newData.push({ date, ...positionsObj });
            preData.push({ date, ...positionsObj });
            intData.push({ date, ...positionsObj });
            quaData.push({ date, ...positionsObj });
            hiredData.push({ date, ...positionsObj });
        }
        posts2.forEach((post) => {
            let category = positions[post.category._str];
            let date = moment(post.timestamp).format('MMM-DD-YYYY');
            let index = postData.map(function (e) { return e.date; }).indexOf(date);
            postData[index][category]++;
        });
        newApplicants2.forEach((applicant) => {
            let date = moment(applicant.createdAt).format('MMM-DD-YYYY');
            let index = newData.map(function (e) { return e.date; }).indexOf(date);
            newData[index][applicant.category]++;
            if (applicant.status === CANDIDATE_STATUS.PRE_QUALIFIED.toString())
                preData[index][applicant.category]++;
            if (applicant.status === CANDIDATE_STATUS.INT.toString())
                intData[index][applicant.category]++;
            if (applicant.status === CANDIDATE_STATUS.QUALIFIED.toString())
                quaData[index][applicant.category]++;
            if (applicant.status === CANDIDATE_STATUS.HIRED.toString())
                hiredData[index][applicant.category]++;
        });
        return [row, row2, { post: postData, new: newData, pre: preData, int: intData, qua: quaData, hired: hiredData, labels: positionsLabel }];
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