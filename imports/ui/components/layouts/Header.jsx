import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROUTES, ROLES } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import HeaderNav from './HeaderNav';
import Settings from '../account/Settings';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggingOut: false
        };
        this.logout = this.logout.bind(this);
    }

    logout() {
        this.setState({ loggingOut: true });
        Meteor.logout();
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg bg-nav bg-primary-custom p-0 pl-3 pr-3">
                <a className="navbar-brand" href={ROUTES.MESSAGES}>
                    <img src="/img/favicon.ico" width="45" height="45" />
                </a>
                <div className="navbar-toggler nav-item mr-1" data-toggle="collapse"
                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <i className="fa fa-bars" />
                </div>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        <HeaderNav key={0} type="navbar">
                            <Settings {...this.props} />
                        </HeaderNav>
                        <HeaderNav key={1} type="navbar">
                            {
                                this.state.loggingOut ?
                                    <i className="fa fa-spin fa-spinner mt-2 p-1 text-light" /> :
                                    <a className="nav-link" href="#" onClick={this.logout}>Logout</a>
                            }
                        </HeaderNav>
                    </ul>
                </div>
            </nav>
        );
    }
}

Header.propTypes = {};

export default withTracker(() => {
    return {};
})(Header);
