import React from 'react';
import PropTypes from 'prop-types';
import { ROUTES, ROLES, REQUEST } from '../../../api/classes/Const';
//import { BeatLoader } from 'react-spinners';
//import { RequestsPub, RequestsDB, RequestProcess } from '../../api/requests';
import { withTracker } from 'meteor/react-meteor-data';
//import Reactable from 'reactable';
import Modal from '../extras/Modal';
import Button from '../extras/Button';

class Requests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            retrieving: true,
            approve: false,
            deny: false,
            id: null,
            type: REQUEST.PENDING,
            processing: false
        };
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
        this.closeApprove = this.closeApprove.bind(this);
        this.closeDeny = this.closeDeny.bind(this);
        this.processRequest = this.processRequest.bind(this);
    }

    closeApprove() {
        this.setState({ approve: false });
    }

    closeDeny() {
        this.setState({ deny: false });
    }

    processRequest(e) {
        // e.preventDefault();
        // this.setState({ processing: false });
        // this.props.Request.process({ id: this.state.id, type: this.state.type }, (err) => {
        //     if (err)
        //         Bert.alert(err.reason, "danger", "growl-top-right");
        //     else
        //         Bert.alert("Request process done!", "success", "growl-top-right");
        //     this.setState({
        //         approve: false,
        //         deny: false,
        //         id: null,
        //         processing: true
        //     });
        // });
    }

    render() {
        return (
            <div className="pull-left main">
                <div className="p-2">
                    <h3>Requests</h3>
                    <table>
                        {this.props.requests.map((request, index) => {
                            let status = (request.status === REQUEST.APPROVED) ? "text-success" : "";
                            status = (request.status === REQUEST.DECLINED) ? "text-danger" : status;
                            status = (request.status === REQUEST.PENDING) ? "text--secondary" : status;
                            let statusText = (request.status === REQUEST.APPROVED) ? "Approved" : "";
                            statusText = (request.status === REQUEST.DECLINED) ? "Declined" : statusText;
                            statusText = (request.status === REQUEST.PENDING) ? "Pending" : statusText;
                            return (
                                <tr key={index}>
                                    <td column="Type">{request.type}</td>
                                    <td column="Description">{request.description}</td>
                                    <td column="Status"
                                        className={status}>{statusText}</td>
                                    <td column="Date Created">{moment(request.createdAt).format("MMM DD, YYYY")}</td>
                                    <td column="Action">
                                        <div>
                                            <button className="button button--danger  m-r-sm"
                                                onClick={() => { this.setState({ deny: true, id: request._id, type: REQUEST.DECLINED }); }}
                                                disabled={request.status !== REQUEST.PENDING}>Deny
                                            </button>
                                            <button className="button button--success m-r-sm"
                                                onClick={() => { this.setState({ approve: true, id: request._id, type: REQUEST.APPROVED }); }}
                                                disabled={request.status !== REQUEST.PENDING}>Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </table>
                    {(!this.props.requests.length && !this.props.loading) && "No request at this moment"}
                    {this.props.loading &&
                        <div className="text-center">
                            <i className="fa fa-spin fa-circle-o-notch" /> Loading...
                        </div>
                    }
                </div>
                <Modal
                    isOpen={this.state.approve}
                    className={this.className}
                    contentLabel="ApproveModal"
                >
                    <form onSubmit={this.processRequest}>
                        <h3>
                            You are going to approve a request. Continue?
                        </h3>
                        <Button className="button button--danger" type="submit" processing={this.state.processing}>Yes</Button>
                        <Button onClick={this.closeApprove} className="button button--secondary">Close</Button>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.deny}
                    className={this.className}
                    contentLabel="DenyModal"
                >
                    <form onSubmit={this.processRequest}>
                        <h3>
                            You are going to decline a request. Continue?
                        </h3>
                        <Button className="button button--danger" type="submit" processing={this.state.processing}>Yes</Button>
                        <Button onClick={this.closeDeny} className="button button--secondary">Close</Button>
                    </form>
                </Modal>
            </div>
        );
    }
}

Requests.propTypes = {};

export default withTracker(() => {
    // let requestSub = Meteor.subscribe(RequestsPub),
    //     loading = true;
    // if (requestSub.ready())
    let loading = false;
    return {
        //requests: RequestsDB.find().fetch(),
        loading,
        requests: [] // TODO
    };
})(Requests);
