import { VALUE } from './Const';
import { CandidatesDB } from '../candidates';
import Util from './Utilities';
import moment from 'moment-timezone';

export default class CandidateManager {
    constructor(obj = {}) {
        const createdAt = obj.createdAt || moment().utc().valueOf();
        this.json = {
            createdAt,
            contact: obj.contact.toLowerCase() || '',
            retired: obj.retired || VALUE.FALSE,
            lastMessage: obj.lastMessage || {}
        };
        if (obj.contact)
            this.json.contact = obj.contact.toLowerCase();
        if (obj.number)
            this.json.number = obj.number;
        if (obj.email)
            this.json.email = obj.email.toLowerCase();
    }
    parseCandidate(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json.number)
            if (
                CandidatesDB.update({ number: this.json.number }, {
                    $set: {
                        retired: this.json.retired,
                        lastMessage: this.json.lastMessage
                    }
                })
            ) {
                return;
            }
        if (this.json.email)
            if (
                CandidatesDB.update({ email: this.json.email }, {
                    $set: {
                        retired: this.json.retired,
                        lastMessage: this.json.lastMessage
                    }
                })
            ) {
                return;
            }
        return (this.json.contact = CandidatesDB.insert(this.json));
    }
    static updateCandidateInfo(contact, data) {
        let candidate = CandidatesDB.findOne({ contact: contact });
        let joinedDate = candidate.joinedDate;
        if (!candidate.joinedDate)
            joinedDate = moment().valueOf();
        return CandidatesDB.update({ contact: contact }, {
            $set: {
                'name': data.name,
                'category': data.category,
                'address': data.address,
                'city': data.city,
                'country': data.country,
                'state': data.state,
                'zip': data.zip,
                'email': data.email,
                'remarks': data.remarks,
                'number': data.number && Util.numberValidator(data.number).isValid ? Util.numberValidator(data.number).e164Format : '',
                joinedDate: joinedDate
            }
        });
    }
    static updateCandidateSelectedInfo(contact, info, value, text) {
        let set = {};
        set[info] = value;
        let info_trim = info.replace(/_notes|_file/gi, '');
        let obj = {
            $set: set
        };
        if (text)
            obj['$push'] = { [info_trim + '_history']: { text, date: moment().valueOf() } };
        return CandidatesDB.update({ _id: contact }, obj);
    }
    static updateCandidateSelectedRemoveFile(contact, info, text) {
        let set = {};
        set[info] = '';
        let info_trim = info.replace(/_notes|_file/gi, '');
        let obj = {
            $set: set
        };
        if (text)
            obj['$push'] = { [info_trim + '_history']: { text, date: moment().valueOf() } };
        return CandidatesDB.update({ _id: contact }, obj);
    }
    static updateCandidateStats(contact, data) {
        let temp = {};
        Object.keys(data).forEach((item) => {
            temp[item] = data[item];
        });
        return CandidatesDB.update({ contact: contact }, {
            $set: temp
        });
    }
    static updateCandidateFollowers(id, user, follow = false) {
        if (follow)
            return CandidatesDB.update({ _id: id }, { $push: { 'followers': { id: user, typing: false } } });
        else
            return CandidatesDB.update({ _id: id }, { $pull: { 'followers': { id: user } } });
    }
    static claimCandidate(id, user) {
        if (user === '')
            return CandidatesDB.update({ _id: id }, {
                $unset: {
                    'claimed': ''
                }
            });
        return CandidatesDB.update({ _id: id }, {
            $set: {
                'claimed': user
            }
        });
    }
    static status(id, flag) {
        return CandidatesDB.update({ _id: id }, {
            $set: {
                'status': flag
            }
        });
    }
    static getId(email) {
        let candidate = CandidatesDB.findOne({ $or: [{ contact: email }, { email }] });
        if (candidate)
            return candidate._id._str;
        throw new Meteor.Error('BAD', 'No candidate associated in this email');
    }
}