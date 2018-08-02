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
        this.INTERVIEW_max = obj.INTERVIEW_max || 100;
        this.MANAGER_max = obj.MANAGER_max || 100;
        this.TEST_CREATIVE_max = obj.TEST_CREATIVE_max || 100;
        this.TEST_IMAGE_max = obj.TEST_IMAGE_max || 100;
        this.TEST_LIVE_max = obj.TEST_LIVE_max || 100;
        this.TEST_METEOR_max = obj.TEST_METEOR_max || 100;
        this.TEST_MOCK_max = obj.TEST_MOCK_max || 100;
        this.TEST_SIMULATION_max = obj.TEST_SIMULATION_max || 100;
        this.TEST_WEBFLOW_max = obj.TEST_WEBFLOW_max || 100;
        this.TEST_WRITING_max = obj.TEST_WRITING_max || 100;
        this.VIDEO_max = obj.VIDEO_max || 100;
        this.category_max = obj.category_max || 100;
        this.disc_max = obj.disc_max || 100;
        this.iq_max = obj.iq_max || 100;
        this.others_max = obj.others_max || 100;
        this.portfolio_max = obj.portfolio_max || 100;
        this.resume_max = obj.resume_max || 100;
        this.values_max = obj.values_max || 100;
        this.technical = obj.technical;
    }

}
export default Category;