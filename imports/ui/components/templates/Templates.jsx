import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { ROUTES } from '../../../api/classes/Const';
import { ValidTemplates, TemplatesDB } from '../../../api/messages';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal/components/Modal';
import Button from '../extras/Button';
import ReactTooltip from 'react-tooltip';

class Templates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: false,
            confirmation: false,
            selectedTemplate: null
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
        this.styleSetSmall = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '600px',
                width: 'auto',
                height: 'auto',
                maxHeight: '190px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmationModal = this.confirmationModal.bind(this);
        this.deleteTemplate = this.deleteTemplate.bind(this);
    }

    toggleModal() {
        this.setState({ templates: !this.state.templates });
    }

    confirmationModal(selectedTemplate) {
        this.setState({ confirmation: !this.state.confirmation, selectedTemplate });
    }

    deleteTemplate(callback) {
        this.props.Message.deleteTemplate({ id: this.state.selectedTemplate._id }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Template Removed', 'success', 'growl-top-right');
            callback();
            this.setState({ confirmation: false });
        });
    }

    setTemplate(value) {
        this.props.setTemplate(value);
        this.toggleModal();
    }

    renderTemplates() {
        return this.props.templates.map((template, index) => {
            return (
                <tr key={index}>
                    <td className="pt-3">{template.name}</td>
                    <td className="text-right">
                        <button className="btn btn-warning ml-1"
                            onClick={this.setTemplate.bind(this, template.template)} data-tip="Use Template">
                            Use
                        </button>
                        <button className="btn btn-warning ml-1"
                            onClick={this.routeCreator.bind(this, template)} data-tip="Edit Template">
                            <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                        <button className="btn btn-danger ml-1"
                            onClick={this.confirmationModal.bind(this, template)} data-tip="Remove Template">
                            <i className="fa fa-times" aria-hidden="true" />
                        </button>
                        <ReactTooltip />
                    </td>
                </tr>
            );
        });
    }

    routeCreator(template) {
        window.open(ROUTES.TEMPLATES_CREATOR + '/' + template._id);
    }

    render() {
        return (
            <div>
                <button type="button" className="btn btn-default" data-tip="Templates" href="#" onClick={this.toggleModal}>
                    Templates
                </button>
                <Modal isOpen={this.state.templates} contentLabel="TemplatesModal" style={this.styleSet}>
                    <div className="panel panel-primary" onSubmit={this.save}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Templates
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.toggleModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        {
                            this.props.isReady &&
                            <div className="panel-body p-2">
                                <table className="table">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col">Template Name</th>
                                            <th scope="col">
                                                <form className="input-group mb-2 mr-sm-2" onSubmit={this.props.searchTemplate}>
                                                    <input type="text" className="form-control" placeholder="Search" name="search" value={this.props.search} onChange={this.props.changeSearch} />
                                                    <div className="input-group-prepend">
                                                        <Button type="submit" className="btn btn-primary input-group-text"><i className="fa fa-search" /></Button>
                                                    </div>
                                                </form>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.renderTemplates()}
                                    </tbody>
                                </table>
                                <hr />
                                <button onClick={this.routeCreator.bind(this, { id: 0 })} className="btn btn-primary ml-1 pull-right" type="button">
                                    <i className="fa fa-plus" aria-hidden="true" /> New
                                </button>
                                {
                                    !this.props.isMax &&
                                    <button onClick={this.props.viewMore} className="btn btn-default pull-right" type="button">
                                        View More
                                    </button>
                                }
                            </div>
                        }
                        {
                            !this.props.isReady &&
                            <div className="panel-body p-2 text-center">
                                <i className="fa fa-circle-o-notch fa-spin" /> Loading...
                            </div>
                        }
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.confirmation}
                    style={this.styleSetSmall}
                    contentLabel="TemplateConfirmationModal"
                >
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Template Deletion
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.confirmationModal}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <h3>
                                You are going to remove a Template. Continue?
                            </h3>
                            <Button className="btn btn-danger" onClick={this.deleteTemplate} type="button">
                                Yes
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

Templates.propTypes = {
    Message: PropTypes.object,
    templates: PropTypes.array,
    isReady: PropTypes.bool,
    isMax: PropTypes.bool,
    viewMore: PropTypes.func,
    searchTemplate: PropTypes.func,
    changeSearch: PropTypes.func,
    search: PropTypes.string,
    setTemplate: PropTypes.func
};

export default withTracker((props) => {
    let templates = TemplatesDB.find({}).fetch();
    return {
        isReady: Meteor.subscribe(ValidTemplates, props.template.search, props.limit).ready(),
        templates,
        isMax: props.limit >= (templates[0] ? templates[0].max : 0)
    };
})(Templates);