import React from 'react';
import { ROLES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import User from '../../../api/classes/User';
import TeamForms from './TeamForms';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class Teams extends React.Component {
    constructor() {
        super();
        this.state = {
            user: null,
            role: false,
            selectedRole: '',
            retire: false,
            remove: false,
            permitted: false,
            unRetire: false,
            retiredUsers: [],
            selectedUserRole: null,
            retrieving: true,
            passwordModal: false
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '290px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.saveRole = this.saveRole.bind(this);
        this.roleModal = this.roleModal.bind(this);
        this.retireModal = this.retireModal.bind(this);
        this.passwordModal = this.passwordModal.bind(this);
        this.retire = this.retire.bind(this);
        this.remove = this.remove.bind(this);
        this.removeModal = this.removeModal.bind(this);
        this.userRole = this.userRole.bind(this);
        this.userAction = this.userAction.bind(this);
        this.userUnRetireAction = this.userUnRetireAction.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }

    componentDidMount() {
        this.getRetiredUsers();
    }

    getRetiredUsers() {
        this.props.Account.getRetiredUsers((retiredUsers) => {
            this.setState({ retrieving: false, retiredUsers: retiredUsers.map((item, index) => new User(item, index)) });
        });
    }

    selectRole(user, e) {
        let selectedRole = parseInt(e.target.value);
        let selectedRoleString = '';
        if (selectedRole === ROLES.ADMIN)
            selectedRoleString = 'Admin';
        if (selectedRole === ROLES.STAFFS)
            selectedRoleString = 'Staff';
        if (selectedRole === ROLES.GUESTS)
            selectedRoleString = 'Guest';
        this.setState({ user, role: true, selectedRole, selectedRoleString });
    }

    saveRole() {
        this.props.Account.changeRole({ role: this.state.selectedRole, id: this.state.user.id }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Role changed!', 'success', 'growl-top-right');
            this.setState({ role: false, selectedRole: '' });
        });
    }

    retire() {
        this.props.Account.retire(this.state.user.id, this.state.unRetire, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Member retired!', 'success', 'growl-top-right');
            if (!this.state.unRetire)
                this.props.Drive.removePermissions(() => { });
            this.getRetiredUsers();
            this.setState({ retire: false, selectedUserRole: null, unRetire: false });
        });
    }

    changePassword(callback) {
        let password = this.password.value.trim();
        let cPassword = this.cpassword.value.trim();
        if(!password || !cPassword || password.length < 4 || password !== cPassword){
            Bert.alert('Password length invalid', 'danger', 'growl-top-right');
            return callback();
        }
        this.props.Account.changePasswordSuper({ id: this.state.user.id, new: password }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Password changed!', 'success', 'growl-top-right');
            callback();
            this.setState({ passwordModal: false, processing: false }, ()=>{
                this.password.value = "";
                this.cpassword.value = "";
            });
        });
    }

    remove() {
        this.props.Account.remove(this.state.user.id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Member removed!', 'success', 'growl-top-right');
            this.setState({ remove: false });
        });
    }

    roleModal(user) {
        this.setState({ role: !this.state.role, user });
    }

    passwordModal(user) {
        this.setState({ passwordModal: !this.state.passwordModal, user });
    }

    retireModal(user, unRetire, role) {
        this.setState({ retire: !this.state.retire, user, unRetire, selectedUserRole: unRetire ? role : null });
    }

    removeModal(user) {
        this.setState({ remove: !this.state.remove, user });
    }

    userRole(cell, user) {
        let role = user.role || ROLES.GUESTS;
        return (
            <div>
                <select ref={"role" + user.index} className="form-control"
                    value={role}
                    onChange={this.selectRole.bind(this, user)}>
                    <option value={ROLES.ADMIN}>admin</option>
                    <option value={ROLES.STAFFS}>staff</option>
                    <option value={ROLES.GUESTS}>guest</option>
                </select>
            </div>
        );
    }

    userAction(cell, user) {
        let role = user.role || ROLES.GUESTS;
        return (
            <div>
                <TeamForms selectedUser={user} Candidate={this.props.Candidate} user={this.props.user} location={this.props.location} />
                {(role === ROLES.GUESTS) &&
                    <a href="#removeModal m-r-sm"
                        data-toggle="modal" onClick={this.removeModal.bind(this, user)} className="btn btn-danger">Remove</a>}
                {(this.props.user.role === ROLES.SUPERUSER) &&
                    <a href="#" data-toggle="modal" data-tip="Change Password" onClick={this.passwordModal.bind(this, user)} className="btn btn-warning mr-2"><i className="fa fa-edit"/></a>}
                {(role !== ROLES.GUESTS) &&
                    <a href="#" data-toggle="modal" onClick={this.retireModal.bind(this, user, false, role)} className="btn btn-warning">Retire</a>}
            </div>
        );
    }

    userUnRetireAction(cell, user) {
        let role = user.role || ROLES.GUESTS;
        let role_ = null;
        switch (role) {
            case ROLES.ADMIN:
                role_ = "ADMIN";
                break;
            case ROLES.STAFFS:
                role_ = "STAFF";
                break;
            case ROLES.GUESTS:
                role_ = "GUEST";
                break;
        }
        return (
            <a href="#" data-toggle="modal" onClick={this.retireModal.bind(this, user, true, role_)} className="btn btn-warning">Un-Retire</a>
        )
    }

    render() {
        if (!this.props.user)
            return null;
        let userObj = this.state.user || { username: "" };
        return (
            <div className="pull-left main">
                <div className="table-responsive">
                    <BootstrapTable data={this.props.users} striped hover>
                        <TableHeaderColumn isKey dataField='username' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Members' }} width={"150"}>Members</TableHeaderColumn>
                        <TableHeaderColumn dataField='firstName' filter={{ type: 'RegexFilter', placeholder: 'Please enter a First Name' }} width={"130"}>First Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='lastName' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Last Name' }} width={"130"}>Last Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Email Add' }} width={"150"}>Email Add</TableHeaderColumn>
                        <TableHeaderColumn dataField='dateJoined' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Date Joined' }} width={"150"}>Date Joined</TableHeaderColumn>
                        <TableHeaderColumn dataField='lastLoggedInDt' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Date Time' }} width={"150"}>Last Logged In Date and Time</TableHeaderColumn>
                        <TableHeaderColumn dataField='select' dataFormat={this.userRole} width={"120"} >Roles</TableHeaderColumn>
                        <TableHeaderColumn dataField='actions' dataFormat={this.userAction} width={"120"} >Actions</TableHeaderColumn>
                    </BootstrapTable>
                    <h3 className="ml-1">
                        Retired Users
                    </h3>
                    <BootstrapTable data={this.state.retiredUsers} striped hover>
                        <TableHeaderColumn isKey dataField='username' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Members' }} width={"130"}>Members</TableHeaderColumn>
                        <TableHeaderColumn dataField='firstName' filter={{ type: 'RegexFilter', placeholder: 'Please enter a First Name' }} width={"130"}>First Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='lastName' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Last Name' }} width={"130"}>Last Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Email Add' }} width={"150"}>Email Add</TableHeaderColumn>
                        <TableHeaderColumn dataField='dateJoined' filter={{ type: 'RegexFilter', placeholder: 'Please enter a Date Joined' }} width={"150"}>Date Joined</TableHeaderColumn>
                        <TableHeaderColumn dataField='actions' dataFormat={this.userUnRetireAction} width={"150"}>Actions</TableHeaderColumn>
                    </BootstrapTable>
                    {this.state.retrieving && <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div>}
                </div>
                <Modal
                    isOpen={this.state.role}
                    onRequestClose={this.roleModal}
                    style={this.styleSet}
                    contentLabel="RoleModal"
                >
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Change Role
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.roleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                Change role of {userObj.username}&nbsp;
                                to {this.state.selectedRoleString}?
                            </h3>
                            <Button onClick={this.saveRole} className="btn btn-warning">Yes</Button>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.retire}
                    onRequestClose={this.retireModal}
                    style={this.styleSet}
                    contentLabel="RetireModal"
                >
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                {this.state.unRetire ? "Un-Retire" : "Retire"} User
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.retireModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to set {userObj.username} as {this.state.selectedUserRole ? `${this.state.selectedUserRole} again` : "RETIRED"}. Continue?
                            </h3>
                            <Button onClick={this.retire} className="btn btn-danger">Yes</Button>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.passwordModal}
                    onRequestClose={this.passwordModal}
                    style={this.styleSet}
                    contentLabel="PasswordModal"
                >
                    <form className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Change password of User
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.passwordModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to change password of {userObj.username}.
                            </h3>
                            New Password:<br />
                            <input type="password" className="form-control btn-sm" ref={(e)=>{this.password = e;}}/>
                            confirm Password:<br />
                            <input type="password" className="form-control btn-sm mb-2" ref={(e)=>{this.cpassword = e;}}/>
                            <Button onClick={this.changePassword} className="btn btn-warning">Change</Button>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.remove}
                    onRequestClose={this.removeModal}
                    style={this.styleSet}
                    contentLabel="RemoveModal"
                >
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Remove User
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.removeModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to remove {userObj.username}. Continue?
                            </h3>
                            <Button onClick={this.remove} className="btn btn-danger">Yes</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        );
    }
}

Teams.propTypes = {
    Account: PropTypes.object,
    users: PropTypes.array,
    Candidate: PropTypes.object,
    user: PropTypes.object,
    location: PropTypes.any,
    Drive: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Teams);
