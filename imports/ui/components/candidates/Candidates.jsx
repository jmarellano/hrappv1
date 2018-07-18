import React from 'react';
import { CANDIDATE_STATUS, ROLES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import User from '../../../api/classes/User';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { ValidUsers } from "../../../api/users";
import { CandidatesDB, CandidatesPub } from "../../../api/candidates";
import Candidate from "../../../api/classes/Candidate";

class Teams extends React.Component {
    constructor() {
        super();
        this.state = {
            user: null,
            changeStatus: false,
            saving: false,
            selectedRole: '',
            retire: false,
            remove: false,
            permitted: false,
            unRetire: false,
            retiredUsers: [],
            selectedUserRole: null,
            retrieving: true
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
                maxHeight: '170px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.selectStatus = this.selectStatus.bind(this);
        this.candidateStatus = this.candidateStatus.bind(this);
    }

    selectStatus() {
        this.setState({
            saving: true
        });
        this.props.Candidate.changeStats({ status: this.state.selectedStatus }, this.state.selectedCandidate.contact, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Status changed!', 'success', 'growl-top-right');
            this.setState({
                changeStatus: false,
                saving: false,
                selectedCandidate: null,
                friendlyStatus: null,
                selectedRole:  null
            });
        });
    }

    candidateStatus(cell, candidate){
        let status = candidate.status ? parseInt(candidate.status) : CANDIDATE_STATUS.NA;
        return (
            <div key={"wakanda"}>
                <select ref={ "role" + candidate.index } className="form-control"
                        value={ status }
                        onChange={ (selectedStatus)=>{
                            let id = selectedStatus.nativeEvent.target.selectedIndex;
                            this.setState({
                                changeStatus: true,
                                selectedCandidate: candidate,
                                friendlyStatus: selectedStatus.nativeEvent.target[id].text,
                                selectedStatus: selectedStatus.target.value
                            });
                        } }>
                    <option value={ CANDIDATE_STATUS.NA }>N/A Status</option>
                    <option value={ CANDIDATE_STATUS.ABANDONED }>ABANDONED</option>
                    <option value={ CANDIDATE_STATUS.DEV_METEOR }>DEV_METEOR</option>
                    <option value={ CANDIDATE_STATUS.DEV_LT }>DEV_LT</option>
                    <option value={ CANDIDATE_STATUS.DQ_FOREIGNER }>DQ_FOREIGNER</option>
                    <option value={ CANDIDATE_STATUS.DQ_GREY }>DQ_GREY</option>
                    <option value={ CANDIDATE_STATUS.DQ_ECO }>DQ_ECO</option>
                    <option value={ CANDIDATE_STATUS.DQ_SAL }>DQ_SAL</option>
                    <option value={ CANDIDATE_STATUS.DQ_NOT_FIT }>DQ_NOT_FIT</option>
                    <option value={ CANDIDATE_STATUS.FAILED_INT }>FAILED_INT</option>
                    <option value={ CANDIDATE_STATUS.FAILED_METEOR }>FAILED_METEOR</option>
                    <option value={ CANDIDATE_STATUS.HIRED }>HIRED</option>
                    <option value={ CANDIDATE_STATUS.INC }>INC</option>
                    <option value={ CANDIDATE_STATUS.INQ }>INQ</option>
                    <option value={ CANDIDATE_STATUS.INT }>INT</option>
                    <option value={ CANDIDATE_STATUS.NO_RESPONSE }>NO_RESPONSE</option>
                    <option value={ CANDIDATE_STATUS.NO_SHOW }>NO_SHOW</option>
                    <option value={ CANDIDATE_STATUS.QUALIFIED }>QUALIFIED</option>
                    <option value={ CANDIDATE_STATUS.REDIRECT }>REDIRECT</option>
                    <option value={ CANDIDATE_STATUS.RESCHEDULED }>RESCHEDULED</option>
                    <option value={ CANDIDATE_STATUS.SCHED_INT }>SCHED_INT</option>
                    <option value={ CANDIDATE_STATUS.SCHED_LT }>SCHED_LT</option>
                    <option value={ CANDIDATE_STATUS.WITHDREW }>WITHDREW</option>
                    <option value={ CANDIDATE_STATUS.PRE_QUALIFIED }>PRE_QUALIFIED</option>
                </select>
            </div>
        );
    }


    render() {
        return (
            <div className="pull-left main">
                <div className="table-responsive" style={{height: "calc(100% - 60px)"}}>
                    <BootstrapTable data={this.props.validCandidates} striped hover maxHeight='calc(100% - 60px)'>
                        <TableHeaderColumn isKey dataField='name' filter={ { type: 'RegexFilter', placeholder: 'Please enter a Members' } } width={130}>Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' filter={ { type: 'RegexFilter', placeholder: 'Please enter a First Name' } }>Email</TableHeaderColumn>
                        <TableHeaderColumn dataField='number' filter={ { type: 'RegexFilter', placeholder: 'Please enter a Last Name' } } width={200}>Phone Number</TableHeaderColumn>
                        <TableHeaderColumn dataField='address' filter={ { type: 'RegexFilter', placeholder: 'Please enter a Email Add' } }>Address</TableHeaderColumn>
                        <TableHeaderColumn dataField='joinedDt' filter={ { type: 'RegexFilter', placeholder: 'Please enter a Date Time' } } width={200}>Joined Date</TableHeaderColumn>
                        <TableHeaderColumn dataField='friendlyStatus' filter={ { type: 'RegexFilter', placeholder: 'Please enter status' } } dataFormat={this.candidateStatus} width={200} >Status</TableHeaderColumn>
                    </BootstrapTable>
                    {(this.props.validCandidates && this.props.validCandidates.length  && this.props.validCandidates[0].max !== this.props.validCandidates.length) && <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div>}
                </div>
                <Modal
                    isOpen={this.state.changeStatus}
                    style={this.styleSet}
                    contentLabel="Change Status"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Update {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : ""} Status
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to set {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name: "NO_NAME" } Status to {this.state.friendlyStatus}. Continue?
                            </h3>
                            <button onClick={ this.selectStatus } className="btn btn-success" disabled={this.state.saving}>Yes</button>
                            <button onClick={ () => {
                                this.setState({
                                    changeStatus: false,
                                    selectedCandidate: null,
                                    friendlyStatus: null,
                                    selectedRole:  null
                                })
                            } } className="btn btn-danger" style={{marginLeft: "10px"}}>No</button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

Teams.propTypes = {
    Account: PropTypes.object,
    users: PropTypes.array
};

export default withTracker(() => {
    Meteor.subscribe(CandidatesPub);
    return {
        validCandidates: CandidatesDB.find({ retired: 0 }, { sort: { createdAt: -1 } }).fetch().map((item, index) => new Candidate(item, index)),
        retiredCandidates: CandidatesDB.find({ retired: 1 }).fetch().map((item, index) => new Candidate(item, index))
    };
})(Teams);