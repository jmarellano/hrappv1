import React, { Component } from 'react';
import { COUNTRIES } from '../../../api/classes/Const';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Modal from '../extras/Modal';
import Button from '../extras/Button';

class Global extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: false,
            save: false,
            interval: this.props.settings.emailGetInterval,
            country: this.props.settings.country,
            processing: false
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
                maxHeight: '260px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.close = this.close.bind(this);
        this.openSettings = this.openSettings.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    saveSettings(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Settings.save({ interval: this.state.interval, country: this.state.country }, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else {
                Bert.alert('Changes are saved!', 'success', 'growl-top-right');
                this.setState({ settings: false, save: false });
            }
            this.setState({ processing: false });
        })
    }

    openSettings() {
        this.setState({ settings: true });
    }

    close() {
        this.setState({ settings: false, save: false, processing: false });
    }

    renderCountries() {
        return COUNTRIES.map((country, index) => {
            return (<option key={index} value={index}>{country.name}</option>);
        });
    }

    handleChangeInput(event) {
        const target = event.target;
        if (target) {
            const value = target.type === 'checkbox' ? target.checked : target.value;
            if (this.setState)
                this.setState({ [target.name]: value, save: true });
        }
    }

    render() {
        return (
            <div>
                <a className="nav-link" data-tip="Global Settings" href="#" onClick={this.openSettings}>
                    <i className="fa fa-2x fa-cog" aria-hidden="true" />
                </a>
                <Modal isOpen={this.state.settings} contentLabel="SettingsModal" style={this.styleSet}>
                    <div className="panel panel-primary">
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Global Settings
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.close}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <form className="panel-body" onSubmit={this.saveSettings}>
                                Email retrieve time interval:
                                <input type="number" min="0" step="1" value={this.state.interval} name="interval" className="mb-1 form-control" onChange={this.handleChangeInput} placeholder="Interval" required />
                                Country:
                                <select value={this.state.country} name="country" className="mb-1 form-control" onChange={this.handleChangeInput} placeholder="Country" required>
                                    <option value={null} disabled>Select Country</option>
                                    {this.renderCountries()}
                                </select><br />
                                {this.state.save && <Button className="btn btn-warning" type="submit" processing={this.state.processing}>Save</Button>}
                            </form>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

Global.propTypes = {
    settings: PropTypes.object,
    Settings: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Global);