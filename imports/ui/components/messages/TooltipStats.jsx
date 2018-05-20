import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

export const TooltipStats = (props) => {
    let arr = [
        { name: 'resume', sub: false, base: 'resume' },
        { name: 'portfolio', sub: false, base: 'portfolio' },
        { name: 'disc', sub: false, base: 'disc' },
        { name: 'values', sub: false, base: 'values' },
        { name: 'iq', sub: false, base: 'iq' },
        { name: 'TEST_METEOR', sub: false, base: 'TEST_METEOR' },
        { name: 'TEST_LIVE', sub: false, base: 'TEST_LIVE' },
        { name: 'TEST_WRITING', sub: false, base: 'TEST_WRITING' },
        { name: 'VIDEO', sub: false, base: 'VIDEO' },
        { name: 'INTERVIEW', sub: false, base: 'INTERVIEW' },
        { name: 'MANAGER', sub: false, base: 'MANAGER' },
        { name: 'TEST_IMAGE', sub: false, base: 'TEST_IMAGE' },
        { name: 'TEST_CREATIVE', sub: false, base: 'TEST_CREATIVE' },
        { name: 'TEST_WEBFLOW', sub: false, base: 'TEST_WEBFLOW' },
        { name: 'TEST_MOCK', sub: false, base: 'TEST_MOCK' },
        { name: 'TEST_SIMULATION', sub: false, base: 'TEST_SIMULATION' },
        { name: 'others', sub: false, base: 'others' },
    ];
    return (
        <table>
            <thead>
                <tr>
                    <th>
                        Stat
                </th>
                    <th>
                        Score / Status
                </th>
                </tr>
            </thead>
            <tbody>
                {
                    arr.map((item, index) => {
                        if (!props.candidate[item.name])
                            return null;
                        return (
                            <tr key={index}>
                                <td>
                                    {item.name}
                                </td>
                                <td className="text-center">
                                    {props.candidate[item.name]}
                                </td>
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
    );
};

TooltipStats.propTypes = {
    candidate: PropTypes.object.isRequired,
};

export default withTracker(() => {
    return {
    };
})(TooltipStats);