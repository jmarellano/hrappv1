import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROLES, isPermitted } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';

class Followers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
            follow: false,
            confirmation: false,
            follower: '',
            user: ''
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '400px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.styleSetSmall = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '240px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleConfirmation = this.toggleConfirmation.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    toggleModal() {
        this.setState({ follow: !this.state.follow });
    }

    toggleConfirmation(user) {
        this.setState({ confirmation: !this.state.confirmation, follower: user.id });
    }

    renderAvailableUsers() {
        return this.props.availableUsers.map((user, index) => {
            return (
                <option value={user.id} key={index}>{user.username}</option>
            );
        });
    }

    renderUsers() {
        return this.props.users.map((user, index) => {
            return (
                <li key={index} className="list-group-item">
                    {user.username}
                    <span className="pull-right">
                        {
                            isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) &&
                            <button className="btn btn-danger btn-sm" onClick={this.toggleConfirmation.bind(this, user)}>Remove</button>
                        }
                    </span>
                </li>
            );
        });
    }

    remove(callback) {
        this.props.Candidate.removeFollower({ id: this.props.candidate.id, user: this.state.follower }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Follower Removed!', 'success', 'growl-top-right');
            this.setState({ confirmation: false });
            callback();
        });
    }

    add(callback) {
        if (!this.state.user.length) {
            callback();
            return null;
        }
        this.props.Candidate.addFollower({ id: this.props.candidate.id, user: this.state.user }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Follower added!', 'success', 'growl-top-right');
            callback();
        });
    }

    render() {
        return (
            <button className="link badge badge-success text-light pull-right ml-1 mr-1" data-tip="View followers" onClick={this.toggleModal}>
                <i className="fa fa-eye" />&nbsp;
                {this.props.candidate.followers ? this.props.candidate.followers.length : 0} Followers
                <Modal isOpen={this.state.follow} contentLabel="FollowModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={null}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Followers
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) &&
                                <select className="form-control" name="user" value={this.state.user} onChange={this.handleChangeInput} required>
                                    <option value={''} disabled>Select User</option>
                                    {this.renderAvailableUsers()}
                                </select>
                            }
                            {isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) &&
                                <div>
                                    <div className="mt-2 col-md-12 p-0">
                                        <Button className="form-control btn btn-success" onClick={this.add}>Add</Button>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="panel-footer p-2">
                            <hr />
                            <ul className="list-group">
                                {this.renderUsers()}
                            </ul>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.confirmation}
                    style={this.styleSetSmall}
                    contentLabel="FollowConfirmationModal"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Remove Follower
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleConfirmation}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to remove a follower. Continue?
                            </h3>
                            <Button className="btn btn-danger" onClick={this.remove} type="button">
                                Yes
                            </Button>
                        </div>
                    </div>
                </Modal>
            </button>
        );
    }
}

Followers.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    Candidate: PropTypes.object,
    users: PropTypes.array,
    availableUsers: PropTypes.array
};

export default withTracker((props) => {
    let ids = props.candidate.followers ? props.candidate.followers.map((item) => {
        return item.id;
    }) : [];
    let availableUsers = props.users.filter((item) => ids.indexOf(item.id) < 0);
    let users = props.users.filter((item) => ids.indexOf(item.id) > -1);
    return {
        availableUsers,
        users
    };
})(Followers);