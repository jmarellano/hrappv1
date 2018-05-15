import React, { Component } from 'react';
import { CategoriesDB } from '../../../api/categories';
import { withTracker } from 'meteor/react-meteor-data';
import Mongo from 'meteor/mongo';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import moment from 'moment';

class Record extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            processing: false,
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
                maxHeight: '410px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.saveRecord = this.saveRecord.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }
    saveRecord(e) {
        e.preventDefault();
        let data = {};
        if (!moment(`${this.datePosted.value} ${this.timePosted.value}`).isValid()) {
            Bert.alert('Please select date and time.', 'danger', 'growl-top-right');
            return;
        }
        data.site = this.site.value.trim();
        data.link = this.link.value.trim();
        data.timestamp = moment(`${this.datePosted.value} ${this.timePosted.value}`).valueOf();
        data.category = new Mongo.ObjectID(this.jobType.value);
        this.setState({ processing: true });
        this.props.Statistics.recordPosting(data);
        this.setState({ processing: false, isOpen: false });
        Bert.alert("New Job posting has recorded", "success", "growl-top-right");
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
                            <div className="mb-1">
                                Site of Job Ad: <br />
                                <input type="text" className="form-control" ref={instance => { this.site = instance; }} required />
                            </div>
                            <div className="mb-1">
                                Link to Job Ad: <br />
                                <input type="text" className="form-control" ref={instance => { this.link = instance; }} required />
                            </div>
                            <div className="mb-1">
                                Date Posted: <br />
                                <input type="date" className="mb-1 pull-left form-control" ref={instance => { this.datePosted = instance; }} required />
                                <input type="time" className="mb-1 pull-right form-control" ref={instance => { this.timePosted = instance; }} required />
                            </div>
                            <div className="mb-1">
                                Job Ad Category: <br />
                                <select className="form-control mb-1" ref={instance => { this.jobType = instance; }} required >
                                    {this.renderCategories()}
                                </select>
                            </div>
                            <Button className="btn btn-success" type="submit" processing={this.state.processing}>Save</Button>
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
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item)),
    };
})(Record);