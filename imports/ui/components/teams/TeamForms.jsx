import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { UsersFormData, FormsUsersDataDB } from '../../../api/forms';
import { ROUTES } from '../../../api/classes/Const';
import moment from 'moment';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import ReactTooltip from 'react-tooltip';

class TeamForms extends Component {
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
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.subscriber = null;
        this.user = null;
    }

    componentDidUpdate() {
        if (this.subscriber && this.user !== this.props.selectedUser.id)
            this.subscriber.stop();
        if (this.state.form && this.user !== this.props.selectedUser.id) {
            this.user = this.props.selectedUser.id;
            this.subscriber = Meteor.subscribe(UsersFormData, { applicantId: this.props.selectedUser.id });
        } else if (!this.state.form) {
            this.user = null;
            if (this.subscriber)
                this.subscriber.stop();
            this.subscriber = null;
        }
    }

    toggleModal() {
        this.setState({ form: !this.state.form });
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
                                    <a href={`${ROUTES.FORMS_VIEWER}/${formData.formId}}`} target="_blank" className="btn btn-primary btn-sm mr-1">
                                        View
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        });
    }

    render() {
        return (
            <a className="link badge badge-success text-light mr-1" data-tip="View Submitted Form Data" style={{ position: 'relative', top: '5px' }}><i className="fa fa-2x fa-list" onClick={this.toggleModal} />
                <Modal isOpen={this.state.form} onRequestClose={this.toggleModal} contentLabel="StatsModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Submitted Form Data of {this.props.selectedUser.username}
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

TeamForms.propTypes = {
    user: PropTypes.object,
    selectedUser: PropTypes.object,
    formsData: PropTypes.array
};

export default withTracker(() => {
    return {
        formsData: FormsUsersDataDB.find({}, { sort: { createdAt: -1 } }).fetch()
    };
})(TeamForms);