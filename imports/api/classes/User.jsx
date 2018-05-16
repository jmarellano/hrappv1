import React from 'react';
import { ROLES } from './Const';
import Avatar, { getRandomColor } from '../../ui/components/extras/Avatar';
import moment from 'moment';

class User {

    constructor(obj, index) {
        this.id = obj._id;
        this.username = obj.username;
        this.emails = obj.emails;
        this.connectedEmails = obj.profile.emails || [];
        this.role = obj.profile.role;
        this.team = obj.profile.team;
        this.settings = obj.profile.settings;
        this.supervisor = obj.profile.supervised_by;
        this.avatar = <Avatar key={index} username={obj.username} color={getRandomColor()} />;
        this.retired = obj.profile.retired;
        this.default_timezone = obj.profile.default_timezone;
        this.default_email = obj.profile.default_email;
        this.mute = obj.profile.mute;
        this.createdAt = obj.profile.createdAt; // TODO
        this.firstName = obj.profile.first;
        this.lastName = obj.profile.last;
    }

    getPrimaryEmail() {
        return this.emails.filter((email) => {
            return email.verified === true;
        })[0];
    }

    getRole() {
        let role = 'MEMBER';
        if (this.role === ROLES.SUPERVISOR)
            role = 'SUPERVISOR';
        if (this.role === ROLES.MANAGERS)
            role = 'MANAGER';
        if (this.role === ROLES.SUPERUSER)
            role = 'MANAGER';
        return role;
    }

    setTeamName(name) {
        return this.teamName = name;
    }

    getSupervisorName() {
        return ''; // TODO
    }

    isRetired() {
        return !!this.retired;
    }

    getDateJoined() {
        return moment(this.createdAt).format('MM/DD/YYYY hh:mm:ss A');
    }

}
export default User;