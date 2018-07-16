import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../extras/Button';

class Interview extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.aInterview = this.aInterview.bind(this);
        this.rInterview = this.rInterview.bind(this);
    }

    aInterview(callback) {
        this.props.Candidate.interview(this.props.candidate.id, true, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Added to list of candidates for interview!', 'success', 'growl-top-right');
            callback();
        });
    }

    rInterview(callback) {
        this.props.Candidate.interview(this.props.candidate.id, false, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Removed to list of candidates for interview!', 'success', 'growl-top-right');
            callback();
        });
    }

    render() {
        if (!this.props.candidate.interview)
            return <Button className="link badge badge-primary text-light pull-right ml-1 mr-1" data-tip="Add to list for interview" onClick={this.aInterview}><i className="fa fa-plus" /> Interview</Button>;
        else
            return <Button className="link badge badge-primary text-light pull-right ml-1 mr-1" data-tip="Remove to list for interview" onClick={this.rInterview}><i className="fa fa-minus" /> Interview</Button>;
    }
}

Interview.propTypes = {
    candidate: PropTypes.object,
    user: PropTypes.object,
    Candidate: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Interview);