import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { CategoriesDB } from '../../../api/categories';
import { CSVLink } from 'react-csv';
import { COUNTRIES } from '../../../api/classes/Const';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

class Graphs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobType: '0',
            processing: false,
            reports: [],
            headers: [],
            page: 0,
            startDate: moment().startOf('month').format('YYYY-MM'),
            csv: [],
            country: props.settings.country
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCountryChange = this.handleCountryChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
    }
    componentWillMount() {
        const script = document.createElement('script');
        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';
        script.async = true;
        document.body.appendChild(script);
    }
    componentDidMount() {
        this.loadReports(0);
    }
    handleInputChange(event, callback) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value }, () => {
                    if (callback)
                        callback();
                });
        }
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
    loadReports(type) {
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
        let graph14 = this.bgraph14;
        $(this.bgraph2).empty();
        $(this.bgraph3).empty();
        $(this.bgraph4).empty();
        $(this.bgraph5).empty();
        $(this.bgraph6).empty();
        $(this.bgraph7).empty();
        $(this.bgraph8).empty();
        $(this.bgraph9).empty();
        $(this.bgraph10).empty();
        $(this.bgraph11).empty();
        $(this.bgraph12).empty();
        $(this.bgraph13).empty();
        $(this.bgraph14).empty();
        this.setState({ processing: true });
        this.props.Statistics.getReports(type, this.state.startDate, this.state.country, (err, data) => {
            this.setState({ processing: false });
            let csv = [];
            this.props.Statistics.createBarGraph({
                element: graph2,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].post,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            let csvHeaders = ['Positions'];
            let csvBlank = ['-----'];
            let csvData = [];
            let csvPositions = Object.keys(data[0].post[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].post.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Job Ad Posts');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph3,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].new,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[0].new[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].new.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- New Candidates');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph4,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].pre,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[0].pre[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].pre.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Pre Qualified');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph5,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].int,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[0].int[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].int.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Interviewed');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph14,
                xkey: 'date',
                ykeys: ['METEOR_TEST', 'LIVE_TEST', 'GD_LIVE_TEST'],
                parseTime: false,
                labels: ['METEOR_TEST', 'LIVE_TEST', 'GD_LIVE_TEST'],
                data: data[0].adv,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            this.props.Statistics.createBarGraph({
                element: graph6,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].qua,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[0].qua[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].qua.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Qualified');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph7,
                xkey: 'date',
                ykeys: data[0].labels,
                parseTime: false,
                labels: data[0].labels,
                data: data[0].hired,
                barColors: function (row, series) {
                    if (data[0].colors[series.index])
                        return data[0].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[0].hired[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[0].hired.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Hired');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph8,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].post,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].post[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].post.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Job Ad Posts');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph9,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].new,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].new[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].new.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- New Candidates');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph10,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].pre,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].pre[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].pre.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Pre Qualified');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph11,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].int,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].int[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].int.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Interviewed');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph12,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].qua,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].qua[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].qua.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Qualified');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.props.Statistics.createBarGraph({
                element: graph13,
                xkey: 'date',
                ykeys: data[1].labels,
                parseTime: false,
                labels: data[1].labels,
                data: data[1].hired,
                barColors: function (row, series) {
                    if (data[1].colors[series.index])
                        return data[1].colors[series.index];
                    else
                        return '#cccccc';
                },
            });
            csvHeaders = ['Positions'];
            csvBlank = ['-----'];
            csvData = [];
            csvPositions = Object.keys(data[1].hired[0]);
            csvPositions.shift();
            csvPositions.forEach((position, i) => {
                csvData[i] = [position];
                data[1].hired.forEach((item, j) => {
                    if (i === 0) {
                        csvHeaders.push(item.date);
                        csvBlank.push('-----');
                    }
                    csvData[i][j + 1] = item[position];
                });
            });
            csvHeaders.push('|||---- Hired');
            csv.push(csvHeaders);
            csvData.forEach((obj) => {
                csv.push(obj);
            });
            csv.push(csvBlank);
            this.setState({ reports: data, headers: data[0].dates, csv }); // TODO data
        });
    }
    renderCountries() {
        return COUNTRIES.map((country, index) => {
            return (<option key={index} value={index}>{country.name}</option>);
        });
    }
    renderReport(type, row) {
        let property = '';
        switch (row) {
            case 0:
                property = 'post';
                break;
            case 1:
                property = 'new';
                break;
            case 2:
                property = 'pre';
                break;
            case 3:
                property = 'int';
                break;
            case 4:
                property = 'qua';
                break;
            case 5:
                property = 'hired';
                break;
            case 6:
                property = 'adv';
                break;
        }
        let data = this.state.reports[type][property];
        let positions = Object.keys(data[0]).filter((position) => { return position !== 'date' });
        let record = [];
        positions.forEach((position) => {
            let obj = { name: position };
            this.state.headers.forEach((header, index) => {
                let value = data[index][position];
                obj[header] = value;
            });
            record.push(obj);
        });
        return record.map((obj, index) => {
            return (
                <tr key={index}>
                    <th scope="row">{obj.name}</th>
                    {this.renderValues(obj)}
                </tr>
            );
        });
    }
    renderValues(data) {
        return this.state.headers.map((header, index) => {
            return (
                <td key={index}>
                    {data[header]}
                </td>
            );
        });
    }
    setPage(page) {
        if (!this.state.processing)
            this.setState({ page }, () => {
                this.loadReports(page);
            });
    }
    renderHeaders() {
        return this.state.headers.map((header, index) => {
            return (
                <th key={index}>{header}</th>
            );
        });
    }
    handleDateChange(e) {
        this.handleInputChange(e, () => {
            this.loadReports(3);
        });
    }
    handleCountryChange(e) {
        this.handleInputChange(e, () => {
            this.loadReports(this.state.page);
        });
    }
    render() {
        let title = '';
        let subtitle = '';
        switch (this.state.page) {
            case 0:
                title = 'End of Report';
                subtitle = moment().startOf('day').format('MMM DD, YYYY');
                break;
            case 1:
                title = 'DAILY STATS';
                subtitle = moment().startOf('day').format('MMM YYYY');
                break;
            case 2:
                title = 'DAILY STATS';
                subtitle = 'Week ' + moment().startOf('day').format('W - MMM DD, YYYY');
                break;
            case 3:
                title = 'Custom';
                subtitle = (
                    <div className="">
                        From: <input type="month" name="startDate" value={this.state.startDate} onChange={this.handleDateChange} disabled={this.state.processing} />
                    </div>
                )
                break;
        }
        return (
            <form className="pull-left main mt-3" onSubmit={this.loadGraph}>
                <div className="col-sm-12 p-2">
                    <div className="p-2">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a className={`nav-link ${!this.state.processing && 'text-primary'} ${this.state.page === 0 && 'active'}`} href="#eod" onClick={this.setPage.bind(this, 0)}>EOD</a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${!this.state.processing && 'text-primary'} ${this.state.page === 1 && 'active'}`} href="#monthly" onClick={this.setPage.bind(this, 1)}>Monthly</a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${!this.state.processing && 'text-primary'} ${this.state.page === 2 && 'active'}`} href="#weekly" onClick={this.setPage.bind(this, 2)}>Weekly</a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${!this.state.processing && 'text-primary'} ${this.state.page === 3 && 'active'}`} href="#custom" onClick={this.setPage.bind(this, 3)}>Custom</a>
                            </li>
                            <li className="nav-item ml-auto">
                                <CSVLink data={this.state.csv} filename={`hrapp-report-${moment().format("MM-DD-YYYY")}.csv`} className="nav-link text-primary false">Export to CSV</CSVLink>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="row p-2">
                                <div className="col-sm-12">
                                    {
                                        this.state.page != 3 &&
                                        <div className="col-sm-3">
                                            Country:
                                        <select
                                                value={this.state.country}
                                                name="country"
                                                className="mb-1 form-control"
                                                onChange={this.handleCountryChange}
                                                placeholder="Country"
                                                required
                                            >
                                                <option value={null} disabled>Select Country</option>
                                                {this.renderCountries()}
                                            </select><br />
                                        </div>
                                    }
                                    {!this.state.processing && <h5>Job Ad Posting</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 0)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-2" ref={instance => { this.bgraph2 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 0)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-8" ref={instance => { this.bgraph8 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="card-body bg-light">
                                        <h5 className="card-title">{title} - <span className="text-primary">TECHNICAL CANDIDATES</span></h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>
                                        <div className="card-text">
                                            {
                                                this.state.processing &&
                                                <div>
                                                    <i className="fa fa-spin fa-spinner" /> Loading...
                                            </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    {!this.state.processing && <h5>New Candidates</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 1)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-3" ref={instance => { this.bgraph3 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Prequalified</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 2)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-4" ref={instance => { this.bgraph4 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Advanced Test</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 6)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-14" ref={instance => { this.bgraph14 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Interviewed</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 3)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-5" ref={instance => { this.bgraph5 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Qualified</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 4)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-6" ref={instance => { this.bgraph6 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Hired</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(0, 5)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-7" ref={instance => { this.bgraph7 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="card-body bg-light">
                                        <h5 className="card-title">{title} - <span className="text-primary">NON-TECHNICAL CANDIDATES</span></h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>
                                        <div className="card-text">
                                            {
                                                this.state.processing &&
                                                <div>
                                                    <i className="fa fa-spin fa-spinner" /> Loading...
                                            </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    {!this.state.processing && <h5>New Candidates</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 1)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-9" ref={instance => { this.bgraph9 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Prequalified</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 2)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-10" ref={instance => { this.bgraph10 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Interviewed</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 3)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-11" ref={instance => { this.bgraph11 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Qualified</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 4)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-12" ref={instance => { this.bgraph12 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
                                        </div>
                                    </div>
                                    {!this.state.processing && <h5>Hired</h5>}
                                    {
                                        !this.state.processing && this.state.page != 0 &&
                                        <table className="table table-sm table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">Positions</th>
                                                    {this.renderHeaders()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderReport(1, 5)}
                                            </tbody>
                                        </table>
                                    }
                                    <div className="graph-container p-4">
                                        <div className="page-content">
                                            <div id="graph-13" ref={instance => { this.bgraph13 = instance }} style={{ height: this.state.processing ? '0' : '250px', width: '100%' }} />
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
