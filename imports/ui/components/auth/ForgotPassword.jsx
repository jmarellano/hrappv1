import React, { Component } from 'react';
import { ROUTES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Button from '../extras/Button';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
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
        let email = this.state.email.trim();
        this.setState({ processing: true });
        this.props.Auth.accountSendResetLink({ email }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Sending link successful.', 'success', 'growl-top-right');
            this.setState({ email: '', processing: false });
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
        this.props.history.replace(ROUTES.REGISTER);
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-4 mt-3 text-center">
                        <h1>Send Reset Link</h1>
                        <form className="mb-1" onSubmit={this.onSubmit}>
                            <input className="form-control mb-1" type="email" value={this.state.email} name="email" placeholder="Email" onChange={this.handleChangeInput} required />
                            <Button className="form-control btn btn-primary" type="submit" processing={this.state.processing}>Send Link</Button>
                        </form>
                        <a href="#" className="text-secondary" onClick={this.redirect}>Need an account?</a>
                    </div>
                </div>
            </div>
        );
    }
}


ForgotPassword.propTypes = {
    Auth: PropTypes.object,
    history: PropTypes.object
};

export default withTracker(() => {
    return {};
})(ForgotPassword);