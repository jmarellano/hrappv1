import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

class Link extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        let data = this.props.defaultImage || '';
        return (
            <a
                href={new RegExp(/(http(s?))\:\/\//gi).test(this.props.href) ? this.props.href : 'http://' + this.props.href || '#'}
                className={this.props.className || ''}
                onClick={this.props.onClick}
                disabled={this.props.disabled || this.state.processing}
                target={this.props.target || ''}
            >
                <div className='mb-2 bg-light link-preview-wrapper' style={{ backgroundImage: `url(${data})` }}>
                    <div className='link-preview-tint text-center'>
                        {!data.length ? <i className='fa m-3 text-secondary fa-spin fa-circle-o-notch' /> : null}
                    </div>
                    <small className='p-1 m-1 text-white link-preview-title'><i className='fa fa-link' /> {this.props.children}</small>
                </div>
            </a>
        );
    }
}
Link.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.any.isRequired,
    href: PropTypes.string,
    target: PropTypes.string,
    defaultImage: PropTypes.string
};
export default withTracker(() => {
    return {};
})(Link);