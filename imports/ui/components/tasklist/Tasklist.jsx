import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import moment from 'moment-timezone';
import { AppointmentsPub } from "../../../api/messages";

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
                padding: '0px',
                overflowX: 'hidden'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    renderTaskList(){
        if(this.props.taskList && this.props.taskList.length)
            return this.props.taskList.map((task, index) => {
               return (
                   <div className="row row-striped-task-list" key={index}>
                       <div className="col-3 text-right">
                           <h1 className="display-4">
                               <span className="badge badge-secondary">{moment(task.startTime).format("hh:mm A")}</span>
                           </h1>
                       </div>
                       <div className="col-9">
                           <h3 className="text-uppercase">
                               <strong>{task.subject}</strong>
                           </h3>
                           <ul className="list-inline">
                               <li className="list-inline-item">
                                   <i className="fa fa-calendar-o" aria-hidden="true"/>
                                   {moment(task.startTime).format("dddd")}
                               </li>
                               <li className="list-inline-item">
                                   <i className="fa fa-clock-o" aria-hidden="true"/>
                                   {moment(task.startTime).format("hh:mm A")} - {moment(task.endTime).format("hh:mm A")}
                               </li>
                           </ul>
                           <p>{task.text}</p>
                       </div>
                   </div>
               );
            });
    }
    
    render() {
        return (
            <div className="maxHeight">
                <a className="nav-link" data-tip="Task List" href="#" onClick={this.toggleModal}>
                    <i className="fa fa-2x fa-tasks" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.isOpen} contentLabel="RecordStatModal" style={this.styleSet}>
                    <div className="panel panel-primary maxHeight">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Task List
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                       onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body maxHeight">
                            {this.renderTaskList()}
                            {(this.props.taskList && this.props.taskList.length && this.props.taskList[0].max !== this.props.taskList.length) ?  <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div> : null}
                        </div>
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
    return {
        taskList: db['#task-lists'].find({}, {sort: {startTime: -1}}).fetch()
    };
})(Record);
