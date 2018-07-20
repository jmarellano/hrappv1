import { CategoriesDB } from '../categories';
import { CandidatesDB } from '../candidates';

export default class CategoryManager {
    constructor(obj = {}) {
        this.json = {
            category: obj.category || '',
            resume: obj.resume || 0,
            portfolio: obj.portfolio || 0,
            disc: obj.disc || 0,
            values: obj.values || 0,
            iq: obj.iq || 0,
            TEST_METEOR: obj.TEST_METEOR || 0,
            TEST_LIVE: obj.TEST_LIVE || 0,
            TEST_WRITING: obj.TEST_WRITING || 0,
            VIDEO: obj.VIDEO || 0,
            INTERVIEW: obj.INTERVIEW || 0,
            MANAGER: obj.MANAGER || 0,
            TEST_IMAGE: obj.TEST_IMAGE || 0,
            TEST_CREATIVE: obj.TEST_CREATIVE || 0,
            TEST_WEBFLOW: obj.TEST_WEBFLOW || 0,
            TEST_MOCK: obj.TEST_MOCK || 0,
            TEST_SIMULATION: obj.TEST_SIMULATION || 0,
            others: obj.others || 0,
            technical: obj.technical || true,
            color: obj.color || '#ccc'
        };
        if (obj._id)
            this.json._id = obj._id;
    }
    parseCategory(obj) {
        this.json = obj;
    }
    flush() {
        if (this.json._d) {
            if (CategoriesDB.update(this.json._id, this.json)) {
                return;
            }
        }
        return (this.json._id = CategoriesDB.insert(this.json));
    }
    static removeCategory(categoryId) {
        let categories = CategoriesDB.findOne({ _id: categoryId });
        if (categories) {
            CandidatesDB.update({ category: categories.category }, { $set: { category: '' } }, { multi: true });
            CategoriesDB.remove({ _id: categoryId });
            return ('Category Removed.');
        }
        return null;
    }

}