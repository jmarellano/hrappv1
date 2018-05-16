import moment from 'moment-timezone';

class Notif {

    constructor(obj) {
        this.id = obj._id;
        this.message = obj.message
        this.createdAt = obj.createdAt;
        this.status = obj.status;
    }

    getDateCreated(default_timezone = moment.tz.guess()) {
        return moment(this.createdAt).tz(default_timezone).format('h:mmA MMM DD');
    }

}
export default Notif;