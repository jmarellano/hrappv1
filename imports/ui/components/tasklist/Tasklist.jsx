import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import moment from 'moment-timezone';
import DateTimePicker from 'react-datetime-picker';

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
        this.styleSet2 = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '550px',
                width: 'auto',
                height: 'auto',
                maxHeight: '180px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.selectStatus = this.selectStatus.bind(this);
    }
    selectStatus() {
        if (this.state.selectedStatus === "2") {
            if (!this.state.startTime || !this.state.endTime)
                return Bert.alert("WARNING: Start/End Date & Time is required", 'warning', 'growl-top-right');
        }
        this.setState({
            saving: true
        });
        this.props.Account.markTask(this.state, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Status changed!', 'success', 'growl-top-right');
            this.setState({
                changeStatus: false,
                saving: false,
                selectedStatus: null,
                friendlyStatus: null,
                selectedTask: null,
                startTime: null,
                endTime: null,
            });
        });
    }
    toggleModal() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    renderTaskList() {
        if (this.props.taskList && this.props.taskList.length)
            return this.props.taskList.map((task, index) => {
                let style = {};
                if (task.endTime < moment().valueOf())
                    style = { backgroundColor: "#ffc6c6" };
                let status = task.taskStatus ? task.taskStatus : "";
                switch (status) {
                    case "1":
                        style = { backgroundColor: "rgb(177, 236, 179)" };
                        break;
                    case "2":
                        style = { backgroundColor: "rgb(255, 188, 244)" };
                        break;
                    case "3":
                        style = { backgroundColor: "rgb(167, 167, 167)" };
                        break;
                    case "4":
                        style = { backgroundColor: "#ffc6c6" };
                        break;
                    case "5":
                        style = { backgroundColor: "rgb(255, 216, 182)" };
                        break;
                }
                return (
                    <div className="row row-striped-task-list" key={index} style={style}>
                        <div className="col-3 text-right">
                            <h1 className="display-4">
                                <span
                                    className="badge badge-secondary">{moment(task.startTime).format("hh:mm A")}</span>
                            </h1>
                            <h1 className="display-4">
                                <span className="badge badge-secondary">
                                    <select className="form-control" style={{ fontSize: "30%" }}
                                        value={status}
                                        onChange={(selectedStatus) => {
                                            let id = selectedStatus.nativeEvent.target.selectedIndex;
                                            this.setState({
                                                changeStatus: true,
                                                selectedStatus: selectedStatus.target.value,
                                                friendlyStatus: selectedStatus.nativeEvent.target[id].text,
                                                selectedTask: task
                                            });
                                        }}>
                                        <option value="">--- Not Marked ---</option>
                                        <option value="1">Done</option>
                                        <option value="2">Rescheduled</option>
                                        <option value="3">Cancelled</option>
                                        <option value="4">Missed</option>
                                        <option value="5">In-Progress</option>
                                    </select>
                                </span>
                            </h1>
                        </div>
                        <div className="col-9">
                            <h3 className="text-uppercase">
                                <strong>{task.subject}</strong>
                            </h3>
                            <ul className="list-inline">
                                <li className="list-inline-item">
                                    <i className="fa fa-calendar-o" aria-hidden="true" /> &nbsp;
                                    {moment(task.startTime).format("dddd")}
                                </li>
                                <li className="list-inline-item">
                                    <i className="fa fa-clock-o" aria-hidden="true" /> &nbsp;
                                    {moment(task.startTime).format("hh:mm A")} - {moment(task.endTime).format("hh:mm A")}
                                </li>
                                <li className="list-inline-item">
                                    STATUS: <b>{task.friendlyStatus || "N/A"}</b>
                                </li>
                            </ul>
                            <p style={{ paddingRight: "10px" }}>{task.text}</p>
                        </div>
                    </div>
                );
            });
    }

    render() {
        let class_ = 'nav-link';
        if (this.props.taskList && this.props.taskList.length)
            class_ += ' haveTask';
        if (this.state.selectedStatus === "2") {
            this.styleSet2.content.maxHeight = "500px";
            this.styleSet2.content.maxWidth = "930px";
        } else {
            this.styleSet2.content.maxHeight = "180px";
            this.styleSet2.content.maxWidth = "550px";
        }
        return (
            <div className="maxHeight">
                <a className={class_} data-tip="Task List" href="#" onClick={this.toggleModal}>
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
                            {(this.props.taskList && this.props.taskList.length && this.props.taskList[0].max !== this.props.taskList.length) ? <div className="text-center"><i className="fa fa-spin fa-circle-o-notch" /> Loading...</div> : null}
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.changeStatus}
                    style={this.styleSet2}
                    contentLabel="Change Status"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Update Task Status
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            {(this.state.selectedStatus !== "2") && <h3>
                                Mark Task Status as {this.state.friendlyStatus}. Continue?
                            </h3>}
                            {(this.state.selectedStatus === "2") && <h3>
                                Mark Task Status as {this.state.friendlyStatus} and Change Start Time and End Time
                                <div className="col-md-12 row" style={{ margin: "40px 0px 10px 7px" }}>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="control-label" htmlFor="name">Start Date & Time <span
                                                className="text-danger">*</span></label>
                                            <DateTimePicker
                                                onChange={(date) => { this.setState({ startTime: date }) }}
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
                                                onChange={(date) => { this.setState({ endTime: date }) }}
                                                value={this.state.endTime}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </h3>}
                            <div className="text-center">
                                <button onClick={this.selectStatus} className="btn btn-success"
                                    disabled={this.state.saving}>Yes
                                </button>
                                <button onClick={() => {
                                    this.setState({
                                        changeStatus: false,
                                        saving: false,
                                        selectedStatus: null,
                                        friendlyStatus: null,
                                        startTime: null,
                                        endTime: null,
                                        selectedTask: null,
                                    })
                                }} className="btn btn-danger" style={{ marginLeft: "10px" }}>No
                                </button>
                            </div>
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
    return {
        taskList: db['#task-lists'].find({}, { sort: { startTime: -1 } }).fetch()
    };
})(Record);
