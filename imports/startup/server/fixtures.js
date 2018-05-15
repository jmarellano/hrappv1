import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ROLES } from '../../api/classes/Const';
import { SettingsDB } from '../../api/settings';
import moment from 'moment';

Meteor.startup(() => {
    if (!Meteor.users.findOne()) {
        let user = {};
        user.username = 'TMQHRAPP';
        user.emails = [{ address: 'tmq.hrapp@gmail.com', verified: 1 }];
        user.profile = { username_sort: user.username.toLowerCase(), first: 'John', last: 'Arellano', role: ROLES.SUPERUSER, retired: 0, createdAt: moment().valueOf() };
        user.email = 'tmq.hrapp@gmail.com';
        user.password = 'gemgem';
        Accounts.createUser(user);
    }
    if (!SettingsDB.findOne()) {
        let settings = {};
        settings.emailGetInterval = 9000;
        settings.country = 172;
        SettingsDB.insert(settings);
    }
});