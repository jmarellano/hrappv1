import React from 'react';
//import { UsersRegister } from '../../api/users';
import { ROUTES } from '../../../api/classes/Const';
import Button from '../extras/Button';

export default class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            username: '',
            first: '',
            last: '',
            processing: false,
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.processing)
            return;
        let email = this.state.email.trim(),
            password = this.state.password.trim(),
            username = this.state.username.trim(),
            first = this.state.first.trim(),
            last = this.state.last.trim();
        this.setState({ processing: true });
        this.props.Auth.accountRegister({ email, password, username, first, last }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                Bert.alert('New user registered! Redirecting to login page...', 'success', 'growl-top-right');
                this.setState({
                    email: '',
                    password: '',
                    username: '',
                    first: '',
                    last: '',
                });
                setTimeout(() => {
                    this.props.history.replace(ROUTES.LOGIN);
                }, 3000);
            }
            this.setState({ processing: false });
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
        this.props.history.replace(ROUTES.LOGIN);
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-4 mt-3">
                        <h1 className="text-center text-primary">Join {this.props.title}</h1>
                        <form className="mb-1 text-center" onSubmit={this.onSubmit}>
                            <input className="form-control mb-1" type="text" value={this.state.username} name="username" placeholder="Username" onChange={this.handleChangeInput} required />
                            <input className="form-control mb-1" type="email" value={this.state.email} name="email" placeholder="Email" onChange={this.handleChangeInput} required />
                            <input className="form-control mb-1" type="password" value={this.state.password} name="password" placeholder="Password" onChange={this.handleChangeInput} required />
                            <input className="form-control mb-1" type="text" value={this.state.first} name="first" placeholder="First Name" onChange={this.handleChangeInput} required />
                            <input className="form-control mb-1" type="text" value={this.state.last} name="last" placeholder="Last Name" onChange={this.handleChangeInput} required />
                            <Button className="form-control btn btn-primary" type="submit" processing={this.state.processing}>Create Account</Button>
                        </form>
                        <a href="#" className="text-secondary" onClick={this.redirect}>Have an account?</a>
                    </div>
                </div>
            </div>
        );
    }
}
