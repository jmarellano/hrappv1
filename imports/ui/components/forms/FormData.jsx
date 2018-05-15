import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FormsDDB, FormsDPub, FormsRemoveData } from '../../../api/forms';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Modal from '../extras/Modal';
import Button from '../extras/Button';
import moment from 'moment';

//import { Candidates, CandidatesPubValid } from '../../api/candidates';
//import { Candidate } from "../../api/Classes/Client";

class FormData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            template: {},
            active_candidates: [],
            remove: false,
            formDataId: null
        };
        this.fields = {};
        this.className = {
            base: 'modal-base',
            afterOpen: 'modal-open',
            beforeClose: 'modal-close'
        };
    }

    componentDidMount() {
        // this.props.Candidate.fetch((data) => {
        //     this.setState({ active_candidates: data });
        // }, (err) => {
        //     Bert.alert(err, 'danger', 'growl-top-right');
        // })
    }

    componentDidUpdate() {
        $('td:empty').html('<span class="text--default">N/A<span>');
        Object.keys(this.fields).forEach((item) => {
            $('th').each((index) => {
                let elem = $('th').eq(index);
                if (elem.html() === item)
                    elem.html(`${item} <span class="text--secondary text--sm">(v${this.fields[item].min} - v${this.fields[item].max})</span>`);
            });
        });
    }

    renderBody() {
        let arr = [];
        let fields = this.fields;
        this.props.data.map((item, i) => {
            let candidate = this.state.active_candidates.filter((active) => {
                return active._id._str === item.applicantId;
            });
            let name = item.applicantId && candidate[0] ? candidate[0].name : "";
            let obj = {
                "": <div><i className="fa fa-info-circle" data-tip={`Form version: ${item.version}`} /><ReactTooltip />
                </div>,
                "#": i + 1,
                "Date": moment(item.createdAt).format("MM/DD/YYYY"),
                "Time": moment(item.createdAt).format("hh:mm:ss a"),
                "Applicant": name
            };
            for (let j = 0; j < item.data.length; j++) {
                if (item.data[j].label !== "") {
                    if (fields[item.data[j].label] && item.version > fields[item.data[j].label].max)
                        fields[item.data[j].label].max = item.version;
                    else if (fields[item.data[j].label] && item.version < fields[item.data[j].label].min)
                        fields[item.data[j].label].min = item.version;
                    else if (!fields[item.data[j].label]) {
                        fields[item.data[j].label] = {};
                        fields[item.data[j].label].min = item.version;
                        fields[item.data[j].label].max = item.version;
                    }
                    obj[item.data[j].label] = item.data[j].val;

                }
            }
            obj.Action = <button className="button button--vsm button--secondary" onClick={() => { this.setState({ remove: true, formDataId: item._id }); }}>Remove</button>;
            this.fields = fields;
            arr.push(obj);
        });
        console.log(arr, this.fields);
        return arr;
    }

    remove(callback) {
        // Meteor.call(FormsRemoveData, this.state.formDataId, (err, data) => {
        //     if (err)
        //         Bert.alert(err.reason, 'danger', 'growl-top-right');
        //     else {
        //         Bert.alert("Data removed", 'success', 'growl-top-right');
        //         this.setState({ remove: false, formDataId: null });
        //     }
        //     if (callback)
        //         callback();
        // });
    }

    render() {
        return (
            <div>
                <h4 className="mb-4 container">
                    {this.state.name}
                </h4>
                <div className="container">
                    {/* // TODO table here */}
                </div>
                <Modal
                    isOpen={this.state.remove}
                    className={this.className}
                    contentLabel="FormDataRemoveModal"
                >
                    <div>
                        <h3>
                            Remove data
                        </h3>
                        Are you sure you want to remove the data submitted by the applicant? <br /><br />
                        <Button onClick={this.remove.bind(this)}
                            className="button button--danger">
                            Remove
                        </Button>
                        <button onClick={() => {
                            this.setState({ remove: false });
                        }} className="button button--secondary">
                            Close
                        </button>
                    </div>
                </Modal>
            </div>
        )
    }
}
FormData.propTypes = {
    data: PropTypes.array,
    active_candidate: PropTypes.array.isRequired,
    loading: PropTypes.bool
};
export default withTracker((props) => {
    const match = matchPath(props.location.pathname, {
        path: '/:component/:data',
        exact: false,
        strict: false
    });
    let loading = true,
        formDSub = Meteor.subscribe(FormsDPub, { form_id: match.params.data });
    if (formDSub.ready())
        loading = false;
    return {
        data: FormsDDB.find({}, { sort: { createdAt: -1 } }).fetch(),
        active_candidate: [], //Candidates.find({}, { sort: { name: 1 } }).fetch(),
        loading
    };
})(FormData);
