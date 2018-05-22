import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { CategoriesDB } from '../../../api/categories';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';
import ReactTooltip from 'react-tooltip';

import CategoryClass from '../../../api/classes/Category';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: false,
            processing: false,
            resume: props.selectedCandidate.resume,
            portfolio: props.selectedCandidate.portfolio,
            disc: props.selectedCandidate.disc,
            disc_d: props.selectedCandidate.disc_d,
            disc_i: props.selectedCandidate.disc_i,
            disc_s: props.selectedCandidate.disc_s,
            disc_c: props.selectedCandidate.disc_c,
            values: props.selectedCandidate.values,
            values_aesthetic: props.selectedCandidate.values_aesthetic,
            values_economic: props.selectedCandidate.values_economic,
            values_individualistic: props.selectedCandidate.values_individualistic,
            values_political: props.selectedCandidate.values_political,
            values_altruist: props.selectedCandidate.values_altruist,
            values_regulatory: props.selectedCandidate.values_regulatory,
            values_theoretical: props.selectedCandidate.values_theoretical,
            iq: props.selectedCandidate.iq,
            TEST_METEOR: props.selectedCandidate.TEST_METEOR,
            TEST_LIVE: props.selectedCandidate.TEST_LIVE,
            TEST_WRITING: props.selectedCandidate.TEST_WRITING,
            TEST_WRITING_Duplication: props.selectedCandidate.TEST_WRITING_Duplication,
            TEST_WRITING_Style: props.selectedCandidate.TEST_WRITING_Style,
            TEST_WRITING_Grammar: props.selectedCandidate.TEST_WRITING_Grammar,
            TEST_WRITING_Marketing: props.selectedCandidate.TEST_WRITING_Marketing,
            TEST_WRITING_Impact: props.selectedCandidate.TEST_WRITING_Impact,
            VIDEO: props.selectedCandidate.VIDEO,
            INTERVIEW: props.selectedCandidate.INTERVIEW,
            MANAGER: props.selectedCandidate.MANAGER,
            TEST_IMAGE: props.selectedCandidate.TEST_IMAGE,
            TEST_CREATIVE: props.selectedCandidate.TEST_CREATIVE,
            TEST_WEBFLOW: props.selectedCandidate.TEST_WEBFLOW,
            TEST_MOCK: props.selectedCandidate.TEST_MOCK,
            TEST_MOCK_Voice: props.selectedCandidate.TEST_MOCK_Voice,
            TEST_MOCK_Accent: props.selectedCandidate.TEST_MOCK_Accent,
            TEST_MOCK_Acknowledgement: props.selectedCandidate.TEST_MOCK_Acknowledgement,
            TEST_MOCK_Comprehension: props.selectedCandidate.TEST_MOCK_Comprehension,
            TEST_MOCK_Sales: props.selectedCandidate.TEST_MOCK_Sales,
            TEST_MOCK_Care: props.selectedCandidate.TEST_MOCK_Care,
            TEST_SIMULATION: props.selectedCandidate.TEST_SIMULATION,
            others: props.selectedCandidate.others,
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '330px',
                width: 'auto',
                height: 'auto',
                maxHeight: '520px',
                margin: '1% auto',
                padding: '0px',
                overflowX: 'none'
            }
        };
        this.save = this.save.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedCandidate !== prevProps.selectedCandidate)
            this.setState({
                resume: this.props.selectedCandidate.resume,
                portfolio: this.props.selectedCandidate.portfolio,
                disc: this.props.selectedCandidate.disc,
                disc_d: this.props.selectedCandidate.disc_d,
                disc_i: this.props.selectedCandidate.disc_i,
                disc_s: this.props.selectedCandidate.disc_s,
                disc_c: this.props.selectedCandidate.disc_c,
                values: this.props.selectedCandidate.values,
                values_aesthetic: this.props.selectedCandidate.values_aesthetic,
                values_economic: this.props.selectedCandidate.values_economic,
                values_individualistic: this.props.selectedCandidate.values_individualistic,
                values_political: this.props.selectedCandidate.values_political,
                values_altruist: this.props.selectedCandidate.values_altruist,
                values_regulatory: this.props.selectedCandidate.values_regulatory,
                values_theoretical: this.props.selectedCandidate.values_theoretical,
                iq: this.props.selectedCandidate.iq,
                TEST_METEOR: this.props.selectedCandidate.TEST_METEOR,
                TEST_LIVE: this.props.selectedCandidate.TEST_LIVE,
                TEST_WRITING: this.props.selectedCandidate.TEST_WRITING,
                TEST_WRITING_Duplication: this.props.selectedCandidate.TEST_WRITING_Duplication,
                TEST_WRITING_Style: this.props.selectedCandidate.TEST_WRITING_Style,
                TEST_WRITING_Grammar: this.props.selectedCandidate.TEST_WRITING_Grammar,
                TEST_WRITING_Marketing: this.props.selectedCandidate.TEST_WRITING_Marketing,
                TEST_WRITING_Impact: this.props.selectedCandidate.TEST_WRITING_Impact,
                VIDEO: this.props.selectedCandidate.VIDEO,
                INTERVIEW: this.props.selectedCandidate.INTERVIEW,
                MANAGER: this.props.selectedCandidate.MANAGER,
                TEST_IMAGE: this.props.selectedCandidate.TEST_IMAGE,
                TEST_CREATIVE: this.props.selectedCandidate.TEST_CREATIVE,
                TEST_WEBFLOW: this.props.selectedCandidate.TEST_WEBFLOW,
                TEST_MOCK: this.props.selectedCandidate.TEST_MOCK,
                TEST_MOCK_Voice: this.props.selectedCandidate.TEST_MOCK_Voice,
                TEST_MOCK_Accent: this.props.selectedCandidate.TEST_MOCK_Accent,
                TEST_MOCK_Acknowledgement: this.props.selectedCandidate.TEST_MOCK_Acknowledgement,
                TEST_MOCK_Comprehension: this.props.selectedCandidate.TEST_MOCK_Comprehension,
                TEST_MOCK_Sales: this.props.selectedCandidate.TEST_MOCK_Sales,
                TEST_MOCK_Care: this.props.selectedCandidate.TEST_MOCK_Care,
                TEST_SIMULATION: this.props.selectedCandidate.TEST_SIMULATION,
                others: this.props.selectedCandidate.others,
            });
    }


    save(e) {
        e.preventDefault();
        this.setState({ processing: true });
        let states = this.state;
        delete states['processing'];
        delete states['stats'];
        this.props.Candidate.changeStats(states, this.props.selectedCandidate.contact, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Stats changed!', 'success', 'growl-top-right');
            this.setState({ stats: false, processing: false });
        });
    }

    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }

    toggleModal() {
        this.setState({ stats: !this.state.stats });
    }

    renderCategories() {
        return this.props.categories.map((category, index) => {
            return (
                <option key={index} value={category.category}>{category.category}</option>
            );
        });
    }

    renderStats(category) {
        let arr = [
            { name: 'resume', sub: false, base: 'resume' },
            { name: 'portfolio', sub: false, base: 'portfolio' },
            { name: 'disc', sub: false, base: 'disc' },
            { name: 'disc_d', sub: true, base: 'disc' },
            { name: 'disc_i', sub: true, base: 'disc' },
            { name: 'disc_s', sub: true, base: 'disc' },
            { name: 'disc_c', sub: true, base: 'disc' },
            { name: 'values', sub: false, base: 'values' },
            { name: 'values_aesthetic', sub: true, base: 'values' },
            { name: 'values_economic', sub: true, base: 'values' },
            { name: 'values_individualistic', sub: true, base: 'values' },
            { name: 'values_political', sub: true, base: 'values' },
            { name: 'values_altruist', sub: true, base: 'values' },
            { name: 'values_regulatory', sub: true, base: 'values' },
            { name: 'values_theoretical', sub: true, base: 'values' },
            { name: 'iq', sub: false, base: 'iq' },
            { name: 'TEST_METEOR', sub: false, base: 'TEST_METEOR' },
            { name: 'TEST_LIVE', sub: false, base: 'TEST_LIVE' },
            { name: 'TEST_WRITING', sub: false, base: 'TEST_WRITING' },
            { name: 'TEST_WRITING_Duplication', sub: true, base: 'TEST_WRITING' },
            { name: 'TEST_WRITING_Style', sub: true, base: 'TEST_WRITING' },
            { name: 'TEST_WRITING_Grammar', sub: true, base: 'TEST_WRITING' },
            { name: 'TEST_WRITING_Marketing', sub: true, base: 'TEST_WRITING' },
            { name: 'TEST_WRITING_Impact', sub: true, base: 'TEST_WRITING' },
            { name: 'VIDEO', sub: false, base: 'VIDEO' },
            { name: 'INTERVIEW', sub: false, base: 'INTERVIEW' },
            { name: 'MANAGER', sub: false, base: 'MANAGER' },
            { name: 'TEST_IMAGE', sub: false, base: 'TEST_IMAGE' },
            { name: 'TEST_CREATIVE', sub: false, base: 'TEST_CREATIVE' },
            { name: 'TEST_WEBFLOW', sub: false, base: 'TEST_WEBFLOW' },
            { name: 'TEST_MOCK', sub: false, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Voice', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Accent', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Acknowledgement', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Comprehension', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Sales', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_MOCK_Care', sub: true, base: 'TEST_MOCK' },
            { name: 'TEST_SIMULATION', sub: false, base: 'TEST_SIMULATION' },
            { name: 'others', sub: false, base: 'others' },
        ];
        return arr.map((item, index) => {
            if (!category[item.base] || category[item.base] === 0)
                return null;
            return (
                <div key={index} className="form-group row">
                    <label className={`col-sm-8 control-label mt-2 ${item.sub && 'text-right'}`} htmlFor={item.name}>
                        {!item.sub && <i className="fa fa-circle" />} {item.name}
                    </label>
                    <div className="col-sm-4">
                        <input type="number" min="0" step="1" className="form-control" name={item.name} value={this.state[item.name]} onChange={this.handleInputChange} required />
                    </div>
                </div>
            );
        });
    }

    render() {
        let category = this.props.categories.filter((item) => item.category === this.props.selectedCandidate.category)[0];
        if (!category)
            return null;
        return (
            <a className="link badge badge-success text-light mr-1" data-tip="Edit Stats"><i className="fa fa-tasks" onClick={this.toggleModal} />
                <Modal isOpen={this.state.stats} contentLabel="StatsModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Stats
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" href="#">{category.category}</a>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                <div className={"tab-pane fade show active"} role="tabpanel" aria-labelledby="home-tab">
                                    <div className="form-horizontal mt-3">
                                        {this.renderStats(category)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="panel-footer p-2">
                            <hr />
                            <div className="container">
                                <div className="pull-right mb-2">
                                    <Button type="submit" className="form-control btn btn-success" processing={this.state.processing}>Save</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
                <ReactTooltip />
            </a>
        );
    }
}

Stats.propTypes = {
    Candidate: PropTypes.object,
    user: PropTypes.object,
    categories: PropTypes.array,
    selectedCandidate: PropTypes.object,
};

export default withTracker(() => {
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item))
    };
})(Stats);