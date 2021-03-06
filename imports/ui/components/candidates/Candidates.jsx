import React from 'react';
import { CANDIDATE_STATUS } from '../../../api/classes/Const';
import { Mongo } from 'meteor/mongo';
import { withTracker } from 'meteor/react-meteor-data';
import { CSVLink } from 'react-csv';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CandidatesDB, CandidatesPub } from "../../../api/candidates";
import Candidate from "../../../api/classes/Candidate";
import { PostingSitesDB } from "../../../api/settings";
import CategoryClass from "../../../api/classes/Category";
import { CategoriesDB } from "../../../api/categories";
import moment from 'moment-timezone';

class Teams extends React.Component {
    constructor() {
        super();
        this.state = {
            user: null,
            changeStatus: false,
            saving: false,
            selectedRole: '',
            retire: false,
            remove: false,
            permitted: false,
            editCandidateInfo: false,
            changeReApplicantStatus: false,
            changeJoinedStatus: false,
            unRetire: false,
            retiredUsers: [],
            selectedUserRole: null,
            retrieving: true,
            csv: [[
                'Name',
                'Position',
                'Email',
                'Phone Number',
                'Address',
                'Joined Date',
                'Claimed By',
                'Status',
                'Re-Applicant',
                'Source',
                'Country',
            ]]
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
                maxHeight: '170px',
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
                maxWidth: '900px',
                width: 'auto',
                height: 'auto',
                maxHeight: '1200px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.selectStatus = this.selectStatus.bind(this);
        this.candidateStatus = this.candidateStatus.bind(this);
        this.candidateReApplicant = this.candidateReApplicant.bind(this);
        this.candidateJoinedDate = this.candidateJoinedDate.bind(this);
        this.candidateSource = this.candidateSource.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.editInfo = this.editInfo.bind(this);
        this.save = this.save.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (this.props.validCandidates !== prevProps.validCandidates) {
            let csv = [[
                'Name',
                'Position',
                'Email',
                'Phone Number',
                'Address',
                'Joined Date',
                'Claimed By',
                'Status',
                'Re-Applicant',
                'Source',
                'Country',
            ]];
            this.props.validCandidates.forEach((candidate) => {
                let row = [];
                let statusFriendly = '';
                Object.keys(CANDIDATE_STATUS).forEach((status) => {
                    if (CANDIDATE_STATUS[status] === parseInt(candidate.status))
                        statusFriendly = status;
                });
                row.push(candidate.name);
                row.push(candidate.category);
                row.push(candidate.email);
                row.push(candidate.number);
                row.push(candidate.address);
                row.push(candidate.joinedDt);
                row.push(candidate.claimedBy);
                row.push(statusFriendly);
                row.push(candidate.isReApplicantFriendly)
                row.push(candidate.source);
                row.push(candidate.country);
                csv.push(row);
            });
            this.setState({
                csv
            });
        }
    }
    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }
    selectStatus() {
        this.setState({
            saving: true
        });
        let qry = {};
        if (this.state.changeStatus)
            qry = { status: this.state.selectedStatus };
        else if (this.state.changeSite)
            qry = { source: new Mongo.ObjectID(this.state.selectedSite) };
        else if (this.state.changeReApplicantStatus)
            qry = { isReApplicant: this.state.isSelectedReApplicant };
        else if (this.state.changeJoinedStatus)
            qry = { joinedDate: moment(this.state.isSelectedJoined).valueOf() };
        this.props.Candidate.changeStats(qry, this.state.selectedCandidate.contact, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Status changed!', 'success', 'growl-top-right');
            this.setState({
                changeStatus: false,
                changeReApplicantStatus: false,
                changeJoinedStatus: false,
                saving: false,
                changeSite: false,
                selectedCandidate: null,
                friendlySite: null,
                selectedSite: null,
                friendlyStatus: null,
                selectedRole: null
            });
        });
    }
    candidateReApplicant(cell, candidate) {
        let reApplicant = candidate.isReApplicant ? "1" : "0";
        return (
            <div key={"wakanda2"}>
                <select ref={"role" + candidate.index} className="form-control"
                    value={reApplicant}
                    onChange={(selectedStatus) => {
                        this.setState({
                            changeReApplicantStatus: true,
                            selectedCandidate: candidate,
                            isSelectedReApplicant: (selectedStatus.target.value === "1")
                        });
                    }}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
        )
    }
    candidateJoinedDate(cell, candidate) {
        return (
            <div key={"date_key"}>
                <input type="date" ref={"role" + candidate.index} className="form-control" value={candidate.joinedDt} onChange={(e) => {
                    this.setState({
                        changeJoinedStatus: true,
                        selectedCandidate: candidate,
                        isSelectedJoined: e.target.value
                    });
                }}
                />
            </div>
        )
    }
    candidateStatus(cell, candidate) {
        let status = candidate.status ? parseInt(candidate.status) : CANDIDATE_STATUS.NA;
        return (
            <div key={"wakanda"}>
                <select ref={"role" + candidate.index} className="form-control"
                    value={status}
                    onChange={(selectedStatus) => {
                        let id = selectedStatus.nativeEvent.target.selectedIndex;
                        this.setState({
                            changeStatus: true,
                            selectedCandidate: candidate,
                            friendlyStatus: selectedStatus.nativeEvent.target[id].text,
                            selectedStatus: selectedStatus.target.value
                        });
                    }}>
                    <option value={CANDIDATE_STATUS.NA}>N/A Status</option>
                    <option value={CANDIDATE_STATUS.ABANDONED}>ABANDONED</option>
                    <option value={CANDIDATE_STATUS.DEV_METEOR}>DEV_METEOR</option>
                    <option value={CANDIDATE_STATUS.DEV_LT}>DEV_LT</option>
                    <option value={CANDIDATE_STATUS.DQ_FOREIGNER}>DQ_FOREIGNER</option>
                    <option value={CANDIDATE_STATUS.DQ_GREY}>DQ_GREY</option>
                    <option value={CANDIDATE_STATUS.DQ_ECO}>DQ_ECO</option>
                    <option value={CANDIDATE_STATUS.DQ_SAL}>DQ_SAL</option>
                    <option value={CANDIDATE_STATUS.DQ_NOT_FIT}>DQ_NOT_FIT</option>
                    <option value={CANDIDATE_STATUS.FAILED_INT}>FAILED_INT</option>
                    <option value={CANDIDATE_STATUS.FAILED_METEOR}>FAILED_METEOR</option>
                    <option value={CANDIDATE_STATUS.HIRED}>HIRED</option>
                    <option value={CANDIDATE_STATUS.INC}>INC</option>
                    <option value={CANDIDATE_STATUS.INQ}>INQ</option>
                    <option value={CANDIDATE_STATUS.INT}>INT</option>
                    <option value={CANDIDATE_STATUS.NO_RESPONSE}>NO_RESPONSE</option>
                    <option value={CANDIDATE_STATUS.NO_SHOW}>NO_SHOW</option>
                    <option value={CANDIDATE_STATUS.QUALIFIED}>QUALIFIED</option>
                    <option value={CANDIDATE_STATUS.REDIRECT}>REDIRECT</option>
                    <option value={CANDIDATE_STATUS.RESCHEDULED}>RESCHEDULED</option>
                    <option value={CANDIDATE_STATUS.SCHED_INT}>SCHED_INT</option>
                    <option value={CANDIDATE_STATUS.SCHED_LT}>SCHED_LT</option>
                    <option value={CANDIDATE_STATUS.WITHDREW}>WITHDREW</option>
                    <option value={CANDIDATE_STATUS.PRE_QUALIFIED}>PRE_QUALIFIED</option>
                    <option value={CANDIDATE_STATUS.RESIGNED}>RESIGNED</option>
                    <option value={CANDIDATE_STATUS.TERMED}>TERMED</option>
                </select>
            </div>
        );
    }

    candidateSource(cell, candidate) {
        let source = candidate.source ? candidate.source._str : "not_indicated";
        return (
            <div key={"wakanda1"}>
                <select ref={"role" + candidate.index} className="form-control"
                    value={source}
                    onChange={(selectedStatus) => {
                        let id = selectedStatus.nativeEvent.target.selectedIndex;
                        this.setState({
                            changeSite: true,
                            selectedCandidate: candidate,
                            friendlySite: selectedStatus.nativeEvent.target[id].text,
                            selectedSite: selectedStatus.target.value
                        });
                    }}>
                    <option value="not_indicated">Not Indicated</option>
                    {this.props.postingSites.map((item, index) => {
                        return (
                            <option value={item._id._str} key={index}>{item.site}</option>
                        )
                    })}
                </select>
            </div>
        );
    }
    editCandidateInfo(candidate) {
        this.setState({
            selectedCandidate: candidate,
            name: candidate.name,
            email: candidate.email,
            number: candidate.number,
            address: candidate.address,
            city: candidate.city,
            country: candidate.country,
            state: candidate.state,
            zip: candidate.zip,
            category: candidate.category,
            remarks: candidate.remarks,
            editCandidateInfo: true
        });
    }
    editInfo(cell, candidate) {
        return (
            <button
                className="btn btn-info ml10"
                onClick={this.editCandidateInfo.bind(this, candidate)}
            >
                Edit
            </button>
        )
    }
    renderCategories() {
        return this.props.categories.map((category, index) => {
            return (
                <option key={index} value={category.category}>{category.category}</option>
            );
        });
    }
    renderCountries() {
        let country_list = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];
        return country_list.map((country, index) => {
            return (
                <option key={index} value={country}>{country}</option>
            );
        });
    }
    save(e) {
        e.preventDefault();
        if (!this.state.category.length)
            return;
        this.setState({ processing: true });
        this.props.Candidate.changeInfo({
            name: this.state.name,
            email: this.state.email,
            number: this.state.number,
            address: this.state.address,
            city: this.state.city,
            country: this.state.country,
            state: this.state.state,
            zip: this.state.zip,
            category: this.state.category,
            remarks: this.state.remarks,
            contact: this.state.selectedCandidate.contact
        }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Info changed!', 'success', 'growl-top-right');
            this.setState({ info: false, processing: false });
        });
    }
    render() {
        return (
            <div className="pull-left main">
                <div className="table-responsive" style={{ marginBottom: '10px' }}>
                    <BootstrapTable data={this.props.validCandidates} striped hover maxHeight='calc(100% - 60px)'>
                        <TableHeaderColumn isKey dataField='name'
                            filter={{ type: 'RegexFilter', placeholder: 'Members' }}
                            width={"180"} dataSort>Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='category'
                            filter={{ type: 'RegexFilter', placeholder: 'Position' }}
                            width={"100"} dataSort>Position</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' filter={{
                            type: 'RegexFilter',
                            placeholder: 'Please enter a First Name'
                        }} width={"200"} dataSort>Email</TableHeaderColumn>
                        <TableHeaderColumn dataField='number'
                            filter={{ type: 'RegexFilter', placeholder: 'Phone Number' }}
                            width={"170"} dataSort>Phone Number</TableHeaderColumn>
                        <TableHeaderColumn dataField='address' filter={{
                            type: 'RegexFilter',
                            placeholder: 'Enter Email Add'
                        }} width={"180"} dataSort>Address</TableHeaderColumn>
                        <TableHeaderColumn dataField='joinedDt'
                            filter={{ type: 'RegexFilter', placeholder: 'Date Time' }}
                            dataFormat={this.candidateJoinedDate}
                            width={"200"} dataSort>Joined Date</TableHeaderColumn>
                        <TableHeaderColumn dataField='claimedBy'
                            filter={{ type: 'RegexFilter', placeholder: 'UserName' }}
                            width={"150"} dataSort>Claimed By</TableHeaderColumn>
                        <TableHeaderColumn dataField='friendlyStatus'
                            filter={{ type: 'RegexFilter', placeholder: 'Status' }}
                            dataFormat={this.candidateStatus}
                            width={"150"} dataSort>Status</TableHeaderColumn>
                        <TableHeaderColumn dataField='isReApplicantFriendly'
                            filter={{ type: 'RegexFilter', placeholder: 'Status' }}
                            dataFormat={this.candidateReApplicant}
                            width={"120"} dataSort>Re-Applicant</TableHeaderColumn>
                        <TableHeaderColumn dataField='friendlySite'
                            filter={{ type: 'RegexFilter', placeholder: 'Source' }}
                            dataFormat={this.candidateSource}
                            width={"150"} dataSort>Source</TableHeaderColumn>
                        <TableHeaderColumn dataField='country'
                            filter={{ type: 'RegexFilter', placeholder: 'Country' }}
                            width={"100"} dataSort>Country</TableHeaderColumn>
                        <TableHeaderColumn dataField='editInfo' dataFormat={this.editInfo} width={"100"}>
                            Info
                            <br />
                            <CSVLink data={this.state.csv} filename={`hrapp-report-${moment().format("MM-DD-YYYY")}.csv`} className="btn btn-success form-control">Export</CSVLink>
                        </TableHeaderColumn>
                    </BootstrapTable>
                    {(this.props.validCandidates && this.props.validCandidates.length && this.props.validCandidates[0].max !== this.props.validCandidates.length) ? <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div> : null}
                </div>
                <Modal
                    isOpen={this.state.changeStatus || this.state.changeSite || this.state.changeReApplicantStatus || this.state.changeJoinedStatus}
                    onRequestClose={() => {
                        this.setState({
                            changeStatus: false,
                            changeSite: false,
                            changeReApplicantStatus: false,
                            changeJoinedStatus: false
                        });
                    }}
                    style={this.styleSet}
                    contentLabel="Change Status"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Update {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : ""} Status
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {this.state.changeStatus && <h3>
                                You are going to
                                set {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : "NO_NAME"} Status
                                to {this.state.friendlyStatus}. Continue?
                            </h3>}
                            {this.state.changeSite && <h3>
                                You are going to
                                set {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : "NO_NAME"} Source
                                to {this.state.friendlySite}. Continue?
                            </h3>}
                            {this.state.changeReApplicantStatus && <h3>
                                You are going to
                                mark {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : "NO_NAME"} As {this.state.isSelectedReApplicant ? "A Re-Applicant" : "Not A Re-Applicant"} Continue?
                            </h3>}
                            {this.state.changeJoinedStatus && <h3>
                                You are going to
                                set {(this.state.selectedCandidate && this.state.selectedCandidate.name) ? this.state.selectedCandidate.name : "NO_NAME"} Joined Date
                                to {this.state.isSelectedJoined}. Continue?
                            </h3>}
                            <button onClick={this.selectStatus} className="btn btn-success"
                                disabled={this.state.saving}>Yes
                            </button>
                            <button onClick={() => {
                                this.setState({
                                    changeStatus: false,
                                    changeSite: false,
                                    changeReApplicantStatus: false,
                                    changeJoinedStatus: false,
                                    selectedCandidate: null,
                                    friendlyStatus: null,
                                    selectedRole: null,
                                    friendlySite: null,
                                    selectedSite: null
                                })
                            }} className="btn btn-danger" style={{ marginLeft: "10px" }}>No
                            </button>
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.editCandidateInfo}
                    onRequestClose={() => { this.setState({ editCandidateInfo: false }) }}
                    style={this.styleSet2}
                    contentLabel="Change Status"
                >
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Info
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={() => {
                                            this.setState({ editCandidateInfo: false })
                                        }}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" href="#">Contact Info</a>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                <div className={"tab-pane fade show active"} role="tabpanel" aria-labelledby="home-tab">
                                    <div className="form-horizontal mt-3">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="name">Name <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="name" value={this.state.name} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="category">Category <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <select className="form-control" name="category" value={this.state.category} onChange={this.handleInputChange} required>
                                                    <option value={''}>Select Category</option>
                                                    {this.renderCategories()}
                                                    <option value='SPAMMER'>SPAMMER</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="email">Email Address <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="email" className="form-control" name="email" value={this.state.email} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="number">Mobile Number</label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="number" value={this.state.number} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="address">Address</label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="address" value={this.state.address} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="city">City</label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="city" value={this.state.city} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="state">State</label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="state" value={this.state.state} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="country">Country </label>
                                            <div className="col-sm-12">
                                                <select className="form-control" name="country" value={this.state.country} onChange={this.handleInputChange}>
                                                    {this.renderCountries()}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="zip">Zip Code</label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="zip" value={this.state.zip} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="remarks">Remarks</label>
                                            <div className="col-sm-12">
                                                <textarea className="form-control" name="remarks" value={this.state.remarks} onChange={this.handleInputChange} />
                                            </div>
                                        </div>
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
            </div>
        );
    }
}

Teams.propTypes = {
    Account: PropTypes.object,
    users: PropTypes.array,
    Candidate: PropTypes.object,
    postingSites: PropTypes.array,
    categories: PropTypes.array,
    validCandidates: PropTypes.array,

};

export default withTracker(() => {
    Meteor.subscribe(CandidatesPub);
    return {
        validCandidates: CandidatesDB.find({ retired: 0 }, { sort: { created: -1 } }).fetch().map((item, index) => {
            let friendlySite = null;
            if (item.source) {
                let postingSite = PostingSitesDB.findOne({ _id: item.source });
                if (postingSite)
                    friendlySite = postingSite.site;
            }
            if (friendlySite)
                item.friendlySite = friendlySite;
            let candidate_ = new Candidate(item, index);
            candidate_.claimedBy = candidate_.getClaimer();
            candidate_.isReApplicantFriendly = candidate_.isReApplicant ? "Yes" : "No";
            return candidate_;
        }),
        postingSites: PostingSitesDB.find({}, { sort: { site: 1 } }).fetch(),
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item))
    };
})(Teams);
