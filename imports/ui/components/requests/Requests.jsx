import React from 'react';
import PropTypes from 'prop-types';
//import { ROUTES, ROLES, REQUEST } from '../../api/Classes/Const';
//import { BeatLoader } from 'react-spinners';
//import { RequestsPub, RequestsDB, RemoveRequest } from '../../api/requests';
import { withTracker } from 'meteor/react-meteor-data';
//import Reactable from 'reactable';
import Modal from '../extras/Modal';
import Button from '../extras/Button';

class Requests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remove: false,
            create: false,
            id: "",
            request: null,
        };
        this.closeRemove = this.closeRemove.bind(this);
        this.create = this.create.bind(this);
        this.close = this.close.bind(this);
        this.removeRequest = this.removeRequest.bind(this);
    }

    componentWillMount() {
        // if (this.props.user.role === ROLES.ADMIN || this.props.user.role === ROLES.SUPERUSER)
        //     this.props.history.replace(ROUTES.MESSAGES);
    }

    create() {
        this.setState({ create: true });
    }

    close() {
        this.setState({ create: false });
    }

    closeRemove() {
        this.setState({ remove: false });
    }

    removeRequest() {
        // this.props.Request.remove(this.state.request, () => {
        //     Bert.alert("Request removed!", "success", "growl-top-right");
        // }, (err) => {
        //     Bert.alert(err, "danger", "growl-top-right");
        // });
        // this.setState({
        //     remove: false,
        //     request: null
        // });
    }

    render() {
        return (
            <div className="main">
                <div className="page-content">
                    <div>
                        <button className="button button--secondary m-b-sm"
                            onClick={() => { this.setState({ create: true }); }}>
                            <i className="fa fa-plus" aria-hidden="true" /> New Request
                        </button>
                    </div>
                    <table itemsPerPage={20} sortable={true} pageButtonLimit={5}>
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
                                            <button onClick={() => {
                                                this.setState({ remove: true, request: request._id });
                                            }} className="button button--danger m-r-sm"
                                                disabled={request.status !== REQUEST.PENDING}>Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </table>
                    {!this.props.requests.length && !this.props.loading ? "No request at this moment" : ""}
                    {this.props.loading ?
                        <div className="text-center">
                            {/* <BeatLoader
                                color={'#5e487d'}
                                loading={true}
                            /> */}
                        </div> : ""}
                </div>
                <Modal
                    isOpen={this.state.create}
                    contentLabel="RequestModal"
                >
                    <h2>Create a Request</h2>
                    <div className="panel with-nav-tabs panel-default">
                        <div className="panel-heading">
                            <ul className="nav nav-tabs">
                                <li className="active"><a href="#tab1default" data-toggle="tab">Transfer Claim</a></li>
                                <li><a href="#tab2default" data-toggle="tab">Follow</a></li>
                            </ul>
                        </div>
                        <div className="panel-body">
                            <div className="tab-content">
                                <div className="tab-pane fade in active" id="tab1default">
                                    <div>
                                        To create request for transfering assignment on a candidate, use transfer claim in candidate page.
                                        <br />
                                        <Button onClick={this.close} className="button button--secondary">Close</Button>
                                    </div>
                                </div>
                                <div className="tab-pane fade in" id="tab2default">
                                    <div>
                                        To create request for following a candidate, use follow request in candidate page.
                                        <br />
                                        <Button onClick={this.close} className="button button--secondary">Close</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.remove}
                    className={this.className}
                    contentLabel="RemoveModal"
                >
                    <div>
                        <h3>
                            You are going to remove a request. Continue?
                        </h3>
                        <Button onClick={this.removeRequest} className="button button--danger">Yes</Button>
                        <Button onClick={this.closeRemove} className="button button--secondary">Close</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

Requests.propTypes = {
    requests: PropTypes.array,
    loading: PropTypes.bool,
    user: PropTypes.object,
    title: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};

export default withTracker(() => {
    // let requestSub = Meteor.subscribe(RequestsPub),
    //     loading = true;
    // if (requestSub.ready())
    //     loading = false;
    return {
        //requests: RequestsDB.find().fetch(),
        //loading
        requests: [] // TODO
    };
})(Requests);