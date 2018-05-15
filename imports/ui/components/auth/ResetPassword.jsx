import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import Button from '../extras/Button';

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            processing: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.processing)
            return;
        let password = this.state.password.trim();
        this.setState({ processing: true });
        const match = matchPath(this.props.location.pathname, {
            path: '/:component/:data',
            exact: false,
            strict: false
        });
        this.props.Auth.accountResetPassword({ url: match.params.data, password }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Password is successfully changed.', 'success', 'growl-top-right');
            this.setState({ password: '', processing: false });
        });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    redirect() {
        this.props.history.replace("/");
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-4 text-center mt-3">
                        <h1>Reset Password</h1>
                        <form className="mb-1" onSubmit={this.onSubmit}>
                            <input className="form-control mb-1" type="password" value={this.state.password} name="password" placeholder="Password" onChange={this.handleChangeInput} required />
                            <Button className="form-control btn btn-primary" type="submit" processing={this.state.processing}>Reset Password</Button>
                        </form>
                        <a href="#" className="text-secondary" onClick={this.redirect}>Login</a>
                    </div>
                </div>
            </div>
        );
    }
}

ResetPassword.propTypes = {
    Auth: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object
};

export default withTracker(() => {
    return {};
})(ResetPassword);