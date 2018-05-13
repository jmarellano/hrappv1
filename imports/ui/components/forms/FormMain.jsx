import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Forms from './Forms';

class FormMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20
        };
        this.viewMore = this.viewMore.bind(this);
    }

    viewMore() {
        let limit = this.state.limit;
        this.setState({ limit: limit + 20 });
    }

    render() {
        return (
            <Forms {...this.props} limit={this.state.limit} viewMore={this.viewMore} />
        );
    }
}

FormMain.propTypes = {};

export default withTracker(() => {
    return {};
})(FormMain);
