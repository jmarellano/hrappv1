import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROUTES, ROLES } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import HeaderNav from './HeaderNav';

import Client from '../../../api/classes/Client';
import FormMain from '../forms/FormMain';
import Category from '../categories/Category';
import Record from '../statistics/Record';
import Global from '../settings/Global';

class LeftNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.Client = new Client();
    }

    render() {
        return (
            <div className="left-nav pull-left bg-secondary">
                <ul className="navbar-nav ml-auto text-center">
                    <HeaderNav key={0} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_MESSAGES}>
                        <a className="nav-link" href="#" onClick={() => { this.props.history.replace(ROUTES.MESSAGES); }}><i className="fa fa-2x fa-envelope" /></a>
                    </HeaderNav>
                    <HeaderNav key={1} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_CATEGORIES}>
                        <Category {...this.props} Category={this.Client.Category} />
                    </HeaderNav>
                    <HeaderNav key={2} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_TEAMS}>
                        <a className="nav-link" href="#" onClick={() => { this.props.history.replace(ROUTES.TEAMS); }}><i className="fa fa-2x fa-users" /></a>
                    </HeaderNav>
                    {/* TODO import PST */}
                    <HeaderNav key={4} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_STATISTICS}>
                        <a className="nav-link" href="#" onClick={() => { this.props.history.replace(ROUTES.STATISTICS); }}><i className="fa fa-2x fa-bar-chart" /></a>
                    </HeaderNav>
                    <HeaderNav key={5} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_REPORTS}>
                        <Record {...this.props} Statistics={this.Client.Statistics} />
                    </HeaderNav>
                    {/* TODO import Date */}
                    <HeaderNav key={7} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_FORMS}>
                        <FormMain {...this.props} Form={this.Client.Form} />
                    </HeaderNav>
                    <HeaderNav key={8} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_DRIVE}>
                        <a className="nav-link" href="#" onClick={() => { this.props.history.replace(ROUTES.DRIVE); }}><i className="fa fa-2x fa-hdd-o" /></a>
                    </HeaderNav>
                    <HeaderNav key={9} type="navbar" userRole={this.props.user.role} role={ROLES.VIEW_EMAILS}>
                        <a className="nav-link" href="#" onClick={() => { this.props.history.replace(ROUTES.EMAILS); }}><i className="fa fa-2x fa-at" /></a>
                    </HeaderNav>
                    <HeaderNav key={10} type="navbar" userRole={this.props.user.role} role={ROLES.MANAGE_SETTINGS}>
                        <Global {...this.props} Settings={this.Client.Settings} />
                    </HeaderNav>
                    {/* TODO import Requests */}
                </ul>
            </div>
        );
    }
}

LeftNav.propTypes = {
    user: PropTypes.object,
    history: PropTypes.object
};

export default withTracker(() => {
    return {};
})(LeftNav);
