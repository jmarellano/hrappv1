import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { ROUTES } from '../../../api/classes/Const';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import Button from '../extras/Button';
import CustomToolbar from '../extras/custom-toolbar2';

class TemplateCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            stateValue: '',
            id: '',
            selection: null,
            lastCaretPos: 0,
            parentNode: null,
            range: null,
            processing: false
        };
        this.handleEditorChange = this.handleEditorChange.bind(this);
        this.emailMessage = '';
        this.modules = {
            toolbar: {
                container: '.reactQuillToolbar1',
            }
        };
        this.formats = [
            'header', 'font', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent', 'align', 'code-block', 'script',
            'link', 'image', 'video', 'color', 'background'
        ];
    }
    componentDidMount() {
        if (this.props.id !== '')
            this.props.Message.getTemplate(this.props.id, (err, data) => {
                if (data)
                    this.setState({ stateValue: data.template, name: data.name, id: data._id._str });
                else
                    this.props.history.replace('../' + ROUTES.TEMPLATES_NOT_FOUND);
            });
    }

    handleName(e) {
        this.setState({ name: e.target.value });
    }

    saveTemplate(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Message.saveTemplate({ id: this.props.id, name: this.state.name, template: this.state.stateValue }, (err, id) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                Bert.alert('Template saved!', 'success', 'growl-top-right');
                if (!this.props.id.length)
                    this.props.history.replace(id);
            }
            this.setState({ processing: false });

        });
    }

    addCode(code) {
        this.setState({
            stateValue: this.state.stateValue + '{{' + code + '}}'
        });
    }
    handleEditorChange(data) {
        this.setState({
            stateValue: data
        });
    }
    render() {
        return (
            <div className="container-fluid">
                <form className="col-md-12 p-xs mt-2 mb-2" onSubmit={this.saveTemplate.bind(this)}>
                    <div className="row">
                        <div className="col-md-2">
                            <input type="text" className="form-control" onChange={this.handleName.bind(this)} name="name" value={this.state.name} placeholder="Template Name" required />
                        </div>
                        <div className="col-md-10">
                            Codes:
                            <span className="link badge badge-success m-2" onClick={this.addCode.bind(this, "staff_name")}>Staff Name</span>
                            <span className="link badge badge-success m-2" onClick={this.addCode.bind(this, "applicant_name")}>Applicant Name</span>
                            <span className="link badge badge-success m-2" onClick={this.addCode.bind(this, "current_date")}>Current Date</span>
                            <span className="link badge badge-success m-2" onClick={this.addCode.bind(this, "application_position")}>Application Position</span>
                            <Button className="btn btn-primary" type="submit" processing={this.state.processing}>Save Template</Button>
                        </div>
                    </div>
                </form>
                <div className="col-md-12 template-creator">
                    <CustomToolbar />
                    <ReactQuill
                        onChange={this.handleEditorChange.bind(this)}
                        modules={this.modules}
                        formats={this.formats}
                        theme={"snow"}
                        value={this.state.stateValue}
                        style={{ height: "calc(100vh - 100px)", marginBottom: "5px" }}
                    />
                </div>
            </div>
        )
    }
}

TemplateCreator.propTypes = {
    Message: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object,
    id: PropTypes.any
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
        props.history.replace(ROUTES.TEMPLATES_NOT_FOUND);
    else {
        path = match.params.data;
        id = (path !== '0') ? path : '';
    }
    return {
        id,
    };
})(TemplateCreator);