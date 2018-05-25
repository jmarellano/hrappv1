import { VALUE } from './Const';
import { CandidatesDB } from '../candidates';
import Util from './Utilities';
import moment from 'moment-timezone';

export default class CandidateManager {
    constructor(obj = {}) {
        const createdAt = obj.createdAt || moment().utc().valueOf();
        this.json = {
            createdAt,
            contact: obj.contact || '',
            retired: obj.retired || VALUE.FALSE,
            lastMessage: obj.lastMessage || {}
        };
        if (obj.contact)
            this.json.contact = obj.contact;
        if (obj.number)
            this.json.number = obj.number;
        if (obj.email)
            this.json.email = obj.email;
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
        return CandidatesDB.update({ contact: contact }, {
            $set: {
                'name': data.name,
                'category': data.category,
                'address': data.address,
                'zip': data.zip,
                'email': data.email,
                'number': data.number && Util.numberValidator(data.number).isValid ? Util.numberValidator(data.number).e164Format : ''
            }
        });
    }
    static updateCandidateSelectedInfo(contact, info, value) {
        let set = {};
        set[info] = value;
        return CandidatesDB.update({ _id: contact }, {
            $set: set
        });
    }
    static updateCandidateStats(contact, data) {
        let temp = {};
        Object.keys(data).forEach((item) => {
            temp[item] = parseInt(data[item]);
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
    static claimCandidate(id, user = this.userId) {
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
    static getId(email) {
        let candidate = CandidatesDB.findOne({ $or: [{ contact: email }, { email }] });
        if (candidate)
            return candidate._id._str;
        throw new Meteor.Error('BAD', 'No candidate associated in this email');
    }
}