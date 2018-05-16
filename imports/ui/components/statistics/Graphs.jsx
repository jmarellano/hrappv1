import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { CategoriesDB } from '../../../api/categories';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Select from 'react-select';
import moment from 'moment';

class Graphs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            graphLoaded: false,
            loading: false,
            id: props.user.id,
            fromRange: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            toRange: moment().format('YYYY-MM-DD'),
            jobType: '0'
        };
        this.loadGraph = this.loadGraph.bind(this);
        this.display = this.display.bind(this);
        this.handleAgentChange = this.handleAgentChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    componentWillMount() {
        const script = document.createElement('script');
        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';
        script.async = true;
        document.body.appendChild(script);
    }
    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }
    handleAgentChange(id) {
        this.setState({ id: id.value });
    }
    loadGraph(e) {
        e.preventDefault();
        let data = {
            category: this.state.jobType
        };
        if (this.state.fromRange.trim() && this.state.toRange.trim()) {
            data.range = {
                from: moment(new Date(this.state.fromRange.trim() + ' 00:00:00 AM')).valueOf(),
                to: moment(new Date(this.state.toRange.trim() + ' 11:59:00 PM')).valueOf()
            };
        } else {
            data.range = {
                from: moment().valueOf(),
                to: moment().add(1, 'month').valueOf()
            };
        }
        if (data.range.from > data.range.to) {
            this.setState({ processing: false });
            return Bert.alert('Invalid date range!', 'danger', 'growl-top-right');
        }
        data.agentId = this.state.id;
        this.setState({ graphLoaded: true, loading: true }, () => {
            $(this.bgraph).empty();
            let keys = [], labels = [];
            this.props.categories.map((item) => {
                if (this.state.jobType === '0') {
                    keys.push(item.id._str);
                    labels.push(item.category);
                } else if (this.state.jobType === item.id._str) {
                    keys.push(item.id._str);
                    labels.push(item.category);
                }
            });
            this.props.Statistics.barChart = null;
            this.props.Statistics.createLineGraph({
                element: this.bgraph,
                xkey: 'date',
                ykeys: keys,
                parseTime: false,
                labels: labels
            });
            this.props.Statistics.getDataFromServer(data, this.display());
        });

    }
    display() {
        this.setState({ loading: false });
    }
    renderCategories() {
        return this.props.categories.map((item, index) => {
            return (
                <option value={item.id._str} key={index}>{item.category}</option>
            )
        });
    }
    activeUsers() {
        return this.props.users.map((agent) => {
            return { value: agent.id, label: agent.username };
        });
    }
    render() {
        return (
            <form className="pull-left main mt-3" onSubmit={this.loadGraph}>
                <div className="row col-sm-12 graph-menu">
                    <div className="col-sm-3">
                        <label className="col-sm-3 control-label">From</label>
                        <div className="col-sm-9"><input type="date" className="form-control" name="fromRange" value={this.state.fromRange} required onChange={this.handleInputChange} /></div>
                    </div>
                    <div className="col-sm-3">
                        <label className="col-sm-3 control-label">To</label>
                        <div className="col-sm-9"><input type="date" className="form-control" name="toRange" value={this.state.toRange} required onChange={this.handleInputChange} /></div>
                    </div>
                    <div className="col-sm-3">
                        <label className="col-sm-5 control-label">Category</label>
                        <div className="col-sm-7">
                            <select className="form-control mb" name="jobType" value={this.state.jobType} required onChange={this.handleInputChange}>
                                <option value="0">All</option>
                                {this.renderCategories()}
                            </select>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <label className="col-sm-5 control-label">Agent</label>
                        <div className="col-sm-7">
                            <Select
                                className="mb"
                                name="form-field-name"
                                value={this.state.id.value}
                                onChange={this.handleAgentChange}
                                options={this.activeUsers()}
                            />
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-sm-12">
                        <Button className="btn btn-default ml-4" type="submit" processing={this.state.processing}>Load Data</Button>
                    </div>
                </div>
                {
                    this.state.loading &&
                    <h2 className="text-center">
                        <i className="fa fa-spin fa-circle-o-notch" /> Loading...
                    </h2>
                }
                {
                    this.state.graphLoaded &&
                    <div className="graph-container p-4">
                        <div className="caption">Job Postings</div>
                        <div className="page-content">
                            <div ref={instance => { this.bgraph = instance }} style={{ height: '250px' }} />
                        </div>
                    </div>
                }
            </form>
        )
    }
}

Graphs.propTypes = {
    user: PropTypes.object,
    categories: PropTypes.array,
    Statistics: PropTypes.object,
    users: PropTypes.array
};

export default withTracker(() => {
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item)),
    };
})(Graphs);
