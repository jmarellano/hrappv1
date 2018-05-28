import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FormsDDB } from '../../../api/forms';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';

import FormDataClass from '../../../api/classes/FormData';
import FormDataTable from './FormDataTable';

class FormData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            template: {},
            remove: false,
            formDataId: null,
            headers: [],
            max: 0,
            version: 1,
            limit: 20
        };
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
        this.changeVersion = this.changeVersion.bind(this);
        this.viewMore = this.viewMore.bind(this);
    }

    componentDidMount() {
        this.getVersion();
    }

    getVersion() {
        this.props.Form.getHeaders(this.props.id, this.state.version.toString(), (err, data) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                this.setState({ headers: data.headers, max: data.max });
        });
    }

    componentDidUpdate() {
        $('td:empty').html('<span class="text-default">N/A<span>');
    }

    changeVersion(e) {
        this.setState({ version: e.target.value }, () => {
            this.getVersion();
        });
    }

    viewMore() {
        this.setState({ limit: this.state.limit + 20 });
    }

    renderVersion() {
        let options = [];
        for (let i = 0; i < this.state.max; i++) {
            options.push(<option key={i} value={i + 1}>Version {i + 1}</option>);
        }
        return options;
    }

    render() {
        return (
            <div>
                <h4 className="mb-4 container">
                    {this.state.name}
                </h4>
                <div className="container">
                    <select className="form-control col-sm-3 mb-1" onChange={this.changeVersion} value={this.state.version}>
                        <option value={0} disabled> Select Version</option>
                        {this.renderVersion()}
                    </select>
                </div>
                <FormDataTable {...this.props} headers={this.state.headers} version={this.state.version} viewMore={this.viewMore} limit={this.state.limit} />
            </div>
        )
    }
}
FormData.propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    Form: PropTypes.object,
    id: PropTypes.string
};
export default withTracker((props) => {
    const match = matchPath(props.location.pathname, {
        path: '/:component/:data',
        exact: false,
        strict: false
    });
    return {
        data: FormsDDB.find({}, { sort: { createdAt: -1 } }).fetch().map((formData) => new FormDataClass(formData)),
        id: match.params.data
    };
})(FormData);
