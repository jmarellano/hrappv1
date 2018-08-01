import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { CandidateFormData, FormsCandidatesDataDB } from '../../../api/forms';
import { ROUTES } from '../../../api/classes/Const';
import moment from 'moment';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';
import ReactTooltip from 'react-tooltip';

class CandidateForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: false,
            share: false,
            allowed: false,
            id: null,
            email: '',
            gettingId: false,
            name: '',
            formId: null
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '800px',
                width: 'auto',
                height: 'auto',
                maxHeight: '520px',
                margin: '1% auto',
                padding: '0px',
                overflowX: 'none'
            }
        };
        this.styleSetSmall = {
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
        this.toggleModal = this.toggleModal.bind(this);
        this.getCandidateId = this.getCandidateId.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
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

    toggleModal() {
        this.setState({ form: !this.state.form });
    }

    toggleShare(formId) {
        this.setState({ share: !this.state.share, formId });
    }

    copyClipboard() {
        document.addEventListener('copy', (event) => {
            event.preventDefault();
            let clip = event.clipboardData;
            if (clip) {
                clip.setData('text/plain', `${Meteor.absoluteUrl().slice(0, -1)}/${ROUTES.FORMS_VIEWER}/${this.state.formId}/${this.state.id}`);
                Bert.alert('Link copied to clipboard', 'success', 'growl-top-right');
            }
        });
        document.execCommand('copy');
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    renderFormData() {
        return this.props.formsData.map((formData, index) => {
            let arr = [];
            formData.data.forEach((data, i) => {
                arr.push(
                    <span key={i}>
                        <b>{data.label}</b> {data.val} <br />
                    </span>
                )
            });
            return (
                <div className="table-responsive" key={index}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Form Name</th>
                                <th scope="col">Version</th>
                                <th scope="col">Date Created</th>
                                <th scope="col">Data</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">{formData.form}</th>
                                <td>{formData.version}</td>
                                <td>{moment(formData.createdAt).format('MM/DD/YYYY HH:mm:ss A')}</td>
                                <td>{arr}</td>
                                <td>
                                    <a href={`${ROUTES.FORMS_VIEWER}/${formData.formId}/${this.props.selectedCandidate.id._str}`} target="_blank" className="btn btn-primary btn-sm mr-1">
                                        View
                                    </a>
                                    <a href="#" className="btn btn-success btn-sm mr-1" onClick={this.toggleShare.bind(this, formData.formId)}>
                                        Share
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <Modal isOpen={this.state.share} onRequestClose={this.toggleShare.bind(this, null)} contentLabel="FormShareModal" style={this.styleSetSmall}>
                        <div className="panel panel-primary">
                            <div className="panel-heading bg-secondary text-white p-2">
                                <div className="panel-title">
                                    Share form to a candidate
                                    <span className="pull-right">
                                        <a href="#" className="close-modal"
                                            onClick={this.toggleShare.bind(this, null)}>
                                            <i className="fa fa-remove" />
                                        </a>
                                    </span>
                                </div>
                            </div>
                            <div className="panel-body p-2">
                                <form onSubmit={this.getCandidateId}>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control mb-1"
                                        onChange={this.handleChangeInput}
                                        value={this.state.email}
                                        placeholder="Email Address"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        gettingId={this.state.gettingId}
                                        className="btn btn-success mb-1"
                                    >
                                        Generate Link
                                    </Button>
                                </form>
                                {
                                    this.state.id &&
                                    <div>
                                        <input onClick={this.copyClipboard.bind(this)} readOnly={true} type="text" className="form-control mb-1"
                                            value={`${Meteor.absoluteUrl().slice(0, -1)}/${ROUTES.FORMS_VIEWER}/${this.state.formId}/${this.state.id}`} />
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
        });
    }

    render() {
        return (
            <a className="link badge badge-success text-light mr-1" data-tip="View Submitted Form Data"><i className="fa fa-list" onClick={this.toggleModal} />
                <Modal isOpen={this.state.form} onRequestClose={this.toggleModal} contentLabel="StatsModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Submitted Form Data
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {this.renderFormData()}
                        </div>
                    </form>
                </Modal>
                <ReactTooltip />
            </a>
        );
    }
}

CandidateForms.propTypes = {
    Candidate: PropTypes.object,
    user: PropTypes.object,
    selectedCandidate: PropTypes.object,
    formsData: PropTypes.array
};

export default withTracker((props) => {
    Meteor.subscribe(CandidateFormData, { applicantId: props.selectedCandidate.id._str });
    return {
        formsData: FormsCandidatesDataDB.find({}, { sort: { createdAt: -1 } }).fetch()
    };
})(CandidateForms);