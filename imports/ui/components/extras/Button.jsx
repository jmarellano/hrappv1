import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

class Button extends React.Component {
    constructor() {
        super();
        this.state = {
            processing: false,
        };
    }
    onClick(e) {
        e.preventDefault();
        if (this.props.onClick) {
            this.setState({ processing: true }, () => {
                if (this.props.data)
                    this.props.onClick(this.props.data, () => { this.setState({ processing: false }) });
                else
                    this.props.onClick(() => { this.setState({ processing: false }) });
            });
        }
    }
    render() {
        let processing = this.props.processing || this.state.processing,
            name = this.props.name || '',
            type = this.props.type || 'button',
            className = this.props.className || '';
        return (
            <button
                name={name}
                type={type}
                className={className}
                onClick={type !== 'submit' ? this.onClick.bind(this) : null}
                disabled={this.props.disabled || processing}
            >
                {!processing ? this.props.children : <i className="fa fa-spin fa-circle-o-notch" />}
            </button>
        );
    }
}
Button.propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    state: PropTypes.number,
    onClick: PropTypes.func,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};
export default withTracker(() => {
    return {};
})(Button);