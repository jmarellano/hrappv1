import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

class ItemEllipsis extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false
        };
        this.toggleOpen = this.toggleOpen.bind(this);
    }
    componentDidMount() {
        $(`.custom-menu-${this.props.index}`).hide(100);
        $(document).bind('mousedown', function (e) {
            if (!$(e.target).parents('.custom-menu').length > 0) {
                $('.custom-menu').hide(100);
            }
        });
    }
    toggleOpen(e) {
        $(`.custom-menu-${this.props.index}`).finish().toggle(100).css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });
    }
    renderOptions() {
        return this.props.children.map((option, index) => {
            return (
                <li key={index}>{option}</li>
            );
        });
    }
    render() {
        return (
            <span>
                <a href="#" className='btn btn-sm m-1 btn-default text-secondary' data-tip="More Options" onClick={this.toggleOpen}>
                    <i className="fa fa-2x fa-ellipsis-v" />
                </a>
                <ul className={`custom-menu custom-menu-${this.props.index}`}>
                    {this.renderOptions()}
                </ul>
                <ReactTooltip />
            </span>
        );
    }
}
ItemEllipsis.propTypes = {
    children: PropTypes.array,
    index: PropTypes.number
};
export default withTracker(() => {
    return {};
})(ItemEllipsis);