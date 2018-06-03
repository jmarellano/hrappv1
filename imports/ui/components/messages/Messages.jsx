import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { NotificationsDB, NotifPub } from '../../../api/notifications';
import { CandidatesDB, MessagesUnreadCountPub } from '../../../api/candidates';
import { SEARCH } from '../../../api/classes/Const';
import Candidates from './Candidates';
import CandidatesContent from './CandidatesContent';
import Notif from '../../../api/classes/Notif';
import Candidate from '../../../api/classes/Candidate';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import TooltipInbox from './TooltipInbox';

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
                        { value: SEARCH.CLAIMED, label: 'Claimed', element: <span>{'Claimed'}<span className="pull-right mt-1 badge badge-warning">{props.claimed}</span></span> },
                        { value: SEARCH.FOLLOWING, label: 'Following' },
                        { value: SEARCH.UNCLAIMED, label: 'Unclaim', element: <span>{'Unclaimed'}<span className="pull-right mt-1 badge badge-warning">{props.unclaimed}</span></span> },
                    ]
                },
                {
                    label: 'ALL STATS', value: SEARCH.ALL, options: [
                        { value: SEARCH.resume, label: 'resume', element: <span>{'resume'}<span className="pull-right mt-1 badge badge-secondary">{'> 5'}</span></span> },
                        { value: SEARCH.portfolio, label: 'portfolio', element: <span>{'portfolio'}<span className="pull-right mt-1 badge badge-secondary">{'> 5'}</span></span> },
                        { value: SEARCH.disc, label: 'disc', element: <span>{'disc'}<span className="pull-right mt-1 badge badge-secondary">{'> 5'}</span></span> },
                        { value: SEARCH.values, label: 'values', element: <span>{'values'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.iq, label: 'iq', element: <span>{'iq'}<span className="pull-right mt-1 badge badge-secondary">{'> 110'}</span></span> },
                        { value: SEARCH.TEST_METEOR, label: 'TEST_METEOR', element: <span>{'TEST_METEOR'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_LIVE, label: 'TEST_LIVE', element: <span>{'TEST_LIVE'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_WRITING, label: 'TEST_WRITING', element: <span>{'TEST_WRITING'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.VIDEO, label: 'VIDEO', element: <span>{'VIDEO'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.INTERVIEW, label: 'INTERVIEW', element: <span>{'INTERVIEW'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.MANAGER, label: 'MANAGER', element: <span>{'MANAGER'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_IMAGE, label: 'TEST_IMAGE', element: <span>{'TEST_IMAGE'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_CREATIVE, label: 'TEST_CREATIVE', element: <span>{'TEST_CREATIVE'}<span className="pull-right mt-1 badge badge-secondary">{'> 5'}</span></span> },
                        { value: SEARCH.TEST_WEBFLOW, label: 'TEST_WEBFLOW', element: <span>{'TEST_WEBFLOW'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_MOCK, label: 'TEST_MOCK', element: <span>{'TEST_MOCK'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.TEST_SIMULATION, label: 'TEST_SIMULATION', element: <span>{'TEST_SIMULATION'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
                        { value: SEARCH.others, label: 'others', element: <span>{'others'}<span className="pull-right mt-1 badge badge-secondary">{'> 10'}</span></span> },
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
            candidate: null,
            tooltip: (
                <ReactTooltip id={"selected_options"} place="bottom" aria-haspopup="true" role="example">
                    <TooltipInbox value={display} />
                </ReactTooltip>
            )
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.searchCandidate = this.searchCandidate.bind(this);
        this.viewMore = this.viewMore.bind(this);
        this.selectCandidate = this.selectCandidate.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.unclaimed !== this.props.unclaimed || prevProps.claimed !== this.props.claimed) {
            let displayOptions = this.state.displayOptions;
            displayOptions[1].options[1]['element'] = this.props.claimed ? <span>{'Claimed'}<span className="pull-right mt-1 badge badge-warning">{this.props.claimed}</span></span> : null;
            displayOptions[1].options[3]['element'] = this.props.unclaimed ? <span>{'Unclaimed'}<span className="pull-right mt-1 badge badge-warning">{this.props.unclaimed}</span></span> : null;
            this.setState({ displayOptions });
        }
    }
    changeDisplay(display) {
        this.setState({
            display,
            tooltip: null
        }, () => {
            this.searchCandidate();
            this.setState({
                tooltip: (
                    <ReactTooltip id={"selected_options"} place="bottom" aria-haspopup="true" role="example">
                        <TooltipInbox value={display} />
                    </ReactTooltip>
                )
            });
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
                            candidates={this.props.candidates}
                            tooltip={this.state.tooltip} />
                    </div>
                    <div className="col-md-9">
                        {this.state.candidate && <CandidatesContent {...this.props} candidate={this.state.candidate} Candidate={this.props.Candidate} Message={this.props.Message} />}
                    </div>
                </div>
            </div>
        );
    }
}

Messages.propTypes = {
    candidates: PropTypes.array,
    Candidate: PropTypes.object,
    Message: PropTypes.object,
    claimed: PropTypes.number,
    unclaimed: PropTypes.number,
};

export default withTracker(() => {
    Meteor.subscribe(NotifPub);
    return {
        notifications: NotificationsDB.find({}, { sort: { 'status': -1, 'createdAt': -1 } }).fetch().map((item) => new Notif(item)),
        candidates: CandidatesDB.find({}, { sort: { 'lastMessage.createdAt': -1 } }).fetch().map((item) => new Candidate(item)),
        unclaimed: Counts.get(MessagesUnreadCountPub + '_unclaimed'),
        claimed: Counts.get(MessagesUnreadCountPub + '_claimed')
    };
})(Messages);
