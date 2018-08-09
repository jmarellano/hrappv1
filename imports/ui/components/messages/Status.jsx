import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { CANDIDATE_STATUS } from '../../../api/classes/Const';
import PropTypes from 'prop-types';

class Status extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false
        };
        this.status = this.status.bind(this);
    }

    status(e) {
        this.setState({ processing: true });
        this.props.Candidate.status(this.props.candidate.id, e.target.value, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate status changed!', 'success', 'growl-top-right');
            this.setState({ processing: false });
        });
    }

    render() {
        if (this.state.processing)
            return (
                <div className="pull-right" data-tip="Candidates' Status">
                    <i className="fa fa-spin fa-spinner" />
                </div>
            );
        return (
            <select className="btn-xs pull-right rounded" data-tip="Candidates' Status" value={this.props.candidate.status || ''} onChange={this.status}>
                < option value={CANDIDATE_STATUS.NA} > N / A Status</option >
                <option value={CANDIDATE_STATUS.ABANDONED}>Abandoned INT</option>
                <option value={CANDIDATE_STATUS.DEV_METEOR}>DEV - Meteor</option>
                <option value={CANDIDATE_STATUS.DEV_LT}>DEV - LT</option>
                <option value={CANDIDATE_STATUS.DQ_FOREIGNER}>DQ - Foreigner</option>
                <option value={CANDIDATE_STATUS.DQ_GREY}>DQ - High D grey</option>
                <option value={CANDIDATE_STATUS.DQ_ECO}>DQ - High Eco</option>
                <option value={CANDIDATE_STATUS.DQ_SAL}>DQ - High Sal Exp</option>
                <option value={CANDIDATE_STATUS.DQ_NOT_FIT}>DQ - Not Fit</option>
                <option value={CANDIDATE_STATUS.FAILED_INT}>Failed Int</option>
                <option value={CANDIDATE_STATUS.FAILED_METEOR}>Failed Meteor / LT</option>
                <option value={CANDIDATE_STATUS.HIRED}>Hired</option>
                <option value={CANDIDATE_STATUS.INC}>Inc. Requirements</option>
                <option value={CANDIDATE_STATUS.INQ}>Inquiry / Follow Up</option>
                <option value={CANDIDATE_STATUS.INT}>Interviewed - Waiting for Approval</option>
                <option value={CANDIDATE_STATUS.NO_RESPONSE}>No Response</option>
                <option value={CANDIDATE_STATUS.NO_SHOW}>No Show</option>
                <option value={CANDIDATE_STATUS.QUALIFIED}>Qualified</option>
                <option value={CANDIDATE_STATUS.REDIRECT}>Redirect to Another Post</option>
                <option value={CANDIDATE_STATUS.RESCHEDULED}>Rescheduled</option>
                <option value={CANDIDATE_STATUS.SCHED_INT}>Sched for INT</option>
                <option value={CANDIDATE_STATUS.SCHED_LT}>Sched for LT</option>
                <option value={CANDIDATE_STATUS.WITHDREW}>Withdrew Application</option>
                <option value={CANDIDATE_STATUS.PRE_QUALIFIED}>Pre-Qualified</option>
                <option value={CANDIDATE_STATUS.RESIGNED}>Resigned</option>
                <option value={CANDIDATE_STATUS.TERMED}>Termed</option>
            </select >
        );
    }
}

Status.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    Candidate: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Status);