import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { TMQFormBuilder } from '../extras/TMQFormBuilder.js';
import { FormsDB } from '../../../api/forms';
//import { CandidatesPubValid, Candidates } from '../../api/candidates';
import { ROUTES, ROLES, isPermitted } from '../../../api/classes/Const';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import ReCAPTCHA from "react-google-recaptcha";
//import Modal from 'react-modal';
//import Select from 'react-select';

class FormViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allowed: false,
            share: false,
            id: {},
            active_candidates: [],
        };
        this.formbuilder = null;
        this.form = null;
        this.successLocation = this.successLocation.bind(this);
        this.errorLocation = this.errorLocation.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.location = false;
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
    }

    componentDidMount() {
        // this.props.Candidate.fetch((data) => {
        //     this.setState({ active_candidates: data });
        // }, (err) => {
        //     Bert.alert(err, 'danger', 'growl-top-right');
        // });
        let submit = function () { };
        this.setState({ loading: true });
        this.props.Form.getForm({ id: this.props.id }, (err, form) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                this.formbuilder = new TMQFormBuilder(submit);
                this.formbuilder.loadData(JSON.parse(form.template[form.template.length - 1]), true);
            }
            this.setState({ loading: false });
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
        // const match = matchPath(this.props.location.pathname, {
        //     path: '/:component/:data/:applicant',
        //     exact: false,
        //     strict: false
        // });
        // if (!this.state.allowed && match) {
        //     Bert.alert("ReCaptcha is not valid", 'danger', 'growl-top-right');
        //     return null;
        // }
        // if (!match) {
        //     Bert.alert("Submit form in this page is not valid", 'danger', 'growl-top-right');
        //     return null;
        // }
        // let array = $(":input").map(function () {
        //     let val = "";
        //     if ($(this).is(':radio') || $(this).is(':checkbox')) {
        //         val = ($(this).is(':checked')) ? $(this).val() : "";
        //     } else
        //         val = $(this).val();
        //     return {
        //         label: $(this).prevAll('label:first').text(),
        //         val: val
        //     };
        // }).get();
        // let template = FormsDB.findOne({ _id: new Mongo.ObjectID(match.params.data) });
        // this.props.Form.submit([null, match.params.component, match.params.data, match.params.applicant], this.location, array, template.template.length, (data) => {
        //     $('input, textarea, select')
        //         .not(':input[type=button], :input[type=submit], :input[type=reset]').val('');
        //     Bert.alert(data, 'success', 'growl-top-right', 'fa-check');
        //     this.setState({ allowed: false }, function () {
        //         captcha.reset();
        //     });
        // }, (err) => {
        //     Bert.alert(err, 'danger', 'growl-top-right');
        //     captcha.reset();
        // })
    }

    handleChange = (id) => {
        this.setState({ id });
    }

    activeUsers() {
        return this.state.active_candidates.map((candidate, index) => {
            return { value: candidate._id, label: candidate.name };
        });
    }

    copyClipboard() {
        document.addEventListener("copy", (event) => {
            event.preventDefault();
            let clip = event.clipboardData;
            if (clip) {
                clip.setData("text/plain", this.state.id.value ? `${Meteor.settings.public.config.url}${this.props.location.pathname.replace("/", "")}/${this.state.id.value}` : "");
                Bert.alert("Link copied to clipboard", "success", "growl-top-right");
            }
        });
        document.execCommand("copy");
    }

    render() {
        return (
            <div className="container">
                <form onSubmit={this.saveForm.bind(this)}>
                    <div id="tmq-form-builder">
                        <button className="btn btn-secondary" onClick={() => {
                            this.props.history.replace(ROUTES.MESSAGES)
                        }}>
                            <i className="fa fa-arrow-left" /> Go Home
                        </button>
                        {
                            this.props.user && isPermitted(this.props.user.role, ROLES.STAFFS) ?
                                <button className="btn btn-secondary pull-right mr-0 mb-1"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({ share: true });
                                    }}>
                                    <i className="fa fa-share-alt" /> Share
                                </button> : null
                        }
                        <ul id="tmq-form-builder-center" className="text-center" />
                        <ReCAPTCHA style={{ display: this.props.location.pathname.split("/")[3] ? "block" : "none" }}
                            ref={(el) => {
                                captcha = el;
                            }}
                            size="normal"
                            sitekey="6LcLLCgUAAAAAG5U2RfKxQ9dBw0xWNVrGcSAFFm8"
                            onChange={this.onChange.bind(this)}
                        />
                    </div>
                </form>
                {/* <Modal
                    isOpen={this.state.share}
                    className={this.className}
                    contentLabel="FormShareModal"
                    style={{
                        content: {
                            height: "340px"
                        }
                    }}
                >
                    <div>
                        <h3>
                            Share form to a candidate
                        </h3>
                        <Select
                            className="mb"
                            name="form-field-name"
                            value={this.state.id}
                            onChange={this.handleChange}
                            options={this.activeUsers()}
                        />
                        {
                            this.state.id.value ?
                                <input onClick={this.copyClipboard.bind(this)} readOnly={true} type="text"
                                    className="mb"
                                    value={this.state.id.value ? `${Meteor.settings.public.config.url}${this.props.location.pathname.replace("/", "")}/${this.state.id.value}` : ""} />
                                : null
                        }
                        <button onClick={this.copyClipboard.bind(this)} disabled={!this.state.id.value}
                            className="button button-default">
                            Share
                        </button>
                        <button onClick={() => {
                            this.setState({ share: false });
                        }} className="button button--secondary">
                            Close
                        </button>
                    </div>
                </Modal> */}
            </div>
        );
    }
}
FormViewer.propTypes = {};
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
        active_users: [], // TODO 
        id
    };
})(FormViewer);