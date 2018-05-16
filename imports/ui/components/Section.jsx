import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { ROUTES, isPermitted, ROLES } from '../../api/classes/Const';
import PropTypes from 'prop-types';

import Register from './auth/Register';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';

import Messages from './messages/Messages';
import Drive from './drive/Drive';
import FormCreator from './forms/FormCreator';
import FormViewer from './forms/FormViewer';
import FormData from './forms/FormData';
import Emails from './emails/Emails';
import Teams from './teams/Teams';
import Graphs from './statistics/Graphs';

import Header from './layouts/Header';
import LeftNav from './layouts/LeftNav';
import RightNav from './layouts/RightNav';

import NotFound from './NotFound';
import Loader from './extras/Loader';

class Section extends Component {
    constructor(props) {
        super(props);
    }

    filteredProps() {
        let component = this.props.component || '';
        switch (component) {
            case ROUTES.LOGIN:
            case ROUTES.REGISTER:
            case ROUTES.FORGOT_PASSWORD:
            case ROUTES.RESET_PASSWORD:
            case ROUTES.VERIFY:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Auth: this.props.Client.Auth,
                    user: this.props.user
                };
            case ROUTES.MESSAGES:
            case ROUTES.TEAMS:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Account: this.props.Client.Account,
                    user: this.props.user,
                    users: this.props.users,
                    settings: this.props.settings
                };
            case ROUTES.DRIVE:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Account: this.props.Client.Account,
                    Drive: this.props.Client.Drive,
                    user: this.props.user,
                    settings: this.props.settings
                };
            case ROUTES.FORMS_CREATOR:
            case ROUTES.FORMS_VIEWER:
            case ROUTES.FORMS_DATA:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Account: this.props.Client.Account,
                    Form: this.props.Client.Form,
                    Candidate: this.props.Client.Candidate,
                    user: this.props.user,
                    settings: this.props.settings
                };
            case ROUTES.EMAILS:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Account: this.props.Client.Account,
                    Message: this.props.Client.Message,
                    user: this.props.user,
                    settings: this.props.settings
                };
            case ROUTES.STATISTICS:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    Account: this.props.Client.Account,
                    Statistics: this.props.Client.Statistics,
                    user: this.props.user,
                    users: this.props.users,
                    settings: this.props.settings
                };
            default:
                return { ...this.props };
        }
    }

    render() {
        let component = this.props.component || '';
        let continueRender = true;
        if (this.props.isReady) {
            switch (component) {
                case ROUTES.LOGIN:
                case ROUTES.REGISTER:
                case ROUTES.FORGOT_PASSWORD:
                case ROUTES.RESET_PASSWORD:
                case ROUTES.VERIFY:
                    if (this.props.user) {
                        this.props.history.replace("/");
                        continueRender = false;
                    }
                    break;
                case ROUTES.MESSAGES:
                case ROUTES.DRIVE:
                case ROUTES.FORMS_CREATOR:
                case ROUTES.FORMS_DATA:
                case ROUTES.EMAILS:
                case ROUTES.TEAMS:
                case ROUTES.STATISTICS:
                    if (!this.props.user) {
                        this.props.history.replace(ROUTES.LOGIN);
                        continueRender = false;
                    }
                    break;
            }
            if (continueRender)
                switch (component) {
                    case ROUTES.MESSAGES:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES))
                            continueRender = false;
                        break;
                    case ROUTES.DRIVE:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_DRIVE))
                            continueRender = false;
                        break;
                    case ROUTES.FORMS_CREATOR:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_FORMS))
                            continueRender = false;
                        break;
                    case ROUTES.FORMS_DATA:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_FORMS))
                            continueRender = false;
                        break;
                    case ROUTES.EMAILS:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_EMAILS))
                            continueRender = false;
                        break;
                    case ROUTES.TEAMS:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_TEAMS))
                            continueRender = false;
                        break;
                    case ROUTES.STATISTICS:
                        if (!isPermitted(this.props.user.role, ROLES.VIEW_STATISTICS))
                            continueRender = false;
                        break;
                }
            if (continueRender)
                switch (component) {
                    case ROUTES.LOGIN:
                    case ROUTES.VERIFY:
                        return (<Login key={component} {...this.filteredProps()} />);
                    case ROUTES.REGISTER:
                        return (<Register key={component} {...this.filteredProps()} />);
                    case ROUTES.FORGOT_PASSWORD:
                        return (<ForgotPassword key={component} {...this.filteredProps()} />);
                    case ROUTES.RESET_PASSWORD:
                        return (<ResetPassword key={component} {...this.filteredProps()} />);
                    case ROUTES.MESSAGES:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <LeftNav key={component + '_1'} {...this.filteredProps()} />,
                            <Messages key={component + '_2'} {...this.filteredProps()} />,
                            <RightNav key={component + '_3'} {...this.filteredProps()} />
                        ]);
                    case ROUTES.DRIVE:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <LeftNav key={component + '_1'} {...this.filteredProps()} />,
                            <Drive key={component + '_2'} {...this.filteredProps()} />,
                            <RightNav key={component + '_3'} {...this.filteredProps()} />
                        ]);
                    case ROUTES.FORMS_CREATOR:
                        return (<FormCreator key={component} {...this.filteredProps()} />);
                    case ROUTES.FORMS_VIEWER:
                        return (<FormViewer key={component} {...this.filteredProps()} />);
                    case ROUTES.FORMS_DATA:
                        return (<FormData key={component} {...this.filteredProps()} />);
                    case ROUTES.FORMS_NOT_FOUND:
                        return (<NotFound type='FormsNotFound' key={component} {...this.filteredProps()} />);
                    case ROUTES.EMAILS:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <LeftNav key={component + '_1'} {...this.filteredProps()} />,
                            <Emails key={component + '_2'} {...this.filteredProps()} />,
                            <RightNav key={component + '_3'} {...this.filteredProps()} />
                        ]);
                    case ROUTES.TEAMS:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <LeftNav key={component + '_1'} {...this.filteredProps()} />,
                            <Teams key={component + '_2'} {...this.filteredProps()} />,
                            <RightNav key={component + '_3'} {...this.filteredProps()} />
                        ]);
                    case ROUTES.STATISTICS:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <LeftNav key={component + '_1'} {...this.filteredProps()} />,
                            <Graphs key={component + '_2'} {...this.filteredProps()} />,
                            <RightNav key={component + '_3'} {...this.filteredProps()} />
                        ]);
                    default:
                        return (<NotFound type='RouteNotFound' key={component} {...this.filteredProps()} />);
                }
        }
        return (
            <div className='container'>
                <div className='col-md-4 offset-md-4 text-center mt-4'>
                    <Loader visible={true} large={true}>{this.props.title}</Loader>
                </div>
            </div>
        );
    }
}

Section.propTypes = {
    component: PropTypes.string,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    title: PropTypes.string,
    Client: PropTypes.object,
    user: PropTypes.object,
    users: PropTypes.array,
    settings: PropTypes.object,
    isReady: PropTypes.bool
};

export default withTracker(() => {
    return {};
})(Section);
