import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { ROLES, isPermitted } from '../../../api/classes/Const';
import { MessagesDB } from '../../../api/messages';
import { CandidatesDB } from '../../../api/candidates';
import MessageClass from '../../../api/classes/Message';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';

import Info from './Info';
import Stats from './Stats';
import CandidateMessages from './CandidateMessages';
import CandidateClass from '../../../api/classes/Candidate';

class CandidatesContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 1
        };
        this.viewMore = this.viewMore.bind(this);
    }

    viewMore() {
        this.setState({ limit: this.state.limit + 1 });
    }

    render() {
        let candidate = this.props.candidate;
        if (!candidate)
            return null;
        return (
            <div className="p-2">
                <div className="row">
                    <div className="col-sm-12">
                        <div>
                            <b>{candidate.getDisplayName()}</b>
                        </div>
                        <div>
                            <Stats selectedCandidate={candidate} Candidate={this.props.Candidate} />
                            <Info selectedCandidate={candidate} Candidate={this.props.Candidate} />
                            {candidate.email && <small className="badge bg-secondary-light text-light mr-1">{candidate.email}</small>}
                            {candidate.number && <small className="badge bg-secondary-light text-light mr-1">{candidate.number}</small>}
                            {
                                (isPermitted(this.props.user.role, ROLES.ADMIN) || isPermitted(this.props.user.role, ROLES.SUPERUSER)) &&
                                <a className="link badge badge-success text-light pull-right mr-1 mt-1" data-tip="Transfer Claim"><i className="fa fa-exchange" /> Transfer</a>
                            }
                            {!candidate.claimed && <a className="link badge badge-success text-light pull-right mr-1 mt-1" data-tip="Claim"><i className="fa fa-check-square" /> Claim</a>}
                            <a className="link badge badge-primary text-light pull-right mr-1 mt-1" data-tip="View followers">
                                <i className="fa fa-eye" />&nbsp;
                                {candidate.followers ? candidate.followers.length : 0} Followers
                            </a>
                        </div>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <CandidateMessages {...this.props} limit={this.state.limit} viewMore={this.viewMore} messages={this.props.messages} />
                    </div>
                </div>
                <ReactTooltip />
            </div>
        );
    }
}

CandidatesContent.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    messages: PropTypes.array,
    Candidate: PropTypes.object
};

export default withTracker((props) => {
    let candidate = CandidatesDB.findOne({ contact: props.candidate.contact });
    return {
        messages: MessagesDB.find({}, { sort: { createdAt: -1 } }).fetch().map((item) => new MessageClass(item)),
        candidate: candidate ? new CandidateClass(CandidatesDB.findOne({ contact: props.candidate.contact })) : null
    };

})(CandidatesContent);
