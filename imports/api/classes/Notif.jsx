import moment from 'moment-timezone';

class Notif {

    constructor(obj) {
        this.id = obj._id;
        this.message = obj.message
        this.createdAt = obj.createdAt;
        this.status = obj.status;
    }

    getDateCreated() {
        return moment(this.createdAt).format('h:mmA MMM DD');
    }

}
export default Notif;