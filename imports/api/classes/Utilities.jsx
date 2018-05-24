import moment from 'moment';
import PhoneNumber from 'awesome-phonenumber';
import md5 from 'md5';

class Utilities {
    constructor() {

    }
    formatDate(date) {
        return moment(date).format('MM/DD/YYYY hh:mm:ss A');
    }
    trunc(text, max) {
        return text.substr(0, max - 1) + (text.length > max ? '...' : '');
    }
    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
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
    numberValidator(input) {
        if (!input) return { isValid: false };
        const phone = PhoneNumber(input);
        if (phone.isValid())
            return {
                isValid: phone.isValid(),
                fromUS: phone.getRegionCode() === "US",
                region: phone.getRegionCode(),
                internationalFormat: phone.getNumber("international"),
                nationalFormat: phone.getNumber("national"),
                e164Format: phone.getNumber("e164"),
                rfc3966Format: phone.getNumber("rfc3966"),
                number: input,
                countryCode: PhoneNumber.getCountryCodeForRegionCode(phone.getRegionCode()),
            };
        return { isValid: false };
    }
    notifyClient(subject, message, options = {}, callback) {
        import Notify from 'notifyjs';
        function notifyClick() {
            window.open(options.onClick, '_blank');
        }
        if (options.onClick)
            options.notifyClick = notifyClick;
        if (Notification.permission === "granted") {
            let myNotification = new Notify(subject, { body: message, ...options });
            myNotification.show();
            setTimeout(myNotification.close.bind(myNotification), 10000);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    let myNotification = new Notify(subject, { body: message, ...options });
                    myNotification.show();
                    setTimeout(myNotification.close.bind(myNotification), 10000);
                }
            });
        }
        if (callback)
            callback();
    }
    hash(string) {
        return md5(string);
    }
}

export default new Utilities();