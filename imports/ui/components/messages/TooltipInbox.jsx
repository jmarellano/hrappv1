import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { SEARCH } from '../../../api/classes/Const';
import PropTypes from 'prop-types';

class TooltipInbox extends React.Component {
    renderValue() {
        return [
            { value: SEARCH.CATEGORIES, label: 'Category', type: 'TEXT' },
            { value: SEARCH.CLAIMER, label: 'Claimer', type: 'TEXT' },
            { value: SEARCH.EMAIL, label: 'Email', type: 'TEXT' },
            { value: SEARCH.NUMBER, label: 'Mobile', type: 'TEXT' },
            { value: SEARCH.NAME, label: 'Name', type: 'TEXT' },
            { value: SEARCH.ASSIGNED, label: 'Assigned', type: 'STATUS' },
            { value: SEARCH.CLAIMED, label: 'Claimed', type: 'STATUS' },
            { value: SEARCH.FOLLOWING, label: 'Following', type: 'STATUS' },
            { value: SEARCH.UNCLAIMED, label: 'Unclaim', type: 'STATUS' },
            { value: SEARCH.resume, label: 'resume', type: 'STATS' },
            { value: SEARCH.portfolio, label: 'portfolio', type: 'STATS' },
            { value: SEARCH.disc, label: 'disc', type: 'STATS' },
            { value: SEARCH.values, label: 'values', type: 'STATS' },
            { value: SEARCH.iq, label: 'iq', type: 'STATS' },
            { value: SEARCH.TEST_METEOR, label: 'TEST_METEOR', type: 'STATS' },
            { value: SEARCH.TEST_LIVE, label: 'TEST_LIVE', type: 'STATS' },
            { value: SEARCH.TEST_WRITING, label: 'TEST_WRITING', type: 'STATS' },
            { value: SEARCH.VIDEO, label: 'VIDEO', type: 'STATS' },
            { value: SEARCH.INTERVIEW, label: 'INTERVIEW', type: 'STATS' },
            { value: SEARCH.MANAGER, label: 'MANAGER', type: 'STATS' },
            { value: SEARCH.TEST_IMAGE, label: 'TEST_IMAGE', type: 'STATS' },
            { value: SEARCH.TEST_CREATIVE, label: 'TEST_CREATIVE', type: 'STATS' },
            { value: SEARCH.TEST_WEBFLOW, label: 'TEST_WEBFLOW', type: 'STATS' },
            { value: SEARCH.TEST_MOCK, label: 'TEST_MOCK', type: 'STATS' },
            { value: SEARCH.TEST_SIMULATION, label: 'TEST_SIMULATION', type: 'STATS' },
            { value: SEARCH.others, label: 'others', type: 'STATS' }
        ].filter((item) => {
            return this.props.value.indexOf(item.value) > -1;
        });
    }
    render() {
        let arr = this.renderValue();
        return (
            <table>
                <thead>
                    <tr>
                        <th>
                            Selected Options
                        </th>
                        <th>
                            Type
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        arr.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        {item.label}
                                    </td>
                                    <td>
                                        {item.type}
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        );
    }
}

TooltipInbox.propTypes = {
    value: PropTypes.array
};

export default withTracker(() => {
    return {
    };
})(TooltipInbox);