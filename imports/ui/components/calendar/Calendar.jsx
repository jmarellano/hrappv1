import React, { Component } from 'react';
import { ValidCategories, CategoriesDB } from '../../../api/categories';
import { PostPub, PostingDB } from '../../../api/settings';
import { isPermitted, JOB_SITES, ROLES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import CategoryClass from '../../../api/classes/Category';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import BigCalendar from 'react-big-calendar';
import moment from 'moment-timezone';
import Select from 'react-select';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppointmentDB, AppointmentsPub } from "../../../api/messages";
BigCalendar.momentLocalizer(moment);

class Record extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            processing: false,
            isAppointmentOpen: false,
            selectAppointmentInfo: null
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
                zIndex: '8889',
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
        this.toggleModal = this.toggleModal.bind(this);
        this.toggleModal2 = this.toggleModal2.bind(this);
        this.toggleAppointment = this.toggleAppointment.bind(this);
    }
    componentDidMount(){
    }

    toggleModal() {
        this.setState({ isOpen: !this.state.isOpen });
    }
    toggleModal2() {
        this.setState({ isAppointmentOpen: !this.state.isAppointmentOpen, selectAppointmentInfo: null });
    }
    toggleAppointment(appointment){
        this.setState({
            isAppointmentOpen: true,
            selectAppointmentInfo: (
                <div className="panel-body p-2 maxHeight" key="wakandaporeber">
                    <div className="col-md-12 row maxHeight">
                        <ul className="list-group">
                            <li className="list-group-item">
                                Subject: {appointment.subject}
                            </li>
                            <li className="list-group-item">
                                From: {appointment.from}
                            </li>
                            <li className="list-group-item">
                                To: {appointment.to}
                            </li>
                            <li className="list-group-item">
                                Message: {appointment.text}
                            </li>
                        </ul>
                    </div>
                </div>
            )
        });
    }
    render() {
        return (
            <div className="maxHeight">
                <a className="nav-link" data-tip="Calendar" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-calendar" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.isOpen} contentLabel="RecordStatModal" style={this.styleSet}>
                    <div className="panel panel-primary maxHeight">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Calendar
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                       onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2 maxHeight">
                            <BigCalendar
                                selectable
                                events={this.props.appointments}
                                defaultView={BigCalendar.Views.MONTH}
                                defaultDate={new Date()}
                                onSelectEvent={this.toggleAppointment}
                                startAccessor='startTime'
                                endAccessor='endTime'
                            />
                        </div>
                        <Modal isOpen={this.state.isAppointmentOpen} contentLabel="RecordStatModal" style={this.styleSet2}>
                            <div className="panel panel-primary maxHeight">
                                <div className="panel-heading bg-secondary text-white p-2">
                                    <div className="panel-title">
                                        Calendar Appointment
                                        <span className="pull-right">
                                        <a href="#" className="close-modal"
                                           onClick={this.toggleModal2}>
                                            <i className="fa fa-remove" />
                                        </a>
                                    </span>
                                    </div>
                                </div>
                                {this.state.selectAppointmentInfo}
                            </div>
                        </Modal>
                    </div>
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
    Meteor.subscribe(AppointmentsPub);
    return {
        appointments: AppointmentDB.find({}, {sort: {startTime: -1}}).fetch()
    };
})(Record);
