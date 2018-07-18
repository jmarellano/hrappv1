import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROUTES, ROLES } from '../../../api/classes/Const';
import { MessagesUnreadCountPub } from '../../../api/candidates';
import PropTypes from 'prop-types';
import HeaderNav from './HeaderNav';
import ReactTooltip from 'react-tooltip';

import FormMain from '../forms/FormMain';
import Category from '../categories/Category';
import Record from '../statistics/Record';
import Global from '../settings/Global';
import PST from '../messages/PST';

class LeftNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.routeMessages = this.routeMessages.bind(this);
        this.routeTeams = this.routeTeams.bind(this);
        this.routeStatistics = this.routeStatistics.bind(this);
        this.routeDrive = this.routeDrive.bind(this);
        this.routeEmails = this.routeEmails.bind(this);
        this.routeCandidates = this.routeCandidates.bind(this);
    }

    routeMessages() {
        this.props.history.replace(ROUTES.MESSAGES);
    }

    routeTeams() {
        this.props.history.replace(ROUTES.TEAMS);
    }

    routeCandidates() {
        this.props.history.replace(ROUTES.CANDIDATES);
    }

    routeStatistics() {
        this.props.history.replace(ROUTES.STATISTICS);
    }

    routeDrive() {
        this.props.history.replace(ROUTES.DRIVE);
    }

    routeEmails() {
        this.props.history.replace(ROUTES.EMAILS);
    }

    render() {
        return (
            <div className="left-nav pull-left bg-secondary">
                <ul className="navbar-nav ml-auto text-center">
                    <HeaderNav key={0} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_MESSAGES}>
                        <a className="nav-link count-notif-wrapper" data-tip="Messages" href="#" onClick={this.routeMessages}>
                            <i className="fa fa-2x fa-envelope" />
                            {this.props.unread ? <span className="count-notif">{this.props.unread}</span> : null}
                        </a>
                    </HeaderNav>
                    <HeaderNav key={1} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_CATEGORIES}>
                        <Category {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={2} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_TEAMS}>
                        <a className="nav-link" data-tip="Teams" href="#" onClick={this.routeTeams}><i className="fa fa-2x fa-users" /></a>
                    </HeaderNav>
                    <HeaderNav key={3} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_MESSAGES}>
                        <a className="nav-link" data-tip="Candidates" href="#" onClick={this.routeCandidates}><i className="fa fa-2x fa-user" /></a>
                    </HeaderNav>
                    <HeaderNav key={4} type="navbar">
                        <PST {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={5} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_STATISTICS}>
                        <a className="nav-link" data-tip="Statistics" href="#" onClick={this.routeStatistics}><i className="fa fa-2x fa-bar-chart" /></a>
                    </HeaderNav>
                    <HeaderNav key={6} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_REPORTS}>
                        <Record {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={7} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_FORMS}>
                        <FormMain {...this.props} />
                    </HeaderNav>
                    <HeaderNav key={8} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_DRIVE}>
                        <a className="nav-link" data-tip="Drive" href="#" onClick={this.routeDrive}><i className="fa fa-2x fa-hdd-o" /></a>
                    </HeaderNav>
                    <HeaderNav key={9} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_EMAILS}>
                        <a className="nav-link" data-tip="Emails" href="#" onClick={this.routeEmails}><i className="fa fa-2x fa-at" /></a>
                    </HeaderNav>
                    <HeaderNav key={10} type="navbar" userRole={this.props.user.role} role={ROLES.MANAGE_SETTINGS}>
                        <Global {...this.props} />
                    </HeaderNav>
                </ul>
                <ReactTooltip />
            </div>
        );
    }
}

LeftNav.propTypes = {
    user: PropTypes.object,
    history: PropTypes.object,
    unread: PropTypes.number
};

export default withTracker(() => {
    Meteor.subscribe(MessagesUnreadCountPub);
    return {
        unread: Counts.get(MessagesUnreadCountPub)
    };
})(LeftNav);
