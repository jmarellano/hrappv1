import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { ValidCategories, CategoriesDB } from '../../../api/categories';
import PropTypes from 'prop-types';
import Button from '../extras/Button';
import Modal from '../extras/Modal';
import CategoryClass from '../../../api/classes/Category';

class Category extends React.Component {
    constructor() {
        super();
        this.state = {
            categoryModal: false,
            confirmation: false,
            processing: false,
            category_id: '',
            category: '',
            resume: 0,
            portfolio: 0,
            disc: 0,
            values: 0,
            iq: 0,
            TEST_METEOR: 0,
            TEST_LIVE: 0,
            TEST_WRITING: 0,
            VIDEO: 0,
            INTERVIEW: 0,
            MANAGER: 0,
            TEST_IMAGE: 0,
            TEST_CREATIVE: 0,
            TEST_WEBFLOW: 0,
            TEST_MOCK: 0,
            TEST_SIMULATION: 0,
            others: 0
        };
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
        this.addCategory = this.addCategory.bind(this);
        this.removeCategory = this.removeCategory.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmationModal = this.confirmationModal.bind(this);
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '520px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.styleSetSmall = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '170px',
                margin: '1% auto',
                padding: '0px'
            }
        };
    }

    renderCategories() {
        return this.props.categories.map((item) => {
            return (
                <option value={item.id._str} key={item.id}>{item.category}</option>
            );
        });
    }

    addCategory(e) {
        e.preventDefault();
        this.setState({ processing: true });
        let data = {
            category: this.state.category,
            resume: this.state.resume,
            portfolio: this.state.portfolio,
            disc: this.state.disc,
            values: this.state.values,
            iq: this.state.iq,
            TEST_METEOR: this.state.TEST_METEOR,
            TEST_LIVE: this.state.TEST_LIVE,
            TEST_WRITING: this.state.TEST_WRITING,
            VIDEO: this.state.VIDEO,
            INTERVIEW: this.state.INTERVIEW,
            MANAGER: this.state.MANAGER,
            TEST_IMAGE: this.state.TEST_IMAGE,
            TEST_CREATIVE: this.state.TEST_CREATIVE,
            TEST_WEBFLOW: this.state.TEST_WEBFLOW,
            TEST_MOCK: this.state.TEST_MOCK,
            TEST_SIMULATION: this.state.TEST_SIMULATION,
            others: this.state.others
        }
        this.props.Category.add(data, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                this.setState({
                    categoryModal: false,
                    category: '',
                    resume: 0,
                    portfolio: 0,
                    disc: 0,
                    values: 0,
                    iq: 0,
                    TEST_METEOR: 0,
                    TEST_LIVE: 0,
                    TEST_WRITING: 0,
                    VIDEO: 0,
                    INTERVIEW: 0,
                    MANAGER: 0,
                    TEST_IMAGE: 0,
                    TEST_CREATIVE: 0,
                    TEST_WEBFLOW: 0,
                    TEST_MOCK: 0,
                    TEST_SIMULATION: 0,
                    others: 0
                });
                Bert.alert('New category is created', 'success', 'growl-top-right', 'fa-check');
            }
            this.setState({ processing: false });
        });
    }

    removeCategory(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Category.remove(this.state.category_id, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                this.setState({ categoryModal: false, confirmation: false });
                Bert.alert('Category removed', 'success', 'growl-top-right', 'fa-check');
            }
            this.setState({ processing: false });
        });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    toggleModal() {
        this.setState({ categoryModal: !this.state.categoryModal });
    }

    confirmationModal() {
        this.setState({ confirmation: !this.state.confirmation });
    }

    render() {
        return (
            <div>
                <a className="nav-link" data-tip="Categories" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-object-group" />
                </a>
                <Modal
                    isOpen={this.state.categoryModal}
                    contentLabel="CategoryModal"
                    style={this.styleSet}
                >
                    <div className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Category
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <nav>
                                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                    <a
                                        className="nav-link text-primary active"
                                        data-toggle="tab"
                                        href="#add"
                                        role="tab">
                                        Add Category
                                    </a>
                                    <a
                                        className="nav-link text-primary"
                                        data-toggle="tab"
                                        href="#remove"
                                        role="tab">
                                        Remove Category
                                    </a>
                                </div>
                            </nav>
                            <div className="tab-content" id="nav-tabContent">
                                <div
                                    id="add"
                                    className="tab-pane fade show active"
                                    role="tabpanel"
                                    aria-labelledby="add-tab">
                                    <form
                                        role="form"
                                        className="form-horizontal mb-1"
                                        onSubmit={this.addCategory}>
                                        <div className="form-group panel-body pt-2">
                                            <label className="col-md-2 control-label">Category Name</label>
                                            <div className="col-md-10">
                                                <input
                                                    type="text"
                                                    placeholder=""
                                                    value={this.state.category}
                                                    name="category"
                                                    className="form-control"
                                                    onChange={this.handleChangeInput}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <table className="table panel-body mb">
                                            <thead>
                                                <tr className="filters">
                                                    <th>Status</th>
                                                    <th>Weight</th>
                                                    <th>Status</th>
                                                    <th>Weight</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        Resume
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.resume}
                                                            name="resume"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        Portfolio
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.portfolio}
                                                            name="portfolio"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        DISC
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.disc}
                                                            name="disc"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        VALUES
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.values}
                                                            name="values"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        IQ
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.iq}
                                                            name="iq"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        METEOR
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_METEOR}
                                                            name="TEST_METEOR"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        LIVE TEST
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_LIVE}
                                                            name="TEST_LIVE"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        Writing
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_WRITING}
                                                            name="TEST_WRITING"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Video
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.VIDEO}
                                                            name="VIDEO"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        HR Interview
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.INTERVIEW}
                                                            name="INTERVIEW"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Manager/Head
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.MANAGER}
                                                            name="MANAGER"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            require
                                                        />
                                                    </td>
                                                    <td>
                                                        CAT 1
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_IMAGE}
                                                            name="TEST_IMAGE"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        CAT 2
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_CREATIVE}
                                                            name="TEST_CREATIVE"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        CAT 3
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_WEBFLOW}
                                                            name="TEST_WEBFLOW"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Mock Call
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_MOCK}
                                                            name="TEST_MOCK"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        Simulation
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.TEST_SIMULATION}
                                                            name="TEST_SIMULATION"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Others
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={this.state.others}
                                                            name="others"
                                                            max="100"
                                                            step="0.1"
                                                            className="form-control"
                                                            onChange={this.handleChangeInput}
                                                            placeholder="%"
                                                            required
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <Button
                                            className="btn btn-primary"
                                            type="submit"
                                            processing={this.state.processing}>
                                            Add
                                        </Button>
                                    </form>
                                </div>
                                <div id="remove" className="tab-pane fade" role="tabpanel" aria-labelledby="remove-tab">
                                    <div className="form-group panel-body pt-2">
                                        <label className="col-lg-2 control-label">Category</label>
                                        <div className="col-lg-10">
                                            <select
                                                className="form-control selectpicker"
                                                data-style="btn-primary"
                                                value={this.state.category_id}
                                                name="category_id"
                                                onChange={this.handleChangeInput}
                                                required
                                            >
                                                <option value={''}>Select Category</option>
                                                {this.renderCategories()}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group panel-body">
                                        <div className="col-md-12 text-warning">
                                            NOTE: Removing Category will make candidates to be uncategorized and
                                            unclaimed.
                                        </div>
                                        <div className="col-md-12">
                                            <button className="btn btn-danger"
                                                disabled={!this.props.categories.length || !this.state.category_id.length} type="button"
                                                onClick={this.confirmationModal}>Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.confirmation}
                    style={this.styleSetSmall}
                    contentLabel="CategoryModal"
                >
                    <div className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Category
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.confirmationModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <form onSubmit={this.removeCategory}>
                                <h3>
                                    You are going to remove a category. Continue?
                                </h3>
                                <Button className="btn btn-danger" type="submit" processing={this.state.processing}>Yes</Button>
                            </form>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

Category.propTypes = {
    categories: PropTypes.array,
    Category: PropTypes.object
};

export default withTracker(() => {

    return {
        isReady: Meteor.subscribe(ValidCategories).ready(),
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item))
    };
})(Category);