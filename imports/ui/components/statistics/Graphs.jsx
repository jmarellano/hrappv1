import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { CategoriesDB } from '../../../api/categories';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Select from 'react-select';
import moment from 'moment-timezone';

class Graphs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            graphLoaded: false,
            loading: false,
            id: '',
            fromRange: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            toRange: moment().format('YYYY-MM-DD'),
            jobType: '0',
            processing: false,
            reports: [[], []]
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
    componentDidMount() {
        this.loadReports();
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
    loadReports() {
        let graph = this.bgraph2;
        this.setState({ processing: true });
        this.props.Statistics.getReports((err, data) => {
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
            this.props.Statistics.createBarGraph({
                element: graph,
                xkey: 'y',
                ykeys: ['a', 'b'],
                parseTime: false,
                labels: labels,
                data: [{ "y": "Jun 2018", "a": 6, "b": 10 }]
            });
            this.props.Statistics.setData([{ "y": "Jun 2018", "a": 6, "b": 10 }]);
            this.setState({ processing: false, reports: data });
        });
    }
    renderFirstReport() {
        return this.state.reports[0].map((row, index) => {
            return (
                <tr key={index}>
                    <th scope="row">{row.post}</th>
                    <td>{row.jobPosts}</td>
                    <td>{row.new}</td>
                    <td>{row.percentage.toFixed(2)}%</td>
                </tr>
            );
        });
    }
    renderSecondReport() {
        return this.state.reports[1].map((row, index) => {
            return (
                <tr key={index}>
                    <th scope="row">{row.post}</th>
                    <td>{row.new}</td>
                    <td>{row.preQualified}</td>
                    <td>{row.interviewed}</td>
                    <td>{row.qualified}</td>
                    <td>{row.hired}</td>
                </tr>
            );
        });
    }
    render() {
        return (
            <form className="pull-left main mt-3" onSubmit={this.loadGraph}>
                <div className="col-sm-12 p-2">
                    <div className="row p-2 pl-3">
                        <div className="card col-sm-12">
                            <div className="card-body">
                                <h5 className="card-title">Job Postings</h5>
                                <div className="row col-sm-12 graph-menu">
                                    <div className="col-sm-3">
                                        <label className="col-sm-3 control-label">From</label>
                                        <div className="col-sm-9">
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="fromRange"
                                                value={this.state.fromRange}
                                                required
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <label className="col-sm-3 control-label">To</label>
                                        <div className="col-sm-9">
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="toRange"
                                                value={this.state.toRange}
                                                required
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <label className="col-sm-5 control-label">Category</label>
                                        <div className="col-sm-7">
                                            <select
                                                className="form-control mb"
                                                name="jobType"
                                                value={this.state.jobType}
                                                required
                                                onChange={this.handleInputChange}>
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
                                                options={[{ value: '', label: 'All' }, ...this.activeUsers()]}
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
                            </div>
                        </div>
                        <div className="card col-sm-6">
                            <div className="card-body">
                                <h5 className="card-title">LAST MONTH REPORT</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{moment().subtract(1, 'month').add(1, 'day').format('MMM YYYY')}</h6>
                                <div className="card-text">
                                    {
                                        this.state.processing &&
                                        <div>
                                            <i className="fa fa-spin fa-spinner" /> Loading...
                                        </div>
                                    }
                                    {
                                        !this.state.processing &&
                                        <table className="table table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Post</th>
                                                    <th scope="col">Job Postings</th>
                                                    <th scope="col">New Applicants</th>
                                                    <th scope="col">% of New applicants</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderFirstReport()}
                                            </tbody>
                                        </table>
                                    }
                                    <br />
                                    {
                                        !this.state.processing &&
                                        <table className="table table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Post</th>
                                                    <th scope="col">New applicants</th>
                                                    <th scope="col">Pre Qualified</th>
                                                    <th scope="col">Interviewed</th>
                                                    <th scope="col">Qualified</th>
                                                    <th scope="col">Hired</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderSecondReport()}
                                            </tbody>
                                        </table>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="card col-sm-6">
                            <div className="card-body">
                                <h5 className="card-title">LAST DAY REPORT</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{moment().subtract(1, 'day').format('MMM DD, YYYY')}</h6>
                                <div className="card-text">
                                    {
                                        this.state.processing &&
                                        <div>
                                            <i className="fa fa-spin fa-spinner" /> Loading...
                                        </div>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="wakandaporebrer" ref={instance => { this.bgraph2 = instance }} style={{ height: '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item))
    };
})(Graphs);
