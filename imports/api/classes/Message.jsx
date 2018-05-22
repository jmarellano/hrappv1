import moment from 'moment';

class Message {

    constructor(obj) {
        this.id = obj._id;
        this.bcc = obj.bcc;
        this.cc = obj.cc;
        this.contact = obj.contact;
        this.from = obj.from;
        this.html = obj.html;
        this.read = obj.read;
        this.status = obj.status;
        this.subject = obj.subject;
        this.text = obj.text;
        this.to = obj.to;
        this.type = obj.type;
        this.attachments = obj.attachments;
        this.retired = obj.retired;
        this.createdAt = obj.createdAt;
        this.max = obj.max;
        this.imgUrl = obj.imgUrl;
    }

    getDateTime() {
        return moment(this.createdAt).format('MM/DD/YYYY HH:mm A');
    }
}
export default Message;