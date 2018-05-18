import { Accounts } from 'meteor/accounts-base';
import { MessagesDB } from '../messages';

export default class Server {
    constructor() {
        this.messageSender = [];
        this.messageListener = [];
    }

    run() {
        console.log('Initializing server setup...');
        let appVersion = 'MeteorJS + ReactJS';
        console.log(`Version: ${appVersion}`);
        console.log(`Meteor Version: ${Meteor.release}`);
        console.log('Running server scheduled events...');
        Accounts.validateLoginAttempt((data) => {
            if (data.error)
                return data.error;
            if (!data.user.emails[0].verified)
                throw new Meteor.Error('BAD', 'Verify email account first!');
            if (data.user.emails[0].verified && data.user.profile.role === 0)
                throw new Meteor.Error('BAD', 'Account must be accepted by an admin!');
            if (data.user.profile && data.user.profile.retired)
                throw new Meteor.Error('BAD', 'User account disabled!');
            else
                return true;
        });
        console.log('Creating Indexes...');
        MessagesDB._ensureIndex({ contact: 1 });
    }

    addSender(id, email, connection) {
        this.messageSender.push({ id, email, connection });
    }

    removeSender(id, email) {
        let connections = this.messageSender.filter((e) => {
            return ![{ id, email }].some(function (s) {
                return s.id === e.id && s.email === e.email;
            });
        });
        this.messageSender = connections;
    }
}