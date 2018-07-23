import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { matchPath } from 'react-router';
import { ROUTES } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';

class Help extends Component {
    constructor(props) {
        super(props);
        this.state = {
            help: false,
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '400px',
                width: 'auto',
                height: 'auto',
                maxHeight: '260px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({ help: !this.state.help });
    }

    render() {
        const match = matchPath(this.props.location.pathname, {
            path: '/:component',
            exact: false,
            strict: false
        });
        let component = match ? match.params.component : '',
            message = '';
        switch (component) {
            case ROUTES.MESSAGES:
                message = 'This is the page where messages are displayed. To start receiving emails, link first an email address. Once we receive a message, candidates are created. We can edit their info by clicking the pencil icon. We can also edit their tests and stats report. ';
                break;
            case ROUTES.DRIVE:
                message = 'This is the page where files are stored. To start uploading files, click on cloud icon.';
                break;
            case ROUTES.EMAILS:
                message = 'This is the page where to link email addresses and start sending and receiving emails. Only admins can link email address to an account. Once an email address is successfully linked, status will be "connected"';
                break;
            case ROUTES.TEAMS:
                message = 'This is the page where accounts are managed. Here we can change their roles.';
                break;
            case ROUTES.STATISTICS:
                message = 'This is the page where statistics on Posted Jobs displayed. We can see here how many posts are created by the staff.';
                break;
            case ROUTES.CANDIDATES:
                message = 'This is the page where candidates are listed. We can filter and change here the status of a candidate.';
                break;
            default:
                message = 'There is no information related to this page.';
                break;
        }
        return (
            <a className="nav-link" href="#" data-tip="Help" onClick={this.toggleModal}>
                <i className="fa fa-2x fa-question-circle" aria-hidden="true" />
                <Modal isOpen={this.state.help} contentLabel="SettingsModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Help
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {message}
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

Help.propTypes = {
    location: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Help);