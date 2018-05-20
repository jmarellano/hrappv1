import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../extras/Button';

class Claim extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.claim = this.claim.bind(this);
        this.unclaim = this.unclaim.bind(this);
    }

    claim(callback) {
        this.props.Candidate.claim(this.props.candidate.id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Claimed!', 'success', 'growl-top-right');
            callback();
        });
    }

    unclaim(callback) {
        this.props.Candidate.unclaim(this.props.candidate.id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Unclaimed!', 'success', 'growl-top-right');
            callback();
        });
    }

    render() {
        if (!this.props.candidate.claimed)
            return <Button className="link badge badge-success text-light pull-right ml-1 mr-1" data-tip="Claim" onClick={this.claim}><i className="fa fa-check-square" /> Claim</Button>;
        if (this.props.candidate.claimed === this.props.user.id)
            return <Button className="link badge badge-success text-light pull-right ml-1 mr-1" data-tip="Unclaim" onClick={this.unclaim}><i className="fa fa-square" /> Unclaim</Button>;
        return null;
    }
}

Claim.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    Candidate: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Claim);