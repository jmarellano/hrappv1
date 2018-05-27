import React, { Component } from 'react';
import { ROUTES, ROLES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import Button from '../extras/Button';

class Emails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            create: false,
            remove: false,
            first: props.location.pathname === ROUTES.FIRST,
            id: '',
            credit: {
                user: '',
                index: 0,
                password: '',
                status: 'pending'
            },
            agent: props.user.id,
            user: props.user,
            processing: false,
            member: props.user.id
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
                maxHeight: '370px',
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
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '210px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.create = this.create.bind(this);
        this.close = this.close.bind(this);
        this.saveCredit = this.saveCredit.bind(this);
        this.removeCredit = this.removeCredit.bind(this);
        this.closeRemove = this.closeRemove.bind(this);
        this.firstClose = this.firstClose.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    componentWillUpdate(nextProps) {
        if (nextProps.user !== this.props.user)
            this.setState({ agent: nextProps.user.id });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState && value)
                this.setState({ [target.name]: value });
        }
    }

    changeCredit(name, e) {
        let credit = this.state.credit;
        credit[name] = e.target.value;
        this.setState({ credit });
    }

    saveCredit(e) {
        e.preventDefault();
        let email = Meteor.settings.public.emailAccounts[this.state.credit.index];
        let credit = { ...email, ...this.state.credit };
        let user = this.props.user;
        let userId = (user.role === ROLES.ADMIN || user.role === ROLES.SUPERUSER) ? this.state.agent : user.id;
        this.setState({ processing: true });
        this.props.Account.addEmail(credit, userId, (err) => {
            if (err) {
                Bert.alert(err.reason, 'danger', 'growl-top-right');
                this.setState({ processing: false });
            } else
                this.props.Message.addSender({ credit, id: userId }, (error) => {
                    if (error)
                        Bert.alert(error.reason, 'danger', 'growl-top-right');
                    else {
                        Bert.alert('Account is added', 'success', 'growl-top-right');
                        this.setState({
                            create: false,
                            credit: {
                                user: '',
                                index: 0,
                                password: '',
                                status: 'pending'
                            }
                        });
                    }
                    this.setState({ processing: false });
                });
        });
    }

    removeCredit(e) {
        e.preventDefault();
        let credit = this.state.credit;
        this.setState({ processing: true });
        this.props.Account.removeEmail(credit, this.state.member, (err) => {
            if (err) {
                Bert.alert(err.reason, 'danger', 'growl-top-right');
                this.setState({ processing: false });
            } else
                this.props.Message.removeSender({ credit, id: this.state.member }, (error) => {
                    if (error)
                        Bert.alert(error.reason, 'danger', 'growl-top-right');
                    else {
                        this.setState({
                            remove: false,
                            credit: {
                                user: '',
                                index: 0,
                                password: '',
                                status: 'pending'
                            }
                        });
                        Bert.alert('Account is removed', 'success', 'growl-top-right');
                    }
                    this.setState({ processing: false });
                });
        });
    }

    setDefault(index) {
        this.props.Account.setDefaultEmail(index, () => {
            Bert.alert('Default email set.', 'success', 'growl-top-right');
        }, (err) => {
            Bert.alert(err.reason, 'danger', 'growl-top-right');
        });
    }

    renderAccount() {
        return Meteor.settings.public.emailAccounts.map((account, index) => {
            return (
                <option key={index} value={index}>{account.name}</option>
            );
        });
    }

    create() {
        this.setState({ create: true });
    }

    close() {
        this.setState({ create: false });
    }

    closeRemove() {
        this.setState({ remove: false });
    }

    firstClose() {
        this.setState({ first: false });
    }

    renderValidUsers() {
        return this.props.users.map((user, index) => {
            return (
                <option key={index} value={user.id}>{user.username}</option>
            );
        });
    }

    setRemove(account) {
        this.setState({ credit: account, remove: true })
    }

    render() {
        let credit = this.state.credit;
        let user = this.props.users.filter((userObj) => { return userObj.id === this.state.member })[0];
        if (!user) {
            user = {};
            user.connectedEmails = [];
        }
        return (
            <div className="pull-left main p-2">
                <div className="page-content">
                    <div className="row m-0">
                        <button className="btn btn-secondary mb-2"
                            onClick={this.create}>
                            <i className="fa fa-plus" aria-hidden="true" /> New Email Account
                        </button>
                        <div className="col-md-4">
                            {
                                (this.props.user.role === ROLES.ADMIN || this.props.user.role === ROLES.SUPERUSER) &&
                                <select value={this.state.member} name="member" onChange={this.handleChangeInput} className="form-control mb-2">
                                    <option disabled>Select Agent</option>
                                    {this.renderValidUsers()}
                                </select>
                            }
                        </div>
                    </div>
                    <div className="row table-responsive m-0">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">User</th>
                                    <th scope="col">Mail Server</th>
                                    <th scope="col">Host</th>
                                    <th scope="col">Port</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.connectedEmails.map((account, index) => {
                                    let status = (account.status === "connected") ? "text-success" : "text-warning";
                                    return (
                                        <tr key={index}>
                                            <td column="User">{account.user}</td>
                                            <td column="Mail Server">{account.name}</td>
                                            <td column="Host">
                                                <div>
                                                    {account.imap_host || account.pop_host}<br />
                                                    {account.smtp_host}
                                                </div>
                                            </td>
                                            <td column="Port">
                                                <div>
                                                    {account.imap_port || account.pop_port}<br />
                                                    {account.smtp_port}
                                                </div>
                                            </td>
                                            <td column="Status"
                                                className={status}>{account.status}</td>
                                            <td column="Action">
                                                <div>
                                                    {
                                                        this.props.user.id === this.state.member &&
                                                        <button className={`btn ${user.default_email === index ? 'btn-default' : 'btn-warning'} mr-1`}
                                                            disabled={user.default_email === index}
                                                            onClick={this.setDefault.bind(this, index)}>Set
                                                            Default
                                                        </button>
                                                    }
                                                    <button className="btn btn-danger mr-1" onClick={this.setRemove.bind(this, account)}>Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Modal
                    isOpen={this.state.create}
                    style={this.styleSet}
                    contentLabel="EmailModal"
                >
                    <form className="panel panel-primary" onSubmit={this.saveCredit}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Link Email Account
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.close}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <input className="mb-2 form-control" type="text" value={credit.user} name="user" placeholder="User" onChange={this.changeCredit.bind(this, "user")} required />
                            <input className="mb-2 form-control" type="password" value={credit.password} name="password" placeholder="Password" onChange={this.changeCredit.bind(this, "password")} required />
                            <select className="mb-2 form-control" name="index" value={credit.index} onChange={this.changeCredit.bind(this, "index")} required >
                                {this.renderAccount()}
                            </select>
                            {(this.props.user.role === ROLES.ADMIN || this.props.user.role === ROLES.SUPERUSER) &&
                                <div>
                                    <div className="text-warning">Admin options</div>
                                    This email account is for agent:
                                    <select className="mb-2 form-control" name="agent" value={this.state.agent} onChange={this.handleChangeInput}>
                                        <option disabled>Select for agent</option>
                                        {this.renderValidUsers()}
                                    </select>
                                </div>
                            }
                            <Button className="btn btn-primary" type="submit" processing={this.state.processing}>Add</Button>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.remove}
                    style={this.styleSetSmall}
                    contentLabel="RemoveModal"
                >
                    <form className="panel panel-primary" onSubmit={this.removeCredit}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Link Email Account
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.closeRemove}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to remove an account. Continue?
                            </h3>
                            <Button type="submit" className="btn btn-danger" processing={this.state.processing}>Yes</Button>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.first}
                    style={this.styleSetSmall}
                    contentLabel="FirstModal"
                >
                    <form noValidate className="p-3">
                        <h3>
                            Welcome to {this.props.title}!
                        </h3>
                        <p>
                            To get started, setup first your email account by clicking New Email Account button
                            in this page. By setting this up, you will be able to receive / send message to others.
                        </p>
                        <button className="btn btn-secondary" type="button" onClick={this.firstClose}>Ok
                        </button>
                    </form>
                </Modal>
            </div>
        );
    }
}

Emails.propTypes = {
    location: PropTypes.object,
    user: PropTypes.object,
    Account: PropTypes.object,
    Message: PropTypes.object,
    title: PropTypes.string,
    users: PropTypes.array
};

export default withTracker(() => {
    return {};
})(Emails);