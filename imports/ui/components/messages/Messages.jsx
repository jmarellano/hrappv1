import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ROUTES } from '../../../api/classes/Const';
import Button from '../extras/Button';

class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className="pull-left main">
                test
            </div>
        );
    }
}

Messages.propTypes = {};

export default withTracker(props => {

    return {

    };

})(Messages);
