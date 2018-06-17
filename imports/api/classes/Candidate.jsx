import React from 'react';
import moment from 'moment-timezone';
import Util from './Utilities';
import Moment from 'react-moment';
import 'moment-timezone';

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
        this.city = obj.city;
        this.state = obj.state;
        this.country = obj.country;
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
        this.resume_notes = obj.resume_notes;
        this.portfolio_notes = obj.portfolio_notes;
        this.disc_notes = obj.disc_notes;
        this.values_notes = obj.values_notes;
        this.iq_notes = obj.iq_notes;
        this.TEST_METEOR_notes = obj.TEST_METEOR_notes;
        this.TEST_LIVE_notes = obj.TEST_LIVE_notes;
        this.TEST_WRITING_notes = obj.TEST_WRITING_notes;
        this.VIDEO_notes = obj.VIDEO_notes;
        this.INTERVIEW_notes = obj.INTERVIEW_notes;
        this.MANAGER_notes = obj.MANAGER_notes;
        this.TEST_IMAGE_notes = obj.TEST_IMAGE_notes;
        this.TEST_CREATIVE_notes = obj.TEST_CREATIVE_notes;
        this.TEST_WEBFLOW_notes = obj.TEST_WEBFLOW_notes;
        this.TEST_MOCK_notes = obj.TEST_MOCK_notes;
        this.TEST_SIMULATION_notes = obj.TEST_SIMULATION_notes;
        this.others_notes = obj.others_notes;
        this.resume_file = obj.resume_file || '';
        this.portfolio_file = obj.portfolio_file || '';
        this.disc_file = obj.disc_file || '';
        this.values_file = obj.values_file || '';
        this.iq_file = obj.iq_file || '';
        this.TEST_METEOR_file = obj.TEST_METEOR_file || '';
        this.TEST_LIVE_file = obj.TEST_LIVE_file || '';
        this.TEST_WRITING_file = obj.TEST_WRITING_file || '';
        this.VIDEO_file = obj.VIDEO_file || '';
        this.INTERVIEW_file = obj.INTERVIEW_file || '';
        this.MANAGER_file = obj.MANAGER_file || '';
        this.TEST_IMAGE_file = obj.TEST_IMAGE_file || '';
        this.TEST_CREATIVE_file = obj.TEST_CREATIVE_file || '';
        this.TEST_WEBFLOW_file = obj.TEST_WEBFLOW_file || '';
        this.TEST_MOCK_file = obj.TEST_MOCK_file || '';
        this.TEST_SIMULATION_file = obj.TEST_SIMULATION_file || '';
        this.others_file = obj.others_file || '';
        this.resume_history = obj.resume_history;
        this.portfolio_history = obj.portfolio_history;
        this.disc_history = obj.disc_history;
        this.values_history = obj.values_history;
        this.iq_history = obj.iq_history;
        this.TEST_METEOR_history = obj.TEST_METEOR_history;
        this.TEST_LIVE_history = obj.TEST_LIVE_history;
        this.TEST_WRITING_history = obj.TEST_WRITING_history;
        this.VIDEO_history = obj.VIDEO_history;
        this.INTERVIEW_history = obj.INTERVIEW_history;
        this.MANAGER_history = obj.MANAGER_history;
        this.TEST_IMAGE_history = obj.TEST_IMAGE_history;
        this.TEST_CREATIVE_history = obj.TEST_CREATIVE_history;
        this.TEST_WEBFLOW_history = obj.TEST_WEBFLOW_history;
        this.TEST_MOCK_history = obj.TEST_MOCK_history;
        this.TEST_SIMULATION_history = obj.TEST_SIMULATION_history;
        this.others_history = obj.others_history;
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

    getAddressURI() {
        return encodeURIComponent(this.address + ' ' + this.city + ' ' + this.country);
    }
}
export default Candidate;