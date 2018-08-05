import { JobsDB } from '../ads';

export default class SettingManager {
    constructor() {
    }
    static record(data, userId) {
        return JobsDB.update({ _id: data.selectedJobPost }, {
            '$set': {
                timestamp: data.timestamp,
                title: data.title,
                description: data.description,
                experience: data.experience,
                location: data.location,
                salary: data.salary,
                why: data.why,
                postedBy: userId
            }
        }, { upsert: true });
    }
    static recordDelete(id) {
        return JobsDB.remove({ _id: id });
    }
}