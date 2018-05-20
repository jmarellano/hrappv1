import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROLES, isPermitted } from '../../../api/classes/Const';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';

class Transfer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
            transfer: false,
            user: ''
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
                maxHeight: '200px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.transferClaim = this.transferClaim.bind(this);
    }

    transferClaim(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Candidate.transferClaim({ id: this.props.candidate.id, user: this.state.user }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Transferred!', 'success', 'growl-top-right');
            this.setState({ transfer: false, processing: false });
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

    toggleModal() {
        this.setState({ transfer: !this.state.transfer });
    }

    renderUsers() {
        return this.props.users.map((user, index) => {
            return (
                <option value={user.id} key={index}>{user.username}</option>
            );
        });
    }

    render() {
        if (!isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE))
            return null;
        return (
            <button className="link badge badge-success text-light pull-right ml-1 mr-1" data-tip="Transfer Claim" onClick={this.toggleModal}><i className="fa fa-exchange" /> Transfer
                <Modal isOpen={this.state.transfer} contentLabel="TransferModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.transferClaim}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Transfer
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <select className="form-control" name="user" value={this.state.user} onChange={this.handleChangeInput} required>
                                <option value={''} disabled>Select User</option>
                                {this.renderUsers()}
                            </select>
                        </div>
                        <div className="panel-footer p-2">
                            <hr />
                            <div className="container">
                                <div className="pull-right mb-2">
                                    <Button type="submit" className="form-control btn btn-success" processing={this.state.processing}>Save</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            </button>
        );
    }
}

Transfer.propTypes = {
    user: PropTypes.object,
    users: PropTypes.array,
    Candidate: PropTypes.object,
    candidate: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Transfer);