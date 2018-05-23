import { VALUE } from './Const';
import { CandidatesDB } from '../candidates';
import moment from 'moment';

export default class CandidateManager {
    constructor(obj = {}) {
        const createdAt = obj.createdAt || moment().valueOf();
        this.json = {
            createdAt,
            contact: obj.contact || '',
            retired: obj.retired || VALUE.FALSE,
            lastMessage: obj.lastMessage || {}
        };
        if (obj.contact)
            this.json.contact = obj.contact;
    }
    parseCandidate(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json.contact) {
            if (CandidatesDB.update(this.json.contact, this.json)) {
                return;
            }
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