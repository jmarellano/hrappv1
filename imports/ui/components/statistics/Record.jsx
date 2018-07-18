import React, { Component } from 'react';
import { ValidCategories, CategoriesDB } from '../../../api/categories';
import { PostPub, PostingDB } from '../../../api/settings';
import { JOB_SITES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import moment from 'moment-timezone';
import Select from 'react-select';

class Record extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            processing: false,
            site: '',
            link: '',
            datePosted: moment().format('YYYY-MM-DD'),
            timePosted: moment().format('hh:mm:ss A'),
            jobType: ''
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
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '300px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.saveRecord = this.saveRecord.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleSiteChange = this.handleSiteChange.bind(this);
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
    resetState(e){
        e.preventDefault();
        this.setState({
            site: "",
            link: "",
            jobType: "",
            selectedJobPost: null
        });
    }
    deletePost(e){
        e.preventDefault();
        let deletePost = confirm("Are you sure to delete this post?");
        if(deletePost){
            this.props.Statistics.deletePosting(this.state.selectedJobPost);
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
        data.selectedJobPost = this.state.selectedJobPost;
        this.setState({ processing: true });
        this.props.Statistics.recordPosting(data);
        this.setState({ processing: false, site: '', link: '', jobType: '', datePosted: '', timePosted: '', selectedJobPost: null });
        Bert.alert('New Job posting has recorded', 'success', 'growl-top-right');
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
    renderJobOptions(){
        return JOB_SITES.map((item, index) => {
            return (
                <option value={item.value} key={index}>{item.label}</option>
            )
        })
    }
    selectJobPost(jobPost){
        this.setState({
            site: jobPost.site,
            link: jobPost.url,
            jobType: jobPost.category._str,
            selectedJobPost: jobPost._id
        });
    }
    renderJobPost() {
        let jobPost = this.props.posts || [];
        return jobPost.map((post, index) => {
            return (
                <li key={ index } className="list-group-item">
                    <small style={ { cursor: "pointer" } } onClick={this.selectJobPost.bind(this, post)}>
                        { post.url }
                        <br/>
                        <i className="fa fa-calendar" /> {moment(post.timestamp).format("MM/DD/YYYY HH:mm:ss A")}
                    </small>
                </li>
            );
        });
    }
    render() {
        return (
            <div>
                <a className="nav-link" data-tip="Record Job Posting" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-edit" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.isOpen} contentLabel="RecordStatModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.saveRecord}>
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
                                <div className="col-md-6">
                                    <ul className="list-group" style={{ overflow: "auto", height: "240px" }}>
                                        {this.renderJobPost()}
                                    </ul>
                                </div>
                                <div className="col-md-6 text-center">
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
                                        {/*<Select */}
                                        {/*TODO fix react-select to work here or find other packages*/}
                                        {/*className="mb"*/}
                                        {/*classNamePrefix="mb"*/}
                                        {/*name="form-field-name"*/}
                                        {/*value={this.state.site}*/}
                                        {/*onChange={this.handleSiteChange}*/}
                                        {/*options={JOB_SITES}*/}
                                        {/*clearable={ false }*/}
                                        {/*disabled={ this.state.processing }*/}
                                        {/*/>*/}
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
                                    <Button
                                        className="btn btn-success"
                                        type="submit"
                                        processing={this.state.processing}>
                                        Save
                                    </Button>
                                    <button
                                        className="btn btn-success ml10"
                                        onClick={this.resetState}
                                        style={{marginLeft: "10px"}}
                                    >
                                        Reset
                                    </button>
                                    { this.state.selectedJobPost &&
                                    <button
                                        className="btn btn-danger ml10"
                                        onClick={this.deletePost}
                                        style={{marginLeft: "10px"}}
                                    >
                                        Delete
                                    </button>}
                                </div>
                            </div>

                        </div>
                    </form>
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
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item)),
        posts: PostingDB.find({}, { sort: { timestamp: -1 } }).fetch(),
    };
})(Record);
