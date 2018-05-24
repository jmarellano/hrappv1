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
import Transfer from './Transfer';
import Claim from './Claim';
import Followers from './Followers';
import CandidateMessages from './CandidateMessages';
import CandidateClass from '../../../api/classes/Candidate';

class CandidatesContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20
        };
        this.viewMore = this.viewMore.bind(this);
    }

    viewMore() {
        this.setState({ limit: this.state.limit + 20 });
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
                            <Transfer {...this.props} />
                            <Claim {...this.props} />
                            <Followers {...this.props} />
                        </div>
                        <hr />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        {
                            isPermitted(this.props.user.role, ROLES.VIEW_MESSAGES_PRIVATE) ||
                                this.props.user.id === candidate.claimed ||
                                (candidate.followers && candidate.followers.filter((item) => item.id === this.props.user.id).length) ?
                                <CandidateMessages {...this.props} limit={this.state.limit} viewMore={this.viewMore} messages={this.props.messages} /> :
                                <div>You need to be follower of this candidate or claim it to view messages.</div>
                        }
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
        messages: MessagesDB.find({}, { sort: { createdAt: -1 } }).fetch().map((item, index) => new MessageClass(item, index)),
        candidate: candidate ? new CandidateClass(CandidatesDB.findOne({ contact: props.candidate.contact })) : null
    };

})(CandidatesContent);
