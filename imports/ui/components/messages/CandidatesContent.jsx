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
import CandidateForms from './CandidateForms';
import Transfer from './Transfer';
import Status from './Status';
import Claim from './Claim';
import Followers from './Followers';
import CandidateMessages from './CandidateMessages';
import CandidateClass from '../../../api/classes/Candidate';
import Modal from '../extras/Modal';

class CandidatesContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20,
            map: false,
            search: '',
            start: '',
            end: ''
        };
        this.viewMore = this.viewMore.bind(this);
        this.toggle = this.toggle.bind(this);
        this.search = this.search.bind(this);
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '350px',
                width: 'auto',
                height: 'auto',
                maxHeight: '380px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }

    search(search, start, end) {
        this.setState({ search, start, end });
    }

    viewMore() {
        this.setState({ limit: this.state.limit + 20 });
    }

    toggle() {
        this.setState({ map: !this.state.map });
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
                            <CandidateForms selectedCandidate={candidate} Candidate={this.props.Candidate} user={this.props.user} location={this.props.location} />
                            <Info selectedCandidate={candidate} Candidate={this.props.Candidate} />
                            {candidate.email && <small className="badge bg-secondary-light text-light mr-1">{candidate.email}</small>}
                            {candidate.number && <small className="badge bg-secondary-light text-light mr-1">{candidate.number}</small>}
                            <a href="#" onClick={this.toggle}>
                                {candidate.state && candidate.country && <i className="fa fa-map-marker mr-1" />}
                                {candidate.state && candidate.country && <small className="mr-1">{candidate.state},</small>}
                                {candidate.state && candidate.country && <small className="mr-1">{candidate.country}</small>}
                            </a>
                            <Transfer {...this.props} />
                            <Claim {...this.props} />
                            <Followers {...this.props} />
                            <Status {...this.props} />
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
                                <CandidateMessages {...this.props} limit={this.state.limit} viewMore={this.viewMore} messages={this.props.messages} setSearch={this.search} search={this.state.search.length ? this.state.search : null} start={this.state.start} end={this.state.end} /> :
                                <div>You need to be follower of this candidate or claim it to view messages.</div>
                        }
                    </div>
                </div>
                <Modal isOpen={this.state.map} contentLabel="MapModal" style={this.styleSet}>
                    <form className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Map
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggle}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <img
                                width="100%"
                                src={`https://maps.googleapis.com/maps/api/staticmap?center=${candidate.getAddressURI()}&markers=size:mid%7Ccolor:0xFF0000%7Clabel:A%7C${candidate.getAddressURI()}&zoom=8&size=300x300&maptype=roadmap&key=${Meteor.settings.public.oAuth.google.apiKey}`}
                            />
                        </div>
                    </form>
                </Modal>
                <ReactTooltip />
            </div>
        );
    }
}

CandidatesContent.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    messages: PropTypes.array,
    Candidate: PropTypes.object,
    location: PropTypes.object
};

export default withTracker((props) => {
    let candidate = CandidatesDB.findOne({ contact: props.candidate.contact });
    return {
        messages: MessagesDB.find({}, { sort: { createdAt: -1 } }).fetch().map((item, index) => new MessageClass(item, index)),
        candidate: candidate ? new CandidateClass(CandidatesDB.findOne({ contact: props.candidate.contact })) : null
    };

})(CandidatesContent);
