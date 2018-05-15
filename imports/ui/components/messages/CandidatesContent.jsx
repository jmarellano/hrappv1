import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ROUTES } from '../../../api/classes/Const';
import Button from '../extras/Button';
import DropdownSelectDup from '../extras/DropdownSelectDup';

class CandidatesContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="p-2">
                <div className="row">
                    test
                </div>
            </div>
        );
    }
}

CandidatesContent.propTypes = {};

export default withTracker(props => {

    return {

    };

})(CandidatesContent);
