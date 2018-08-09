import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';
import md5 from 'md5';

class Utilities {
    constructor() {

    }
    formatDate(date, timezone = 'EST') {
        return moment(date).tz(timezone).format('MMMM DD, YYYY hh:mm A');
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
    getTimeRemaining(endtime) {
        let t = Date.parse(endtime) - Date.parse(new Date());
        let seconds = Math.floor((t / 1000) % 60);
        let minutes = Math.floor((t / 1000 / 60) % 60);
        let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        let days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }
    hash(string) {
        return md5(string);
    }
    parseFile(file, options) {
        let opts = typeof options === 'undefined' ? {} : options;
        let fileSize = file.size;
        let chunkSize = typeof opts['chunk_size'] === 'undefined' ? 64 * 1024 : parseInt(opts['chunk_size']); // bytes
        let offset = 0;
        let self = this; // we need a reference to the current object
        let readBlock = null;
        let chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function () { };
        let chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function () { };
        let success = typeof opts['success'] === 'function' ? opts['success'] : function () { };

        readBlock = function (_offset, length, _file) {
            let r = new FileReader();
            let blob = _file.slice(_offset, length + _offset);
            offset += length;
            chunkReadCallback({ result: blob, offset: offset, chunkSize });
            if ((length + _offset) >= fileSize) {
                success(file);
                return;
            } else {
                readBlock(offset, chunkSize, file);
            }
        }


        // let onLoadHandler = function (evt) {
        //     if (evt.target.error == null) {
        //         let boffset = offset;
        //         offset += evt.target.result.length;
        //         chunkReadCallback({ result: evt.target.result, offset, boffset, chunkSize });
        //     } else {
        //         chunkErrorCallback(evt.target.error);
        //         return;
        //     }
        //     if (offset >= fileSize) {
        //         success(file);
        //         return;
        //     }

        //     readBlock(offset, chunkSize, file);
        // }

        // readBlock = function (_offset, length, _file) {
        //     let r = new FileReader();
        //     let blob = _file.slice(_offset, length + _offset);
        //     r.onload = onLoadHandler;
        //     r.readAsText(blob);
        // }

        readBlock(offset, chunkSize, file);
    }

    strip(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    }
}

export default new Utilities();