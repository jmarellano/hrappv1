import React from 'react';
import { ROLES } from './Const';

class Category {

    constructor(obj) {
        this.id = obj._id;
        this.INTERVIEW = obj.INTERVIEW;
        this.MANAGER = obj.MANAGER;
        this.TEST_CREATIVE = obj.TEST_CREATIVE;
        this.TEST_IMAGE = obj.TEST_IMAGE;
        this.TEST_LIVE = obj.TEST_LIVE;
        this.TEST_METEOR = obj.TEST_METEOR;
        this.TEST_MOCK = obj.TEST_MOCK;
        this.TEST_SIMULATION = obj.TEST_SIMULATION;
        this.TEST_WEBFLOW = obj.TEST_WEBFLOW;
        this.TEST_WRITING = obj.TEST_WRITING;
        this.VIDEO = obj.VIDEO;
        this.category = obj.category;
        this.disc = obj.disc;
        this.iq = obj.iq;
        this.others = obj.others;
        this.portfolio = obj.portfolio;
        this.resume = obj.resume;
        this.values = obj.values;
    }

}
export default Category;