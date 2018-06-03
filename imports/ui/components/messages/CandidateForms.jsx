import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { CandidateFormData, FormsDDB } from '../../../api/forms';
import moment from 'moment';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import ReactTooltip from 'react-tooltip';

class CandidateForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: false,
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
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({ form: !this.state.form });
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">{formData.form}</th>
                                <td>{formData.version}</td>
                                <td>{moment(formData.createdAt).format('MM/DD/YYYY HH:mm:ss A')}</td>
                                <td>{arr}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        });
    }

    render() {
        return (
            <a className="link badge badge-success text-light mr-1" data-tip="View Submitted Form Data"><i className="fa fa-list" onClick={this.toggleModal} />
                <Modal isOpen={this.state.form} contentLabel="StatsModal" style={this.styleSet}>
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
        formsData: FormsDDB.find({}, { sort: { createdAt: -1 } }).fetch()
    };
})(CandidateForms);