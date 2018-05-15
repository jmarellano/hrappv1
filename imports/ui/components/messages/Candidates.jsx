import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ROUTES, SEARCH } from '../../../api/classes/Const';
import Button from '../extras/Button';
import DropdownSelectDup from '../extras/DropdownSelectDup';
import { ValidCandidates, CandidatesDB } from '../../../api/candidates';
import Candidate from '../../../api/classes/Candidate';

class Candidates extends React.Component {
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
        };
        this.changeDisplay = this.changeDisplay.bind(this);
    }

    changeDisplay(display) {
        this.setState({ display });
        //this.props.Client.Account.updateDisplaySetting(display);
    }

    renderCandidates() {
        let lastDate = "";
        return this.props.candidates.map((candidate, index) => {
            let date = candidate.getLastMessageDate();
            let component = (lastDate !== date) && <div className="list-item p-1 text-light bg-secondary-title">{date}</div>
            lastDate = date;
            return (
                <div key={index}>
                    {component}
                    <div className="list-item p-1">
                        <div className="row">
                            <div className="col-sm-12">
                                {candidate.getCategory()}
                                <b>
                                    {candidate.getContact()}
                                    <span className="pull-right">
                                        {!candidate.isRead() && <i data-tip="New" className="message--new fa fa-comment ml-1" aria-hidden="true" />}
                                        {candidate.isReply() && <i data-tip="Replied" className="fa fa-reply ml-1" aria-hidden="true" />}
                                        <i className="fa fa-list-alt ml-1" aria-hidden="true" />
                                        <i className="fa fa-info-circle ml-1" aria-hidden="true" />
                                    </span>
                                </b>
                                <p className="mb-1">{candidate.getSubject()}</p>
                                <small>{candidate.getLastMessageTime()}</small>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    }

    render() {
        return (
            <div className="p-2">
                <div className="row">
                    <div className="col-md-12">
                        <label className="sr-only" htmlFor="inlineFormInputGroupUsername2">Username</label>
                        <div className="input-group mb-2 mr-sm-2">
                            <input type="text" className="form-control" placeholder="Search" />
                            <div className="input-group-prepend">
                                <button className="btn btn-primary input-group-text"><i className="fa fa-search" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-6 mt-1">
                                <h5>Inbox</h5>
                            </div>
                            <div className="col-md-6">
                                <DropdownSelectDup name='filter' options={this.state.displayOptions}
                                    value={this.state.display}
                                    onChange={this.changeDisplay}
                                    className='no-highlight' />
                            </div>
                        </div>
                        <hr />
                    </div>
                    <div id="candidates-list" className="col-md-12">
                        {this.props.isReady && this.renderCandidates()}
                        {!this.props.isReady && <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div>}
                    </div>
                </div>
            </div>
        );
    }
}

Candidates.propTypes = {};

export default withTracker(props => {
    let isReady = Meteor.subscribe(ValidCandidates).ready();
    return {
        isReady,
        candidates: CandidatesDB.find().fetch().map((item, index) => new Candidate(item, index))
    };

})(Candidates);
