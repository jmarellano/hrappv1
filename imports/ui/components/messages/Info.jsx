import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { CategoriesDB } from '../../../api/categories';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';

import CategoryClass from '../../../api/classes/Category';

class Info extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: false,
            name: props.selectedCandidate.name,
            email: props.selectedCandidate.email,
            number: props.selectedCandidate.number,
            address: props.selectedCandidate.address,
            city: props.selectedCandidate.city,
            country: props.selectedCandidate.country,
            state: props.selectedCandidate.state,
            zip: props.selectedCandidate.zip,
            category: props.selectedCandidate.category,
            processing: false
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
                maxHeight: '520px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.save = this.save.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedCandidate !== prevProps.selectedCandidate)
            this.setState({
                name: this.props.selectedCandidate.name,
                email: this.props.selectedCandidate.email,
                number: this.props.selectedCandidate.number,
                address: this.props.selectedCandidate.address,
                city: this.props.selectedCandidate.city,
                country: this.props.selectedCandidate.country,
                state: this.props.selectedCandidate.state,
                zip: this.props.selectedCandidate.zip,
                category: this.props.selectedCandidate.category,
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
            contact: this.props.selectedCandidate.contact
        }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Candidate Info changed!', 'success', 'growl-top-right');
            this.setState({ info: false, processing: false });
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
        this.setState({ info: !this.state.info });
    }

    renderCategories() {
        return this.props.categories.map((category, index) => {
            return (
                <option key={index} value={category.category}>{category.category}</option>
            );
        });
    }

    renderCountries() {
        var country_list = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];
        return country_list.map((country, index) => {
            return (
                <option key={index} value={country}>{country}</option>
            );
        });
    }

    render() {
        return (
            <a className="link badge badge-success text-light mr-1" data-tip="Edit Info"><i className="fa fa-pencil" onClick={this.toggleModal} />
                <Modal isOpen={this.state.info} contentLabel="InfoModal" style={this.styleSet}>
                    <form className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Info
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
                                            <label className="col-sm-3 control-label" htmlFor="number">Mobile Number <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="number" value={this.state.number} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="address">Address <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="address" value={this.state.address} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="city">City <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="city" value={this.state.city} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="state">State <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="state" value={this.state.state} onChange={this.handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="country">Country <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <select className="form-control" name="country" value={this.state.country} onChange={this.handleInputChange} required>
                                                    {this.renderCountries()}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" htmlFor="zip">Zip Code <span
                                                className="text-danger">*</span></label>
                                            <div className="col-sm-12">
                                                <input type="text" className="form-control" name="zip" value={this.state.zip} onChange={this.handleInputChange} required />
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
            </a>
        );
    }
}

Info.propTypes = {
    Candidate: PropTypes.object,
    user: PropTypes.object,
    categories: PropTypes.array,
    selectedCandidate: PropTypes.object,
};

export default withTracker(() => {
    return {
        categories: CategoriesDB.find({}, { sort: { category: 1 } }).fetch().map((item) => new CategoryClass(item))
    };
})(Info);