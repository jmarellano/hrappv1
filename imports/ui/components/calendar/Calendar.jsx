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
import DateTimePicker from "react-datetime-picker";
BigCalendar.momentLocalizer(moment);

class Record extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            processing: false,
            addAppointment: false,
            isAppointmentOpen: false,
            appointmentName: "",
            appointmentSubject: "",
            appointmentFrom: "",
            appointmentTo: "",
            appointmentMessage: "",
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
        this.styleGetter = this.styleGetter.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.saveAppointment = this.saveAppointment.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value });
        }
    }
    saveAppointment(){
        if(!this.state.startTime || !this.state.endTime)
            return Bert.alert("WARNING: Start/End Date & Time is Required", 'warning', 'growl-top-right');
        if(!this.state.appointmentName)
            return Bert.alert("WARNING: Appointment Name is Required", 'warning', 'growl-top-right');
        if(!this.state.appointmentSubject)
            return Bert.alert("WARNING: Appointment Subject is Required", 'warning', 'growl-top-right');
        if(!this.state.appointmentFrom)
            return Bert.alert("WARNING: Appointment From is Required", 'warning', 'growl-top-right');
        if(!this.state.appointmentTo)
            return Bert.alert("WARNING: Appointment To is Required", 'warning', 'growl-top-right');
        if(!this.state.appointmentMessage)
            return Bert.alert("WARNING: Appointment Message is Required", 'warning', 'growl-top-right');

        this.setState({
            saving: true
        });
        this.props.Account.AddTask(this.state, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Appointment Added!', 'success', 'growl-top-right');
            this.setState({
                addAppointment: false,
                saving: false,
                appointmentName: "",
                appointmentSubject: "",
                appointmentFrom: "",
                appointmentTo: "",
                appointmentMessage: "",
                startTime: null,
                endTime: null,
            });
        });
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
    styleGetter(event, start, end, isSelected) {
        let status = event.taskStatus ? event.taskStatus : "";
        let style = {
            borderRadius: '0px',
            opacity: 0.8,
            color: 'black',
            border: '0px',
            display: 'block'
        };
        switch(status){
            case "1":
                style.backgroundColor = "rgb(177, 236, 179)";
                break;
            case "2":
                style.backgroundColor = "rgb(255, 188, 244)";
                break;
            case "3":
                style.backgroundColor = "rgb(167, 167, 167)";
                break;
            case "4":
                style.backgroundColor = "#ffc6c6";
                break;
            case "5":
                style.backgroundColor = "rgb(255, 216, 182)";
                break;
        }
        return {
            style: style
        };
    }
    render() {
        let class_ = 'nav-link';
        if(this.props.taskList && this.props.taskList.length)
            class_ += ' haveTask';
        return (
            <div className="maxHeight">
                <a className={class_} data-tip="Calendar" href="#" onClick={this.toggleModal}>
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
                                onSelectSlot={slotInfo => {
                                    if(slotInfo){
                                        this.setState({
                                            addAppointment: true,
                                            slotInfo: slotInfo,
                                            startTime: slotInfo.start,
                                            endTime: slotInfo.end,
                                        });
                                    }
                                }}
                                eventPropGetter={this.styleGetter}
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
                        <Modal isOpen={this.state.addAppointment} contentLabel="RecordStatModal" style={this.styleSet2}>
                            <div className="panel panel-primary maxHeight">
                                <div className="panel-heading bg-secondary text-white p-2">
                                    <div className="panel-title">
                                        Add Calendar Appointment
                                        <span className="pull-right">
                                        <a href="#" className="close-modal"
                                           onClick={ () => {
                                               this.setState({ addAppointment: false })
                                           } }>
                                            <i className="fa fa-remove" />
                                        </a>
                                    </span>
                                    </div>
                                </div>
                                <div className="form-horizontal mt-3">
                                    <div className="form-group">
                                        <label className="col-sm-3 control-label" htmlFor="name">Name <span
                                            className="text-danger">*</span></label>
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" name="appointmentName" value={this.state.appointmentName} onChange={this.handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-3 control-label" htmlFor="name">Subject <span
                                            className="text-danger">*</span></label>
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" name="appointmentSubject" value={this.state.appointmentSubject} onChange={this.handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-3 control-label" htmlFor="name">From <span
                                            className="text-danger">*</span></label>
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" name="appointmentFrom" value={this.state.appointmentFrom} onChange={this.handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-3 control-label" htmlFor="name">To <span
                                            className="text-danger">*</span></label>
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" name="appointmentTo" value={this.state.appointmentTo} onChange={this.handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-3 control-label" htmlFor="name">Message / Caption <span
                                            className="text-danger">*</span></label>
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" name="appointmentMessage" value={this.state.appointmentMessage} onChange={this.handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 row" style={{ margin: "40px 0px 10px 7px" }}>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="control-label" htmlFor="name">Start Date & Time <span
                                                    className="text-danger">*</span></label>
                                                <DateTimePicker
                                                    onChange={(date) => {this.setState({ startTime: date })}}
                                                    value={this.state.startTime}
                                                    minDate={new Date()}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="control-label" htmlFor="name">End Date & Time <span
                                                    className="text-danger">*</span></label>
                                                <DateTimePicker
                                                    onChange={(date) => {this.setState({ endTime: date })}}
                                                    value={this.state.endTime}
                                                    minDate={new Date()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <button onClick={ this.saveAppointment } className="btn btn-success"
                                                disabled={ this.state.saving }>Yes
                                        </button>
                                        <button onClick={ () => {
                                            this.setState({
                                                addAppointment: false,
                                                saving: false,
                                                appointmentName: "",
                                                appointmentSubject: "",
                                                appointmentFrom: "",
                                                appointmentTo: "",
                                                appointmentMessage: "",
                                                startTime: null,
                                                endTime: null,
                                            })
                                        } } className="btn btn-danger" style={ { marginLeft: "10px" } }>No
                                        </button>
                                    </div>
                                </div>
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
    Meteor.subscribe(AppointmentsPub, true);
    Meteor.subscribe(AppointmentsPub);
    return {
        appointments: AppointmentDB.find({}, {sort: {startTime: -1}}).fetch().map((appointment, index) => {
            let temp_ = appointment;
            temp_.startTime = new Date(temp_.startTime);
            temp_.endTime = new Date(temp_.endTime);
            return temp_;
        }),
        taskList: db['#task-lists'].find({}, {sort: {startTime: -1}}).fetch()
    };
})(Record);
