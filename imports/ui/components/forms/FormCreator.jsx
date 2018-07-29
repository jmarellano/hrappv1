import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { TMQFormBuilder } from '../extras/TMQFormBuilder.js';
import { ROUTES } from '../../../api/classes/Const';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';

class FormCreator extends React.Component {
    constructor() {
        super();
        this.state = {
            option: 'true',
            processing: false,
            loading: false
        };
        this.formbuilder = null;
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount() {
        this.setState({ loading: true });
        this.props.Form.getForm({ id: this.props.id, applicant: null }, (err, form) => {
            form = form.form;
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                let submit = (e) => {
                    e.preventDefault();
                    this.setState({ processing: true });
                    this.props.Form.save({ id: this.props.id, formBuilder: this.formBuilder }, (error, data) => {
                        if (error)
                            Bert.alert(error.reason, 'danger', 'growl-top-right');
                        else
                            Bert.alert(data, 'success', 'growl-top-right', 'fa-check');
                        this.setState({ processing: false });
                    });
                };
                this.formBuilder = new TMQFormBuilder(submit);
                if (form)
                    this.formBuilder.loadData(JSON.parse(form.template[form.template.length - 1]), false);
            }
            this.setState({ loading: false });
        });
    }
    handleOptionChange(e) {
        this.setState({
            option: e.currentTarget.value
        });
    }
    onSubmit(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Form.save({ id: this.props.id, formBuilder: this.formBuilder }, (err, id) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                Bert.alert('Form Saved.', 'success', 'growl-top-right', 'fa-check');
                if (!this.props.id.length)
                    this.props.history.replace(id);
            }
            this.setState({ processing: false });
        });
    }
    exec(text) {
        document.execCommand(text);
    }
    render() {
        return (
            <div className="container-fluid">
                <form id="tmq-form-builder" onSubmit={this.onSubmit} className="main" style={{ width: '785px' }}>
                    <div id="tmq-form-builder-form-title">
                        <input id="form-title" type="text" defaultValue="Untitled Form" required />
                        <button type="button" className="form-options" onClick={this.exec.bind(this, 'italic')}><b>I</b></button>
                        <button type="button" className="form-options" onClick={this.exec.bind(this, 'bold')}><b>B</b></button>
                        <span className="form-options">
                            Editable
                        </span>
                        <input
                            className="form-options"
                            type="radio"
                            id="options"
                            name="options"
                            checked={this.state.option === "false"}
                            onChange={this.handleOptionChange.bind(this)}
                            value="false"
                        />
                        <span className="form-options">
                            Sortable
                        </span>
                        <input
                            className="form-options"
                            type="radio"
                            name="options"
                            id="options"
                            checked={this.state.option === "true"}
                            onChange={this.handleOptionChange.bind(this)}
                            value="true"
                        />
                    </div>
                    <div id="tmq-form-builder-content">
                        <div id="tmq-form-builder-left">
                            <div className="tmq-form-builder-tools-title">
                                Basic Tools
                            </div>
                            <div className="tmq-form-builder-tools" data-form="heading" >
                                <i className="fa fa-header" aria-hidden="true" />  Heading &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="textfield" >
                                <img src="/img/forms/textfield.png" className="icon-image" /> Textfield &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="emailfield" >
                                <i className="fa fa-at" aria-hidden="true" /> Email Field &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="textarea" >
                                <img src="/img/forms/textarea.gif" className="icon-image" /> Textarea &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="dropdown" >
                                <img src="/img/forms/dropdown.png" className="icon-image" /> Dropdown &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="radio" >
                                <img src="/img/forms/radio.png" className="icon-image" /> Radio Button &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="checkbox" >
                                <img src="/img/forms/checkbox.png" className="icon-image" /> Checkbox &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="date" >
                                <i className="fa fa-calendar" aria-hidden="true" /> Date Picker &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="paragraph" >
                                <i className="fa fa-paragraph" aria-hidden="true" /> Paragraph &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools" data-form="image" >
                                <i className="fa fa-picture-o" aria-hidden="true" /> Image &nbsp;
                                <span className="pull-right"><img src="/img/forms/drag.png" className="icon-image" /></span>
                            </div>
                            <div className="tmq-form-builder-tools-title">
                                Edit Field Properties
                            </div>
                            <div className="tmq-form-builder-tools-content">
                                <div id="form-properties">
                                    Form Description: <br />
                                    <textarea id="form-description" rows="3" />
                                    <input type="text" id="form-submit" defaultValue="Submit" /><br />
                                    <button type="submit" className={this.state.processing ? 'btn disabled' : 'btn btn-primary'}>
                                        {this.state.processing ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ul id="tmq-form-builder-center">
                            {this.state.loading && <div><i className="fa fa-circle-o-notch fa-spin" /> Loading...</div>}
                        </ul>
                        <div className="clear" />
                    </div>

                    <div id="myModal" className="modal">

                        <div className="modal-content">
                            <div className="modal-header">
                                <span className="close">&times;</span>
                            </div>
                            <div className="modal-body">

                            </div>
                        </div>

                    </div>

                </form>
            </div>
        );
    }
}
FormCreator.propTypes = {
    Form: PropTypes.object,
    id: PropTypes.string,
    history: PropTypes.object
};

export default withTracker((props) => {
    const match = matchPath(props.location.pathname, {
        path: '/:component/:data',
        exact: false,
        strict: false
    });
    let path = '',
        id = '';
    if (!match)
        props.history.replace(ROUTES.FORMS_NOT_FOUND);
    else {
        path = match.params.data;
        id = (path !== '0') ? path : '';
    }
    return {
        user: Meteor.user(),
        id
    };
})(FormCreator);
