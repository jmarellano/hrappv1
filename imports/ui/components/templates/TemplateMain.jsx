import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import Templates from './Templates';

class TemplateMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20,
            search: '',
            searchTemplate: {
                search: '',
                limit: 20
            },
        };
        this.viewMore = this.viewMore.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.searchTemplate = this.searchTemplate.bind(this);
    }

    changeSearch(e) {
        this.setState({ search: e.target.value });
    }
    searchTemplate(e) {
        if (e)
            e.preventDefault();
        this.setState({
            searchTemplate: {
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
            <Templates
                {...this.props}
                limit={this.state.limit}
                viewMore={this.viewMore}
                search={this.state.search}
                changeSearch={this.changeSearch}
                searchTemplate={this.searchTemplate}
                template={this.state.searchTemplate}
            />
        );
    }
}

TemplateMain.propTypes = {};

export default withTracker(() => {
    return {};
})(TemplateMain);
