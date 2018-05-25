class Template {

    constructor(obj) {
        this.id = obj._id;
        this.dateModified = obj.dateModified;
        this.name = obj.name;
        this.template = obj.template;
        this.max = obj.max;
    }

}
export default Template;