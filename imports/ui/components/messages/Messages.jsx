import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { NotificationsDB, NotifPub } from '../../../api/notifications';
import { CandidatesDB } from '../../../api/candidates';
import { SEARCH } from '../../../api/classes/Const';
import Candidates from './Candidates';
import CandidatesContent from './CandidatesContent';
import Notif from '../../../api/classes/Notif';
import Candidate from '../../../api/classes/Candidate';
import PropTypes from 'prop-types';

class Messages extends React.Component {
    constructor(props) {
        super(props);
        let display = [
            SEARCH.CATEGORIES,
            SEARCH.NAME,
            SEARCH.EMAIL,
            SEARCH.NUMBER,
            SEARCH.CLAIMER,
            SEARCH.ASSIGNED
        ];
        this.state = {
            display,
            displayOptions: [
                {
                    label: 'ALL TEXT', value: SEARCH.ALL, options: [
                        { value: SEARCH.CATEGORIES, label: 'Category' },
                        { value: SEARCH.CLAIMER, label: 'Claimer' },
                        { value: SEARCH.EMAIL, label: 'Email' },
                        { value: SEARCH.NUMBER, label: 'Mobile' },
                        { value: SEARCH.NAME, label: 'Name' }
                    ]
                },
                {
                    label: 'ALL STATUS', value: SEARCH.ALL, options: [
                        { value: SEARCH.ASSIGNED, label: 'Assigned' },
                        { value: SEARCH.CLAIMED, label: 'Claimed' },
                        { value: SEARCH.FOLLOWING, label: 'Following' },
                        { value: SEARCH.UNCLAIMED, label: 'Unclaim' },
                    ]
                },
                {
                    label: 'ALL STATS', value: SEARCH.ALL, options: [
                        { value: SEARCH.resume, label: 'resume' },
                        { value: SEARCH.portfolio, label: 'portfolio' },
                        { value: SEARCH.disc, label: 'disc' },
                        { value: SEARCH.values, label: 'values' },
                        { value: SEARCH.iq, label: 'iq' },
                        { value: SEARCH.TEST_METEOR, label: 'TEST_METEOR' },
                        { value: SEARCH.TEST_LIVE, label: 'TEST_LIVE' },
                        { value: SEARCH.TEST_WRITING, label: 'TEST_WRITING' },
                        { value: SEARCH.VIDEO, label: 'VIDEO' },
                        { value: SEARCH.INTERVIEW, label: 'INTERVIEW' },
                        { value: SEARCH.MANAGER, label: 'MANAGER' },
                        { value: SEARCH.TEST_IMAGE, label: 'TEST_IMAGE' },
                        { value: SEARCH.TEST_CREATIVE, label: 'TEST_CREATIVE' },
                        { value: SEARCH.TEST_WEBFLOW, label: 'TEST_WEBFLOW' },
                        { value: SEARCH.TEST_MOCK, label: 'TEST_MOCK' },
                        { value: SEARCH.TEST_SIMULATION, label: 'TEST_SIMULATION' },
                        { value: SEARCH.others, label: 'others' },
                    ]
                }
            ],
            search: '',
            searchCandidate: {
                search: '',
                filter: display,
                limit: 20
            },
            limit: 20,
            candidate: null
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.searchCandidate = this.searchCandidate.bind(this);
        this.viewMore = this.viewMore.bind(this);
        this.selectCandidate = this.selectCandidate.bind(this);
    }
    changeDisplay(display) {
        this.setState({ display }, () => {
            this.searchCandidate();
        });
    }
    changeSearch(e) {
        this.setState({ search: e.target.value });
    }
    searchCandidate(e) {
        if (e)
            e.preventDefault();
        this.setState({
            searchCandidate: {
                search: this.state.search,
                filter: this.state.display,
                limit: this.state.limit
            }
        });
    }
    viewMore() {
        this.setState({ limit: this.state.limit + 20 }, () => {
            this.searchCandidate();
        });
    }
    selectCandidate(candidate) {
        this.setState({ candidate: this.props.candidates.filter((item) => candidate.id === item.id)[0] });
        this.props.Message.read(candidate.id);
    }
    render() {
        console.log('messages');
        return (
            <div id="messages" className="pull-left main">
                <div className="row m-0 p-0">
                    <div className="col-md-3 bg-secondary-light vh">
                        <Candidates
                            {...this.props}
                            display={this.state.display}
                            displayOptions={this.state.displayOptions}
                            changeDisplay={this.changeDisplay}
                            search={this.state.search}
                            changeSearch={this.changeSearch}
                            searchCandidate={this.searchCandidate}
                            candidate={this.state.searchCandidate}
                            viewMore={this.viewMore}
                            selectCandidate={this.selectCandidate}
                            candidates={this.props.candidates} />
                    </div>
                    <div className="col-md-9">
                        {this.state.candidate && <CandidatesContent {...this.props} candidate={this.state.candidate} Candidate={this.props.Candidate} Message={this.props.Message} />}
                    </div>
                    {/* <div className="col-md-2 p-0 m-0">
                        <Notification {...this.props} />
                    </div> */}
                </div>
            </div>
        );
    }
}

Messages.propTypes = {
    candidates: PropTypes.array,
    Candidate: PropTypes.object,
    Message: PropTypes.object
};

export default withTracker(() => {
    Meteor.subscribe(NotifPub);
    return {
        notifications: NotificationsDB.find({}, { sort: { 'status': -1, 'createdAt': -1 } }).fetch().map((item) => new Notif(item)),
        candidates: CandidatesDB.find({}, { sort: { 'lastMessage.createdAt': -1 } }).fetch().map((item) => new Candidate(item))
    };
})(Messages);
