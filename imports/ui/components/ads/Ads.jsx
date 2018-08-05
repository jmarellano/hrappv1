import React, { Component } from 'react';
import { PostPub, JobsDB } from '../../../api/ads';
import { isPermitted, ROLES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import moment from 'moment-timezone';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class Ads extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            processing: false,
            jobPost: {}
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
        this.saveRecord = this.saveRecord.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.resetState = this.resetState.bind(this);
        this.deletePost = this.deletePost.bind(this);
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
            jobTitle: '',
            jobDescription: '',
            jobExperience: '',
            jobLocation: '',
            jobSalary: '',
            jobWhy: '',
            selectedJobPost: null
        });
    }

    deletePost(e) {
        e.preventDefault();
        let deletePost = confirm("Are you sure to delete this post?");
        if (deletePost) {
            this.props.Ads.deletePosting(this.state.selectedJobPost, (err) => {
                if (err)
                    Bert.alert(err.reason, 'danger', 'growl-top-right');
            });
        }
    }

    saveRecord(e) {
        e.preventDefault();
        let data = {};
        data.title = this.state.jobTitle.trim();
        data.description = this.state.jobDescription.trim();
        data.timestamp = moment().valueOf();
        data.experience = this.state.jobExperience;
        data.location = this.state.jobLocation;
        data.salary = this.state.jobSalary;
        data.why = this.state.jobWhy;
        data.selectedJobPost = this.state.selectedJobPost;
        this.setState({ processing: true });
        this.props.Ads.recordPosting(data, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('New Ad hosted!', 'success', 'growl-top-right');
            this.setState({
                processing: false,
                jobTitle: '',
                jobDescription: '',
                jobExperience: '',
                jobLocation: '',
                jobSalary: '',
                jobWhy: '',
                selectedJobPost: null,
            });
        });
    }


    toggleModal() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    selectJobPost(jobPost) {
        this.setState({
            jobTitle: jobPost.title,
            jobDescription: jobPost.description,
            jobExperience: jobPost.experience,
            jobLocation: jobPost.location,
            jobSalary: jobPost.salary,
            jobWhy: jobPost.why,
            selectedJobPost: jobPost._id
        });
    }

    renderJobPost() {
        let jobPost = this.props.posts || [];
        return jobPost.map((post, index) => {
            let addedBy = db["#users"].findOne({ _id: post.postedBy });
            return (
                <li key={index} className="list-group-item">
                    <small style={{ cursor: "pointer" }} onClick={this.selectJobPost.bind(this, post)}>
                        <b>{post.title}</b>
                        <br />
                        <i className="fa fa-calendar" /> {moment(post.timestamp).format("MM/DD/YYYY HH:mm:ss A")}
                    </small>
                    <small className="text-danger" style={{ float: "right" }}>{`Added By: ${addedBy ? addedBy.username : 'N\\A'}`}</small>
                </li>
            );
        });
    }

    render() {
        return (
            <div>
                <a className="nav-link" data-tip="Host Ads" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-bullhorn" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.isOpen} onRequestClose={this.toggleModal} contentLabel="RecordAdModal" style={this.styleSet} >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Host Ads
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
                                <div className="col-md-6" ref={(el) => {
                                    this.listAndUpdate = el;
                                }}>
                                    <h4 className="mb-2 bg-light">Ads</h4>
                                    <ul className="list-group" style={{ overflow: "auto", height: "240px" }}>
                                        {this.renderJobPost()}
                                    </ul>
                                </div>
                                <div className="col-md-6 text-center">
                                    <h4 className="mb-2 bg-light">Edit Hosted Ads</h4>
                                    <div className="mb-1">
                                        Job Title: <br />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="jobTitle"
                                            value={this.state.jobTitle}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        Job Description: <br />
                                        <textarea
                                            className="form-control"
                                            name="jobDescription"
                                            value={this.state.jobDescription}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        Minimum Experience Required: <br />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="jobExperience"
                                            value={this.state.jobExperience}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        Work Location: <br />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="jobLocation"
                                            value={this.state.jobLocation}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        Salary Range: <br />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="jobSalary"
                                            value={this.state.jobSalary}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
                                    </div>
                                    <div className="mb-1">
                                        why Choose Us? <br />
                                        <textarea
                                            className="form-control"
                                            name="jobWhy"
                                            value={this.state.jobWhy}
                                            onChange={this.handleChangeInput}
                                            required
                                        />
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
            </div>
        )
    }
}

Ads.propTypes = {
    user: PropTypes.object,
    users: PropTypes.array
};

export default withTracker(() => {
    Meteor.subscribe(PostPub);
    return {
        posts: JobsDB.find({}, { sort: { timestamp: -1 } }).fetch()
    };
})(Ads);
