import React from 'react';
import { ROLES } from './Const';
import moment from 'moment';

class Form {

    constructor(obj, index) {
        this.id = obj._id;
        this.dateModified = obj.dateModified;
        this.name = obj.name;
        this.template = obj.template;
        this.max = obj.max;
    }

}
export default Form;