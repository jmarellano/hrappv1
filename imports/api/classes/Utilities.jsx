import moment from 'moment';

class Utilities {
    constructor() {

    }
    formatDate(date) {
        return moment(date).format("MM/DD/YYYY hh:mm:ss A");
    }
    trunc(text, max) {
        return text.substr(0, max - 1) + (text.length > max ? '...' : '');
    }
    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };
    setupHandler(instance, target, cursor, transform) {
        let handle = cursor.observe({
            added: (doc) => {
                let id = doc._id;
                doc = transform(doc);
                doc.max = cursor.count();
                instance.added(target, id, doc);
            },
            changed: (doc) => {
                let id = doc._id;
                doc = transform(doc);
                doc.max = cursor.count();
                instance.changed(target, id, doc);
            },
            removed: (doc) => {
                instance.removed(target, doc._id);
            }
        });
        instance.onStop(() => {
            handle.stop();
        });
    }
}

export default Utilities = new Utilities();