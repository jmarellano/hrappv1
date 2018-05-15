import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { TMQFormBuilder } from '../extras/TMQFormBuilder.js';
import { ROUTES, ROLES, isPermitted } from '../../../api/classes/Const';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import ReCAPTCHA from "react-google-recaptcha";
import Modal from '../extras/Modal';
import Button from '../extras/Button';

class FormViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allowed: false,
            share: false,
            id: null,
            email: '',
            gettingId: false,
            form: {}
        };
        this.formbuilder = null;
        this.form = null;
        this.successLocation = this.successLocation.bind(this);
        this.errorLocation = this.errorLocation.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.getCandidateId = this.getCandidateId.bind(this);
        this.location = false;
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '400px',
                width: 'auto',
                height: 'auto',
                maxHeight: '230px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }

    componentDidMount() {
        let submit = function () { };
        this.setState({ loading: true });
        this.props.Form.getForm({ id: this.props.id }, (err, form) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                this.formbuilder = new TMQFormBuilder(submit);
                this.formbuilder.loadData(JSON.parse(form.template[form.template.length - 1]), true);
            }
            this.setState({ loading: false, form });
        });
    }

    componentDidUpdate() {
        navigator.geolocation.getCurrentPosition(this.successLocation, this.errorLocation);
    }

    successLocation(position) {
        this.location = position.coords;
    }

    errorLocation() {
        this.location = false;
    }

    onChange() {
        this.setState({ allowed: true });
    }

    saveForm(e) {
        e.preventDefault();
        const match = matchPath(this.props.location.pathname, {
            path: '/:component/:data/:applicant',
            exact: false,
            strict: false
        });
        if (!this.state.allowed && match) {
            Bert.alert('ReCaptcha is not valid', 'danger', 'growl-top-right');
            return null;
        }
        if (!match) {
            Bert.alert('Submit form in this page is not valid', 'danger', 'growl-top-right');
            return null;
        }
        let array = $(':input').map(function () {
            let val = '';
            if ($(this).is(':radio') || $(this).is(':checkbox')) {
                val = ($(this).is(':checked')) ? $(this).val() : '';
            } else
                val = $(this).val();
            return {
                label: $(this).prevAll('label:first').text(),
                val: val
            };
        }).get();
        let template = this.state.form;
        this.props.Form.submit([null, match.params.component, match.params.data, match.params.applicant], this.location, array, template.template.length, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                $('input, textarea, select').not(':input[type=button], :input[type=submit], :input[type=reset]').val('');
                Bert.alert('Data submitted', 'success', 'growl-top-right', 'fa-check');
            }
            this.setState({ allowed: false }, function () {
                this.captcha.reset();
            });
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

    copyClipboard() {
        document.addEventListener('copy', (event) => {
            event.preventDefault();
            let clip = event.clipboardData;
            if (clip) {
                clip.setData('text/plain', `${Meteor.absoluteUrl().slice(0, -1)}${this.props.location.pathname}/${this.state.id}`);
                Bert.alert('Link copied to clipboard', 'success', 'growl-top-right');
            }
        });
        document.execCommand('copy');
    }

    toggleModal() {
        this.setState({ share: !this.state.share });
    }

    getCandidateId(e) {
        e.preventDefault();
        if (!this.state.email)
            return;
        this.setState({ gettingId: true });
        this.props.Candidate.getId(this.state.email, (err, id) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                this.setState({ id, gettingId: false });
        });
    }

    render() {
        return (
            <div className="container">
                <form onSubmit={this.saveForm.bind(this)}>
                    <div id="tmq-form-builder">
                        <button className="btn btn-secondary pull-left" onClick={() => {
                            this.props.history.replace(ROUTES.MESSAGES)
                        }}>
                            <i className="fa fa-arrow-left " /> Go Home
                        </button>
                        {
                            this.props.user && isPermitted(this.props.user.role, ROLES.STAFFS) ?
                                <button type="button" className="btn btn-secondary pull-right mb-1"
                                    onClick={this.toggleModal}>
                                    <i className="fa fa-share-alt" /> Share
                                </button> : null
                        }
                        <ul id="tmq-form-builder-center" className="text-center" />
                        {
                            this.props.location.pathname.split("/")[3] &&
                            <ReCAPTCHA ref={(el) => { this.captcha = el; }} size="normal" sitekey="6LcLLCgUAAAAAG5U2RfKxQ9dBw0xWNVrGcSAFFm8" onChange={this.onChange.bind(this)} />
                        }
                    </div>
                </form>
                <Modal isOpen={this.state.share} contentLabel="FormShareModal" style={this.styleSet}>
                    <div className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Share form to a candidate
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <form onSubmit={this.getCandidateId}>
                                <input type="email" name="email" className="form-control mb-1" onChange={this.handleChangeInput} value={this.state.email} placeholder="Email Address" required />
                                <Button type="submit" gettingId={this.state.gettingId} className="btn btn-success mb-1">Generate Link</Button>
                            </form>
                            {
                                this.state.id &&
                                <div>
                                    <input onClick={this.copyClipboard.bind(this)} readOnly={true} type="text" className="form-control mb-1"
                                        value={`${Meteor.absoluteUrl().slice(0, -1)}${this.props.location.pathname}/${this.state.id}`} />
                                    <button type="button" onClick={this.copyClipboard.bind(this)} disabled={!this.state.id}
                                        className="btn btn-default">
                                        Share
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
FormViewer.propTypes = {
    Form: PropTypes.object,
    id: PropTypes.string,
    location: PropTypes.object,
    Candidate: PropTypes.object,
    history: PropTypes.object,
    user: PropTypes.object

};
export default withTracker((props) => {
    const match = matchPath(props.location.pathname, {
        path: '/:component/:data',
        exact: false,
        strict: false
    });
    let path = '',
        id = '';
    if (!match)
        props.history.replace(ROUTES.FORMS_NOT_FOUND);
    else {
        path = match.params.data;
        id = (path !== '0') ? path : '';
    }
    return {
        id
    };
})(FormViewer);