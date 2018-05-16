import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { NotificationsDB, NotifPub } from '../../../api/notifications';
import { SEARCH } from '../../../api/classes/Const';
import Candidates from './Candidates';
import CandidatesContent from './CandidatesContent';
import Notification from './Notification';
import Notif from '../../../api/classes/Notif';

class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: [SEARCH.CATEGORIES, SEARCH.NAME, SEARCH.EMAIL, SEARCH.NUMBER, SEARCH.CLAIMER, SEARCH.ASSIGNED, SEARCH.FOLLOWING, SEARCH.CLAIMED, SEARCH.UNCLAIMED],
            displayOptions: [
                {
                    label: 'All', value: SEARCH.ALL, options: [
                        { value: SEARCH.CATEGORIES, label: 'Category' },
                        { value: SEARCH.NAME, label: 'Name' },
                        { value: SEARCH.EMAIL, label: 'Email' },
                        { value: SEARCH.NUMBER, label: 'Mobile' },
                        { value: SEARCH.CLAIMER, label: 'Claimer' },
                        { value: SEARCH.ASSIGNED, label: 'Assigned' },
                        { value: SEARCH.FOLLOWING, label: 'Following' },
                        { value: SEARCH.CLAIMED, label: 'Claimed' },
                        { value: SEARCH.UNCLAIMED, label: 'Unclaim' },
                    ]
                }
            ],
            search: '',
            searchCandidate: {},
            limit: 20
        };
        this.changeDisplay = this.changeDisplay.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.searchCandidate = this.searchCandidate.bind(this);
    }
    changeDisplay(display) {
        this.setState({ display });
        //this.props.Client.Account.updateDisplaySetting(display);
    }
    changeSearch(e) {
        this.setState({ search: e.target.value });
    }
    searchCandidate() {
        this.setState({
            searchCandidate: {
                search: this.state.search,
                filter: this.state.display,
                limit: this.state.limit
            }
        });
    }
    viewMore() {
        this.setState({ limit: this.state.limit + 20 });
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
                            candidate={this.state.searchCandidate} />
                    </div>
                    <div className="col-md-7">
                        <CandidatesContent {...this.props} />
                    </div>
                    <div className="col-md-2 p-0 m-0">
                        <Notification {...this.props} />
                    </div>
                </div>
            </div>
        );
    }
}

Messages.propTypes = {};

export default withTracker(() => {
    Meteor.subscribe(NotifPub);
    return {
        notifications: NotificationsDB.find({}, { sort: { 'status': -1, 'createdAt': -1 } }).fetch().map((item) => new Notif(item))
    };
})(Messages);
