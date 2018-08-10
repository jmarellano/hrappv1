import React, { Component } from 'react';
import { ValidCategories, CategoriesDB } from '../../../api/categories';
import { PostPub, PostingDB, PostingSitesPub, PostingSitesDB } from '../../../api/settings';
import { isPermitted, ROLES, COUNTRIES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import ReactTooltip from 'react-tooltip';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import moment from 'moment-timezone';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class Record extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            modal2Open: false,
            processing: false,
            jobPost: {},
            newSite: null,
            datePosted: moment().format('YYYY-MM-DD'),
            timePosted: moment().format('hh:mm:ss A'),
            jobType: '',
            jobCountry: props.settings.country
        };
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '1200px',
                width: 'auto',
                height: 'auto',
                maxHeight: '1200px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.styleSet2 = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '450px',
                width: 'auto',
                height: 'auto',
                maxHeight: '200px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.saveRecord = this.saveRecord.bind(this);
        this.saveSite = this.saveSite.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.toggleModal2 = this.toggleModal2.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleSiteChange = this.handleSiteChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.resetState = this.resetState.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.handleJobCountryInput = this.handleJobCountryInput.bind(this);
        this.handleJobCategoryInput = this.handleJobCategoryInput.bind(this);
        this.handleJobLinkInput = this.handleJobLinkInput.bind(this);
        this.saveAll = this.saveAll.bind(this);
        this.jobCategory = this.jobCategory.bind(this);
        this.jobCountry = this.jobCountry.bind(this);
        this.jobLink = this.jobLink.bind(this);
        this.resetField = this.resetField.bind(this);
        this.saveOneBtn = this.saveOneBtn.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    handleSiteChange(selected) {
        this.setState({ site: selected.value });
    }

    resetState(e) {
        e.preventDefault();
        this.setState({
            site: "",
            link: "",
            jobType: "",
            selectedJobPost: null
        });
    }

    deletePost(e) {
        e.preventDefault();
        let deletePost = confirm("Are you sure to delete this post?");
        if (deletePost) {
            this.props.Statistics.deletePosting(this.state.selectedJobPost, (err) => {
                if (err)
                    Bert.alert(err.reason, 'danger', 'growl-top-right');
            });
        }
    }

    saveRecord(e) {
        e.preventDefault();
        let data = {};
        if (!this.state.jobType.length) {
            Bert.alert('Please select a job category.', 'danger', 'growl-top-right');
            return;
        }
        data.site = this.state.site.trim();
        data.link = this.state.link.trim();
        data.timestamp = moment().valueOf();
        data.category = this.state.jobType;
        data.country = this.state.jobCountry;
        data.selectedJobPost = this.state.selectedJobPost;
        this.setState({ processing: true });
        this.props.Statistics.recordPosting(data, false, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('New Job posting has recorded', 'success', 'growl-top-right');
            this.setState({
                processing: false,
                site: '',
                link: '',
                jobType: '',
                datePosted: '',
                timePosted: '',
                selectedJobPost: null,
                jobCountry: this.props.settings.country
            });
        });
    }

    saveSite() {
        if (!this.state.newSite) {
            Bert.alert('Please Enter Site First.', 'danger', 'growl-top-right');
            return;
        }

        this.setState({ processing: true });
        this.props.Statistics.addSite(this.state.newSite);
        this.setState({
            newSite: null,
            modal2Open: false,
        });
        Bert.alert('New Job posting site added', 'success', 'growl-top-right');
    }

    renderCategories() {
        return this.props.categories.map((item, index) => {
            return (
                <option value={item.id._str} key={index}>{item.category}</option>
            )
        });
    }

    toggleModal() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    toggleModal2() {
        this.setState({ modal2Open: !this.state.modal2Open });
    }

    renderJobOptions() {
        return this.props.postingSites.map((item, index) => {
            return (
                <option value={item.site} key={index}>{item.site}</option>
            )
        })
    }

    selectJobPost(jobPost) {
        this.setState({
            site: jobPost.site,
            link: jobPost.url,
            jobType: jobPost.category._str,
            selectedJobPost: jobPost._id,
            jobCountry: jobPost.country
        });
    }

    handleJobCategoryInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            let temp = this.state.jobPost;
            let d_ = this.state.jobPost[target.name];
            if (!d_) {
                d_ = { category: value };
            } else {
                d_.category = value;
            }
            temp[target.name] = d_;
            if (this.setState)
                this.setState({ jobPost: temp });
        }
    }
    handleJobCountryInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            let temp = this.state.jobPost;
            let d_ = this.state.jobPost[target.name];
            if (!d_) {
                d_ = { country: value };
            } else {
                d_.country = value;
            }
            temp[target.name] = d_;
            if (this.setState)
                this.setState({ jobPost: temp });
        }
    }
    handleJobLinkInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            let temp = this.state.jobPost;
            let d_ = this.state.jobPost[target.name];
            if (!d_) {
                d_ = { link: value };
            } else {
                d_.link = value;
            }
            temp[target.name] = d_;
            this.setState({ jobPost: temp });
        }
    }

    renderJobPost() {
        let jobPost = this.props.posts || [];
        return jobPost.map((post, index) => {
            let addedBy = db["#users"].findOne({ _id: post.postedBy });
            return (
                <li key={index} className="list-group-item">
                    <small style={{ cursor: "pointer" }} onClick={this.selectJobPost.bind(this, post)}>
                        {post.url}
                        <br />
                        <i className="fa fa-calendar" /> {moment(post.timestamp).format("MM/DD/YYYY HH:mm:ss A")}
                    </small>
                    <small className="text-danger" style={{ float: "right" }}>{`Added By: ${addedBy ? addedBy.username : 'N\\A'}`}</small>
                </li>
            );
        });
    }

    jobLink(cell, jobPost) {
        let link = this.state.jobPost[jobPost.site] ? this.state.jobPost[jobPost.site].link : '';
        return (
            <input
                type="text"
                className="form-control"
                name={jobPost.site}
                value={link}
                onChange={this.handleJobLinkInput}
                required
            />
        )
    }

    jobCategory(cell, jobPost) {
        let category = this.state.jobPost[jobPost.site] ? this.state.jobPost[jobPost.site].category : '';
        return (
            <select
                key={'wakanda01'}
                className="form-control mb-1"
                name={jobPost.site}
                value={category}
                onChange={this.handleJobCategoryInput}
                required
            >
                <option value={''}>Select Category</option>
                {this.renderCategories()}
            </select>
        )
    }

    jobCountry(cell, jobPost) {
        let country = this.state.jobPost[jobPost.site] ? this.state.jobPost[jobPost.site].country : this.props.settings.country;
        return (
            <select
                key={'wakanda02'}
                className="form-control mb-1"
                name={jobPost.site}
                value={country}
                onChange={this.handleJobCountryInput}
                required
            >
                <option value={''}>Select Country</option>
                {this.renderCountries()}
            </select>
        )
    }

    resetField(cell, jobPost) {
        return (
            <button className="btn btn-xs btn-warning btn-icon mt10 ml10"
                onClick={this.resetSelectedField.bind(this, jobPost.site)} key={'wakanda02'}>
                Reset
            </button>
        );
    }

    resetSelectedField(site) {
        if (site) {
            let data_ = this.state.jobPost;
            data_[site] = {
                category: '',
                country: '',
                link: ''
            };
            this.setState({
                jobPost: data_
            });
        }
    }

    saveAll() {
        this.setState({ processing: true });
        let states = this.state;
        states.selectedJobPost = null;
        this.props.Statistics.recordPosting(this.state, true);
        this.setState({
            processing: false,
            site: '',
            link: '',
            jobType: '',
            datePosted: '',
            timePosted: '',
            selectedJobPost: null,
            jobCountry: this.props.settings.country
        });
        Bert.alert('Valid Job Posting Recorded', 'success', 'growl-top-right');
    }

    saveOne(site) {
        if (!site)
            return;
        let data_ = this.state.jobPost[site];
        if (!data_.category) {
            Bert.alert('Please select a job category.', 'danger', 'growl-top-right');
            return;
        }
        let data = {};
        data.site = site;
        data.link = data_.link;
        data.timestamp = moment().valueOf();
        data.category = data_.category;
        data.country = data_.country;
        data.selectedJobPost = null;
        this.setState({ processing: true });
        this.props.Statistics.recordPosting(data, false);
        this.setState({
            processing: false,
            site: '',
            link: '',
            jobType: '',
            datePosted: '',
            timePosted: '',
            selectedJobPost: null,
            jobCountry: this.props.settings.country
        });
        Bert.alert('New Job posting has recorded', 'success', 'growl-top-right');
    }

    saveOneBtn(cell, jobPost) {
        return (
            <button className="btn btn-xs btn-success btn-icon mt10 ml10"
                onClick={this.saveOne.bind(this, jobPost.site)} key={'wakanda02'}>
                Save
            </button>
        );
    }

    renderCountries() {
        return COUNTRIES.map((country, index) => {
            return (<option key={index} value={index}>{country.name}</option>);
        });
    }

    render() {
        return (
            <div>
                <a className="nav-link" data-tip="Record Job Posting" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-edit" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.isOpen} onRequestClose={this.toggleModal} contentLabel="RecordStatModal" style={this.styleSet} >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Record Job Posting
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <div className="col-md-12 row">
                                <div className="table-responsive text-center" ref={(el) => {
                                    this.topDiv = el;
                                }}>
                                    <button className="btn btn-xs btn-success btn-icon mt10 ml10"
                                        style={{ margin: "10px" }} onClick={this.toggleModal2} data-tip="Add New Site">
                                        <i className="fa fa-plus" />
                                    </button>
                                    <button className="btn btn-xs btn-info btn-icon mt10 ml10"
                                        style={{ margin: "10px" }} onClick={() => {
                                            if (this.listAndUpdate)
                                                this.listAndUpdate.scrollIntoView({ behavior: "smooth" });
                                        }}>
                                        Go to List & Update
                                    </button>
                                    <BootstrapTable data={this.props.postingSites} striped hover
                                        maxHeight='calc(100% - 60px)'>
                                        <TableHeaderColumn isKey dataField='site' filter={{
                                            type: 'RegexFilter',
                                            placeholder: 'Please enter a source'
                                        }}>Site / Source</TableHeaderColumn>
                                        <TableHeaderColumn dataField='link'
                                            dataFormat={this.jobLink}>Link</TableHeaderColumn>
                                        <TableHeaderColumn dataField='category' dataFormat={this.jobCategory}>Job Add
                                            Category</TableHeaderColumn>
                                        <TableHeaderColumn dataField='country' dataFormat={this.jobCountry}>Country</TableHeaderColumn>
                                        <TableHeaderColumn dataField='save' dataFormat={this.saveOneBtn}
                                            width={"90"}>Save</TableHeaderColumn>
                                        <TableHeaderColumn dataField='reset' width={"90"}
                                            dataFormat={this.resetField}>Reset</TableHeaderColumn>
                                    </BootstrapTable>
                                    <button className="btn btn-xs btn-success btn-icon mt10 ml10"
                                        onClick={this.saveAll} style={{ margin: "10px" }}>
                                        Save All
                                    </button>
                                    <button className="btn btn-xs btn-info btn-icon mt10 ml10"
                                        style={{ margin: "10px" }} data-tip="Go to Top">
                                        <i className="fa fa-arrow-circle-o-up" onClick={() => {
                                            if (this.topDiv)
                                                this.topDiv.scrollIntoView({ behavior: "smooth" });
                                        }} />
                                    </button>
                                </div>
                                <div className="col-md-6" ref={(el) => {
                                    this.listAndUpdate = el;
                                }}>
                                    <h4 className="mb-2 bg-light">Job Ad Posts</h4>
                                    <ul className="list-group" style={{ overflow: "auto", height: "240px" }}>
                                        {this.renderJobPost()}
                                    </ul>
                                </div>
                                <div className="col-md-6 text-center">
                                    <h4 className="mb-2 bg-light">Edit Job Ad Post</h4>
                                    <div className="mb-1">
                                        Site of Job Ad: <br />
                                        <select
                                            className="form-control mb"
                                            name="site"
                                            value={this.state.site}
                                            required
                                            onChange={this.handleInputChange}>
                                            <option value="">---Select---</option>
                                            {this.renderJobOptions()}
                                        </select>
                                    </div>
                                    <div className="mb-1">
                                        Link to Job Ad: <br />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="link"
                                            value={this.state.link}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        Job Ad Category: <br />
                                        <select
                                            className="form-control mb-1"
                                            name="jobType"
                                            value={this.state.jobType}
                                            onChange={this.handleChangeInput}
                                            required
                                        >
                                            <option value={''}>Select Category</option>
                                            {this.renderCategories()}
                                        </select>
                                    </div>
                                    <div className="mb-1">
                                        Country: <br />
                                        <select
                                            className="form-control mb-1"
                                            name="jobCountry"
                                            value={this.state.jobCountry}
                                            onChange={this.handleChangeInput}
                                            required
                                        >
                                            <option value={''}>Select Country</option>
                                            {this.renderCountries()}
                                        </select>
                                    </div>
                                    <button
                                        className="btn btn-success"
                                        type="submit"
                                        onClick={this.saveRecord}
                                    >
                                        {this.state.selectedJobPost ? "Update" : "Save"}
                                    </button>
                                    <button
                                        className="btn btn-success ml10"
                                        onClick={this.resetState}
                                        style={{ marginLeft: "10px" }}
                                    >
                                        Reset
                                    </button>
                                    {this.state.selectedJobPost &&
                                        <button
                                            className="btn btn-danger ml10"
                                            onClick={this.deletePost}
                                            style={{ marginLeft: "10px" }}
                                            disabled={!(isPermitted(this.props.user.role, ROLES.ADMIN) || isPermitted(this.props.user.role, ROLES.SUPERUSER))}
                                        >
                                            Delete
                                    </button>}
                                </div>
                            </div>

                        </div>
                    </div>
                    <ReactTooltip />
                </Modal>
                <Modal isOpen={this.state.modal2Open} onRequestClose={this.toggleModal2} contentLabel="RecordStatModal" style={this.styleSet2}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                New Job Posting Site
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal2}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <div className="col-md-12" style={{ marginBottom: "10px" }}>
                                Site: <br />
                                <input
                                    type="text"
                                    className="form-control"
                                    name="newSite"
                                    value={this.state.newSite}
                                    onChange={this.handleChangeInput}
                                    required
                                />
                            </div>
                            <div className="col-md-12 text-center">
                                <button
                                    className="btn btn-success"
                                    type="submit"
                                    onClick={this.saveSite}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-warning ml10"
                                    onClick={this.toggleModal2}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                    <ReactTooltip />
                </Modal>
            </div>
        )
    }
}

Record.propTypes = {
    user: PropTypes.object,
    categories: PropTypes.array,
    Statistics: PropTypes.object,
    users: PropTypes.array
};

export default withTracker(() => {
    Meteor.subscribe(ValidCategories);
    Meteor.subscribe(PostPub);
    Meteor.subscribe(PostingSitesPub);
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item)),
        posts: PostingDB.find({}, { sort: { timestamp: -1 } }).fetch(),
        postingSites: PostingSitesDB.find({}, { sort: { site: 1 } }).fetch(),
    };
})(Record);
