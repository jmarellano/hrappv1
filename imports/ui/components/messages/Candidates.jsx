import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ValidCandidates } from '../../../api/candidates';
import PropTypes from 'prop-types';
import DropdownSelectDup from '../extras/DropdownSelectDup';
import Button from '../extras/Button';
import ReactTooltip from 'react-tooltip';

import TooltipStats from './TooltipStats';
class Candidates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    selectCandidate(candidate) {
        this.props.selectCandidate(candidate);
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
                    <div className="list-item p-1" onClick={this.selectCandidate.bind(this, candidate)}>
                        <div className="row">
                            <div className="col-sm-12">
                                {candidate.getCategory()}
                                <b>
                                    {candidate.getContact()}
                                    <span className="pull-right">
                                        {!candidate.isRead() && <i data-tip="New" className="text-primary-custom fa fa-comment ml-1" aria-hidden="true" />}
                                        {candidate.isReply() && <i data-tip="Replied" className="fa fa-reply ml-1" aria-hidden="true" />}
                                        <i className="fa fa-list-alt ml-1" data-tip data-for={"stats" + index} aria-hidden="true" />
                                        <i className="fa fa-info-circle ml-1" data-tip={`Claimed by: ${candidate.getClaimer()}`} aria-hidden="true" />
                                    </span>
                                </b>
                                <p className="mb-1">{candidate.getSubject()}</p>
                                <small>{candidate.getLastMessageTime()}</small>
                            </div>
                        </div>
                    </div>
                    <ReactTooltip id={"stats" + index} place="right" aria-haspopup="true" role="example">
                        <TooltipStats candidate={candidate} Candidate={this.props.Candidate} />
                    </ReactTooltip>
                    <ReactTooltip />
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
                        <form className="input-group mb-2 mr-sm-2" onSubmit={this.props.searchCandidate}>
                            <input type="text" className="form-control" placeholder="Search" name="search" value={this.props.search} onChange={this.props.changeSearch} />
                            <div className="input-group-prepend">
                                <Button type="submit" className="btn btn-primary input-group-text"><i className="fa fa-search" /></Button>
                            </div>
                        </form>
                    </div>
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-3 mt-1">
                                <h5>Inbox</h5>
                            </div>
                            <div className="col-md-9 p-0">
                                <DropdownSelectDup name='filter' options={this.props.displayOptions} value={this.props.display} onChange={this.props.changeDisplay} className='no-highlight' />
                            </div>
                        </div>
                        <hr />
                    </div>
                    <div id="candidates-list" className="col-md-12">
                        {this.renderCandidates()}
                        {
                            this.props.isReady && !this.props.candidates.length &&
                            < div className="text-center">No candidate is found</div>
                        }
                        {
                            this.props.isReady && this.props.candidates.length && this.props.candidates[0].max > this.props.candidates.length ?
                                <button className="btn btn-sm btn-success mt-1 mb-1 form-control" onClick={this.props.viewMore}>View More</button> : null
                        }
                        {!this.props.isReady && <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div>}
                    </div>
                </div>
            </div >
        );
    }
}

Candidates.propTypes = {
    candidates: PropTypes.array,
    displayOptions: PropTypes.array,
    display: PropTypes.array,
    isReady: PropTypes.bool,
    search: PropTypes.string,
    candidate: PropTypes.object,
    changeDisplay: PropTypes.func,
    changeSearch: PropTypes.func,
    searchCandidate: PropTypes.func,
    viewMore: PropTypes.func,
    selectCandidate: PropTypes.func,
    Candidate: PropTypes.object
};

export default withTracker((props) => {
    let isReady = Meteor.subscribe(ValidCandidates, props.candidate).ready();
    return {
        isReady
    };

})(Candidates);
