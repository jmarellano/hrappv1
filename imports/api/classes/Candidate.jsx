import React from 'react';
import Avatar, { getRandomColor } from '../../ui/components/extras/Avatar';
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
        return this.lastMessage.from === this.name || this.lastMessage.from === this.email || this.lastMessage.from === this.contact;
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
        return this.category && <Avatar username={this.category} color={getRandomColor()} />;
    }

    getLastMessageTime() {
        return <Moment fromNow>{moment(this.lastMessage.createdAt)}</Moment>;
    }
}
export default Candidate;