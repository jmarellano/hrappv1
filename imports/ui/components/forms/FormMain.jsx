import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import Forms from './Forms';

class FormMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20,
            search: '',
            searchForm: {
                search: '',
                limit: 20
            },
        };
        this.viewMore = this.viewMore.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.searchForm = this.searchForm.bind(this);
    }

    changeSearch(e) {
        this.setState({ search: e.target.value });
    }
    searchForm(e) {
        if (e)
            e.preventDefault();
        this.setState({
            searchForm: {
                search: this.state.search,
                limit: this.state.limit
            }
        });
    }

    viewMore() {
        let limit = this.state.limit;
        this.setState({ limit: limit + 20 });
    }

    render() {
        return (
            <Forms {...this.props} limit={this.state.limit} viewMore={this.viewMore} search={this.state.search} changeSearch={this.changeSearch} searchForm={this.searchForm} form={this.state.searchForm} />
        );
    }
}

FormMain.propTypes = {};

export default withTracker(() => {
    return {};
})(FormMain);
