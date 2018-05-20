import React from 'react';
import moment from 'moment';
import Util from './Utilities';
import Moment from 'react-moment';

class Candidate {

    constructor(obj) {
        this.id = obj._id;
        this.name = obj.name;
        this.email = obj.email;
        this.contact = obj.contact;
        this.category = obj.category;
        this.retired = obj.retired;
        this.createdAt = obj.createdAt;
        this.lastMessage = obj.lastMessage;
        this.max = obj.max;
        this.followers = obj.followers;
        this.number = obj.number;
        this.address = obj.address;
        this.zip = obj.zip;
        this.resume = obj.resume;
        this.portfolio = obj.portfolio;
        this.disc = obj.disc;
        this.disc_d = obj.disc_d;
        this.disc_i = obj.disc_i;
        this.disc_s = obj.disc_s;
        this.disc_c = obj.disc_c;
        this.values = obj.values;
        this.values_aesthetic = obj.values_aesthetic;
        this.values_economic = obj.values_economic;
        this.values_individualistic = obj.values_individualistic;
        this.values_political = obj.values_political;
        this.values_altruist = obj.values_altruist;
        this.values_regulatory = obj.values_regulatory;
        this.values_theoretical = obj.values_theoretical;
        this.iq = obj.iq;
        this.TEST_METEOR = obj.TEST_METEOR;
        this.TEST_LIVE = obj.TEST_LIVE;
        this.TEST_WRITING = obj.TEST_WRITING;
        this.TEST_WRITING_Duplication = obj.TEST_WRITING_Duplication;
        this.TEST_WRITING_Style = obj.TEST_WRITING_Style;
        this.TEST_WRITING_Grammar = obj.TEST_WRITING_Grammar;
        this.TEST_WRITING_Marketing = obj.TEST_WRITING_Marketing;
        this.TEST_WRITING_Impact = obj.TEST_WRITING_Impact;
        this.VIDEO = obj.VIDEO;
        this.INTERVIEW = obj.INTERVIEW;
        this.MANAGER = obj.MANAGER;
        this.TEST_IMAGE = obj.TEST_IMAGE;
        this.TEST_CREATIVE = obj.TEST_CREATIVE;
        this.TEST_WEBFLOW = obj.TEST_WEBFLOW;
        this.TEST_MOCK = obj.TEST_MOCK;
        this.TEST_MOCK_Voice = obj.TEST_MOCK_Voice;
        this.TEST_MOCK_Accent = obj.TEST_MOCK_Accent;
        this.TEST_MOCK_Acknowledgement = obj.TEST_MOCK_Acknowledgement;
        this.TEST_MOCK_Comprehension = obj.TEST_MOCK_Comprehension;
        this.TEST_MOCK_Sales = obj.TEST_MOCK_Sales;
        this.TEST_MOCK_Care = obj.TEST_MOCK_Care;
        this.TEST_SIMULATION = obj.TEST_SIMULATION;
        this.others = obj.others;
        this.claimed = obj.claimed;
    }

    isRetired() {
        return !!this.retired;
    }

    getDateJoined() {
        return moment(this.createdAt).format('MM/DD/YYYY hh:mm:ss A');
    }

    getLastMessageDate() {
        return moment(this.lastMessage.createdAt).format('dddd, MMMM DD, YYYY');
    }

    isRead() {
        return this.lastMessage.read;
    }

    isReply() {
        return this.lastMessage.to === this.number || this.lastMessage.to === this.email || this.lastMessage.to === this.contact;
    }

    getSubject() {
        let subject = this.lastMessage.subject
        return Util.trunc(subject.length ? subject : this.lastMessage.text, 22);
    }

    getContact() {
        let space = 0;
        if (this.lastMessage.read)
            space += 3;
        if (!this.isReply())
            space += 3;
        return Util.trunc(this.name || this.email || this.contact, (this.category ? 14 : 16) + space);
    }

    getCategory() {
        return <div className="badge badge-warning mr-1 text-light">{this.category}</div>;
    }

    getDisplayName() {
        return this.name || this.email || this.contact;
    }

    getLastMessageTime() {
        return <Moment fromNow>{moment(this.lastMessage.createdAt)}</Moment>;
    }

    getClaimer() {
        let user = Meteor.users.findOne({ _id: this.claimed });
        return user ? user.username : 'N\\A';
    }
}
export default Candidate;