import path from 'path';
let separator = (process.env.OS && process.env.OS === 'Windows_NT') ? '\\' : '/';
let basepath = path.resolve('.').split(separator + '.meteor')[0] + separator;
PATH = {
    BASE: basepath,
    UPLOAD: `${separator}data${separator}uploads${separator}`,
    INFECTED: `${separator}data${separator}infected${separator}`,
    THUMB: `${separator}data${separator}uploads${separator}thumb${separator}`,
    GIT: `${basepath}.git${separator}`,
    METEOR: `${basepath}.meteor${separator}`
};
functions = {};
Meteor.settings.config = Meteor.settings.config || {};
Meteor.settings.public = Meteor.settings.public || { collections: {} };
if (Meteor.settings.config && Meteor.settings.config.email && Meteor.settings.config.email.smtp) {
    process.env.MAIL_URL = 'smtp://' +
        encodeURIComponent(Meteor.settings.config.email.smtp.username) + ':' +
        encodeURIComponent(Meteor.settings.config.email.smtp.password) + '@' +
        Meteor.settings.config.email.smtp.host + ':' +
        Meteor.settings.config.email.smtp.port;
}