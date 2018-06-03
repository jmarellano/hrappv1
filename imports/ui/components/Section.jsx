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
import TemplateCreator from './templates/TemplateCreator';
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
            case ROUTES.TEMPLATES_CREATOR:
            case ROUTES.FORMS_CREATOR:
            case ROUTES.FORMS_VIEWER:
            case ROUTES.FORMS_DATA:
            case ROUTES.EMAILS:
            case ROUTES.STATISTICS:
            case ROUTES.DRIVE:
                return {
                    history: this.props.history,
                    location: this.props.location,
                    match: this.props.match,
                    title: this.props.title,
                    user: this.props.user,
                    users: this.props.users,
                    settings: this.props.settings,
                    Account: this.props.Client.Account,
                    Candidate: this.props.Client.Candidate,
                    Category: this.props.Client.Category,
                    Form: this.props.Client.Form,
                    Message: this.props.Client.Message,
                    Statistics: this.props.Client.Statistics,
                    Settings: this.props.Client.Settings,
                    Drive: this.props.Client.Drive,
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
                    if (this.props.user)
                        this.props.history.replace('/');
                    break;
                case ROUTES.MESSAGES:
                case ROUTES.DRIVE:
                case ROUTES.EMAILS:
                case ROUTES.TEAMS:
                case ROUTES.STATISTICS:
                    if (!this.props.user) {
                        this.props.history.replace(ROUTES.LOGIN);
                        continueRender = false;
                    }
                    break;
                case ROUTES.FORMS_DATA:
                case ROUTES.FORMS_CREATOR:
                case ROUTES.TEMPLATES_CREATOR:
                    if (!this.props.user) {
                        this.props.history.replace('../' + ROUTES.LOGIN);
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
                    case ROUTES.TEMPLATES_CREATOR:
                        if (!(isPermitted(this.props.user.role, ROLES.ADMIN) || isPermitted(this.props.user.role, ROLES.SUPERUSER)))
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
                    case ROUTES.TEMPLATES_CREATOR:
                        return (<TemplateCreator key={component} {...this.filteredProps()} />);
                    case ROUTES.FORMS_CREATOR:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <FormCreator key={component} {...this.filteredProps()} />
                        ]);
                    case ROUTES.FORMS_VIEWER:
                        return (<FormViewer key={component} {...this.filteredProps()} />);
                    case ROUTES.FORMS_DATA:
                        return ([
                            <Header key={component + '_0'} {...this.filteredProps()} />,
                            <FormData key={component} {...this.filteredProps()} />
                        ]);
                    case ROUTES.FORMS_NOT_FOUND:
                        return (<NotFound type='FormsNotFound' key={component} {...this.filteredProps()} />);
                    case ROUTES.TEMPLATES_NOT_FOUND:
                        return (<NotFound type='TemplatesNotFound' key={component} {...this.filteredProps()} />);
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
            else
                this.props.history.replace(ROUTES.LOGIN);
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
