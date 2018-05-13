import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Accounts } from 'meteor/accounts-base';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';
import { ROUTES } from '../../../api/classes/Const';
import { ValidForms, FormsDB } from '../../../api/forms';
import Form from '../../../api/classes/Form';

class Forms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forms: false,
            confirmation: false,
            selectedForm: null
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
        this.styleSetSmall = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '160px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.onClose = this.onClose.bind(this);
        this.formsModal = this.formsModal.bind(this);
        this.formConfirmationClose = this.formConfirmationClose.bind(this);
        this.deleteForm = this.deleteForm.bind(this);
    }

    onClose() {
        this.setState({
            forms: false,
        });
    }

    formsModal() {
        this.setState({
            forms: true,
        });
    }

    formConfirmationClose() {
        this.setState({
            confirmation: false,
        });
    }

    deleteForm(callback) {
        this.props.Form.deleteForm({ id: this.state.selectedForm.id }, (err, data) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Form Removed', 'success', 'growl-top-right');
            callback();
            this.setState({ confirmation: false });
        });
    }

    renderForms() {
        return this.props.forms.map((form, index) => {
            return (
                <tr key={index}>
                    <td className="pt-3">{form.name}</td>
                    <td className="text-right">
                        <button className="btn btn-default ml-1"
                            onClick={() => {
                                window.open(ROUTES.FORMS_VIEWER + "/" + form.id);
                            }} data-tip="View Form">
                            <i className="fa fa-eye" aria-hidden="true" />
                        </button>
                        <button className="btn btn-primary ml-1"
                            onClick={() => {
                                window.open(ROUTES.FORMS_DATA + "/" + form.id);
                            }} data-tip="View Data">
                            <i className="fa fa-table" aria-hidden="true" />
                        </button>
                        <button className="btn btn-warning ml-1"
                            onClick={() => {
                                window.open(ROUTES.FORMS_CREATOR + "/" + form.id);
                            }} data-tip="Edit Form">
                            <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                        <button className="btn btn-danger ml-1"
                            onClick={() => {
                                this.setState({ confirmation: true, selectedForm: form });
                            }} data-tip="Remove Form">
                            <i className="fa fa-times" aria-hidden="true" />
                        </button>
                    </td>
                </tr>
            );
        });
    }

    render() {
        return (
            <div>
                <a className="nav-link" href="#" onClick={this.formsModal}>
                    <i className="fa fa-2x fa-th-list" />
                </a>
                <Modal isOpen={this.state.forms} contentLabel="FormsModal" style={this.styleSet}>
                    <div className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Forms
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.onClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        {
                            this.props.isReady &&
                            <div className="panel-body p-2">
                                <table className="table">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col">Form Name</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.renderForms()}
                                    </tbody>
                                </table>
                                <hr />
                                <button onClick={() => {
                                    window.open(ROUTES.FORMS_CREATOR + "/0");
                                }} className="btn btn-primary ml-1 pull-right" type="button">
                                    <i className="fa fa-plus" aria-hidden="true" /> New
                                </button>
                                {
                                    !this.props.isMax &&
                                    <button onClick={this.props.viewMore} className="btn btn-default pull-right" type="button">
                                        View More
                                    </button>
                                }
                            </div>
                        }
                        {
                            !this.props.isReady &&
                            <div className="panel-body p-2 text-center">
                                <i className="fa fa-circle-o-notch fa-spin" /> Loading...
                            </div>
                        }
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.confirmation}
                    style={this.styleSetSmall}
                    contentLabel="FormConfirmationModal"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Form Deletion
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.formConfirmationClose}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to remove a form. Continue?
                            </h3>
                            <Button className="btn btn-danger" onClick={this.deleteForm} type="button">
                                Yes
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

Forms.propTypes = {};

export default withTracker((props) => {
    let forms = FormsDB.find({}).fetch().map((item, index) => new Form(item, index));
    return {
        isReady: Meteor.subscribe(ValidForms, props.limit).ready(),
        forms,
        isMax: props.limit >= (forms[0] ? forms[0].max : 0)
    };
})(Forms);