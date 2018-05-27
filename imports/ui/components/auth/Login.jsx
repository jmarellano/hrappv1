import React, { Component } from 'react';
import { Accounts } from 'meteor/accounts-base';
import { ROUTES } from '../../../api/classes/Const';
import { matchPath } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Button from '../extras/Button';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            sending: false,
            email: '',
            password: '',
            processing: false
        };
        this.resetStatus = this.resetStatus.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.sendLink = this.sendLink.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.redirectPass = this.redirectPass.bind(this);
        this.redirectRegister = this.redirectRegister.bind(this);
    }

    componentDidMount() {
        const match = matchPath(this.props.location.pathname, {
            path: '/:component/:data',
            exact: false,
            strict: false
        });
        if (match)
            Accounts.verifyEmail(match.params.data, (error) => {
                if (error)
                    return this.setState({ status: error.reason });
                this.setState({ status: 'Email verified. Your account must be approved by an admin.' });
            });
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.processing)
            return;
        let email = this.state.email.trim(),
            password = this.state.password.trim();
        this.setState({ processing: true });
        this.props.Auth.accountLogin(email, password, (err) => {
            if (err) {
                if (err.reason === 'Verify email account first!')
                    this.setState({ status: err.reason });
                Bert.alert(err.reason, 'danger', 'growl-top-right');
                this.setState({ processing: false });
            } else
                this.props.history.replace('');
        });
    }

    sendLink() {
        this.setState({ sending: true });
        this.props.Auth.sendVerificationLink({ email: this.state.email }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                this.setState({ status: 'Verification link sent!' });
            this.setState({ sending: false });
        });
    }

    resetStatus() {
        this.setState({ status: '' });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
        this.resetStatus();
    }

    redirectPass() {
        this.props.history.replace(ROUTES.FORGOT_PASSWORD);
    }

    redirectRegister() {
        this.props.history.replace(ROUTES.REGISTER);
    }

    render() {
        let status = this.state.status;
        let sending = this.state.sending;
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-4 mt-3">
                        <h1 className="text-center text-primary">{this.props.title}</h1>
                        {
                            status !== "" &&
                            <div className="alert alert-warning" role="alert">
                                {sending ?
                                    <div><i className="fa fa-spin fa-circle-o-notch" /> Sending Link...</div> :
                                    <a href="#" onClick={this.sendLink}>Send Verification Link</a>
                                }
                            </div>
                        }
                        <form className="mb-1" onSubmit={this.onSubmit} >
                            <input className="form-control mb-1" type="email" value={this.state.email} name="email" placeholder="Email" onChange={this.handleChangeInput} required />
                            <input className="form-control mb-1" type="password" value={this.state.password} name="password" placeholder="Password" onChange={this.handleChangeInput} required />
                            <Button className="form-control btn btn-primary mb-1" type="submit" processing={this.state.processing}>Login</Button>
                        </form>
                        <div className="row">
                            <div className="col-md-6 pull-left">
                                <a href="#" className="text-secondary" onClick={this.redirectRegister}>Need an account?</a> <br />
                            </div>
                            <div className="col-md-6 pull-right text-right">
                                <a className="text-secondary" href="#" onClick={this.redirectPass}>Forgot Password?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



Login.propTypes = {
    location: PropTypes.object,
    Auth: PropTypes.object,
    history: PropTypes.object,
    title: PropTypes.string
};

export default withTracker(() => {
    return {};
})(Login);