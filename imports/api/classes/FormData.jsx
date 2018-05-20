import moment from 'moment';

class FormData {

    constructor(obj) {
        this.id = obj._id;
        this.applicantId = obj.applicantId;
        this.name = obj.name;
        this.createdAt = obj.createdAt;
        this.data = obj.data;
        this.formId = obj.form_id;
        this.removed = obj.removed;
        this.version = obj.version;
        this.max = obj.max;
    }

    getDate() {
        return moment(this.createdAt).format("MM/DD/YYYY");
    }

    getTime() {
        return moment(this.createdAt).format("HH:mm:ss A");
    }

    getApplicant() {
        return;
    }

}
export default FormData;