import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: false,
            password: '',
            oldPassword: '',
            cPassword: '',
            processing: false
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
                maxHeight: '520px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.save = this.save.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }


    save(e) {
        e.preventDefault();
        let oldPassword = this.state.oldPassword.trim(),
            password = this.state.password.trim(),
            cPassword = this.state.cPassword.trim();
        if (password !== cPassword)
            return Bert.alert('New Password not matched!', 'danger', 'growl-top-right');
        this.setState({ processing: true });
        this.props.Account.changePassword({ old: oldPassword, new: password }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Password changed!', 'success', 'growl-top-right');
            this.setState({ settings: false, processing: false });
        });
    }

    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    toggleModal() {
        this.setState({ settings: !this.state.settings });
    }

    render() {
        return (
            <div>
                <a className="nav-link" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-user" />
                    <b className="ml-1">{this.props.user.username}</b>
                    <span className="text-light">[{this.props.user.getRole()}]</span>
                </a>
                <Modal isOpen={this.state.settings} onRequestClose={this.toggleModal} contentLabel="SettingsModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Settings
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" href="#">
                                        Change Password
                                    </a>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                <div className={"tab-pane fade show active"} role="tabpanel" aria-labelledby="home-tab">
                                    <div className="form-horizontal mt-3">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="oldPassword">
                                                Old Password
                                                <span className="ml-1 text-danger">*</span>
                                            </label>
                                            <div className="col-sm-12">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="oldPassword"
                                                    onChange={this.handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="password">
                                                New Password
                                                <span className="ml-1 text-danger">*</span>
                                            </label>
                                            <div className="col-sm-12">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="password"
                                                    onChange={this.handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="cPassword">
                                                Confirm Password
                                                <span className="ml-1 text-danger">*</span>
                                            </label>
                                            <div className="col-sm-12">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="cPassword"
                                                    onChange={this.handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="panel-footer p-2">
                            <hr />
                            <div className="container">
                                <div className="pull-right mb-2">
                                    <Button
                                        type="submit"
                                        className="form-control btn btn-success"
                                        processing={this.state.processing}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        );
    }
}

Settings.propTypes = {
    Account: PropTypes.object,
    user: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Settings);