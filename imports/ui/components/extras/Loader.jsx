import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
//import { BarLoader } from 'react-spinners';

class Loader extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        if (!this.props.visible)
            return null;
        let className = ['loader-wrapper', 'loader', 'loader-text'];
        if (this.props.large)
            className = ['loader-wrapper-lg', 'loader-lg', 'loader-text-lg'];
        return (
            <div className={className[0]}>
                <div className={className[1]} />
                <div className={className[2]}>
                    {this.props.children || 'Loading...'}
                </div>
            </div>
        );
    }
}
Loader.propTypes = {
    children: PropTypes.any,
    large: PropTypes.bool,
    visible: PropTypes.bool,
};
export default withTracker(() => {
    return {};
})(Loader);