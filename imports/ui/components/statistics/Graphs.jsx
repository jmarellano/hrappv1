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
        let graph2 = this.bgraph2;
        let graph3 = this.bgraph3;
        let graph4 = this.bgraph4;
        let graph5 = this.bgraph5;
        let graph6 = this.bgraph6;
        let graph7 = this.bgraph7;
        let graph8 = this.bgraph8;
        let graph9 = this.bgraph9;
        let graph10 = this.bgraph10;
        let graph11 = this.bgraph11;
        let graph12 = this.bgraph12;
        let graph13 = this.bgraph13;
        this.setState({ processing: true });
        this.props.Statistics.getReports((err, data) => {
            this.setState({ processing: false });
            this.props.Statistics.createBarGraph({
                element: graph2,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].post
            });
            this.props.Statistics.createBarGraph({
                element: graph3,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].new
            });
            this.props.Statistics.createBarGraph({
                element: graph4,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].pre
            });
            this.props.Statistics.createBarGraph({
                element: graph5,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].int
            });
            this.props.Statistics.createBarGraph({
                element: graph6,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].qua
            });
            this.props.Statistics.createBarGraph({
                element: graph7,
                xkey: 'date',
                ykeys: data[2].labels,
                parseTime: false,
                labels: data[2].labels,
                data: data[2].hired
            });
            this.props.Statistics.createBarGraph({
                element: graph8,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].post
            });
            this.props.Statistics.createBarGraph({
                element: graph9,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].new
            });
            this.props.Statistics.createBarGraph({
                element: graph10,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].pre
            });
            this.props.Statistics.createBarGraph({
                element: graph11,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].int
            });
            this.props.Statistics.createBarGraph({
                element: graph12,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].qua
            });
            this.props.Statistics.createBarGraph({
                element: graph13,
                xkey: 'date',
                ykeys: data[3].labels,
                parseTime: false,
                labels: data[3].labels,
                data: data[3].hired
            });
            this.setState({ reports: data });
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
                        <div className="card col-sm-6">
                            <div className="card-body">
                                <h5 className="card-title">END OF DAY REPORT - <span className="text-primary">TECHNICAL CANDIDATES</span></h5>
                                <h6 className="card-subtitle mb-2 text-muted">{moment().subtract(1, 'day').format('MMM DD, YYYY')}</h6>
                                <div className="card-text">
                                    {
                                        this.state.processing &&
                                        <div>
                                            <i className="fa fa-spin fa-spinner" /> Loading...
                                        </div>
                                    }
                                    {!this.state.processing && <h5>Job Ad Posting</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-2" ref={instance => { this.bgraph2 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>New Candidates</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-3" ref={instance => { this.bgraph3 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Prequalified</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-4" ref={instance => { this.bgraph4 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Interviewed</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-5" ref={instance => { this.bgraph5 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Qualified</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-6" ref={instance => { this.bgraph6 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Hired</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-7" ref={instance => { this.bgraph7 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    <br />
                                </div>
                            </div>
                        </div>
                        <div className="card col-sm-6">
                            <div className="card-body">
                                <h5 className="card-title">END OF DAY REPORT - <span className="text-primary">NON-TECHNICAL CANDIDATES</span></h5>
                                <h6 className="card-subtitle mb-2 text-muted">{moment().subtract(1, 'day').format('MMM DD, YYYY')}</h6>
                                <div className="card-text">
                                    {
                                        this.state.processing &&
                                        <div>
                                            <i className="fa fa-spin fa-spinner" /> Loading...
                                        </div>
                                    }
                                    {!this.state.processing && <h5>Job Ad Posting</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-8" ref={instance => { this.bgraph8 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>New Candidates</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-9" ref={instance => { this.bgraph9 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Prequalified</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-10" ref={instance => { this.bgraph10 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Interviewed</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-11" ref={instance => { this.bgraph11 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Qualified</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-12" ref={instance => { this.bgraph12 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Hired</h5>}
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-13" ref={instance => { this.bgraph13 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    <br />
                                </div>
                            </div>
                        </div>
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
