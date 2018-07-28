import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FormsDPub, FormsDPub2 } from '../../../api/forms';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';

class FormDataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderHeader() {
        if (!this.props.headers)
            return null;
        return this.props.headers.map((item, index) => {
            return (
                <th key={index} scope="col">{item}</th>
            );
        });
    }

    renderDataValues(data) {
        if (!this.props.headers)
            return null;
        return this.props.headers.map((item, index) => {
            let itemValue = data.data.filter((dataItem) => dataItem.label === item)[0];
            return (
                <td key={index}>
                    {itemValue ? data.data.filter((dataItem) => dataItem.label === item)[0].val : 'N/A'}
                </td>
            );
        });
    }

    renderData() {
        return this.props.data.map((item, index) => {
            return (
                <tr key={index}>
                    <td scope="row">
                        {index + 1}
                    </td>
                    <td scope="row">
                        {item.getDate()}
                    </td>
                    <td scope="row">
                        {item.getTime()}
                    </td>
                    <td scope="row">
                        {item.getApplicant()}
                    </td>
                    {this.renderDataValues(item)}
                </tr>
            );
        });
    }

    renderTable() {
        return (
            <table className="table table-responsive">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">Applicant</th>
                        {this.renderHeader()}
                    </tr>
                </thead>
                <tbody>
                    {this.renderData()}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div>
                <div className="container">
                    {this.renderTable()}
                </div>
                <div className="container">
                    {this.props.loading && <div><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div>}
                </div>
                <div className="container">
                    {
                        !this.props.loading && this.props.data.length && this.props.data[0].max > this.props.data.length ?
                            <button className="btn btn-success" onClick={this.props.viewMore}>View More</button> : null
                    }
                </div>
            </div>
        )
    }
}
FormDataTable.propTypes = {
    loading: PropTypes.bool,
    headers: PropTypes.array,
    data: PropTypes.array,
    viewMore: PropTypes.func
};
export default withTracker((props) => {
    const match = matchPath(props.location.pathname, {
        path: '/:component/:data',
        exact: false,
        strict: false
    });
    let loading = true,
        formDSub = Meteor.subscribe(FormsDPub, { form_id: match.params.data, version: props.version }, props.limit),
        formDSub2 = Meteor.subscribe(FormsDPub2, { form_id: match.params.data, version: props.version }, props.limit);
    if (formDSub.ready() && formDSub2.ready())
        loading = false;
    return {
        loading,
    };
})(FormDataTable);
