import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { isPermitted } from '../../../api/classes/Const';
import PropTypes from 'prop-types';

class HeaderNav extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let role = this.props.role;
        let userRole = this.props.userRole;
        let type = this.props.type;
        let className = `${type && type === 'navbar' ? 'navbar-item' : null} ${type && type === 'dropdown' ? 'dropdown' : null}`;
        if (role && userRole && isPermitted(userRole, role))
            return (
                <li className={className} >
                    {this.props.children}
                </li >
            );
        if (!role)
            return (
                <li className={className} >
                    {this.props.children}
                </li >
            );
        return null;
    }
}

HeaderNav.propTypes = {
    user: PropTypes.object,
    userRole: PropTypes.number,
    role: PropTypes.number,
    type: PropTypes.string,
    children: PropTypes.any
};

export default withTracker(() => {
    return {};
})(HeaderNav);
