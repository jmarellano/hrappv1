import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Modal from '../extras/Modal';
import moment from 'moment-timezone';
import Button from '../extras/Button';
import PropTypes from 'prop-types';

class Timezone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timezoneModal: false,
            save: false,
            processing: false,
            timezone: props.user.default_timezone || moment.tz.guess()
        };
        this.styleSet = {
            overlay: {
                zIndex: '8888',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            content: {
                maxWidth: '200px',
                width: 'auto',
                height: 'auto',
                maxHeight: '170px',
                margin: '1% auto',
                padding: '0px'
            }
        };
        this.setDefault = this.setDefault.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    renderTimezones() {
        return moment.tz.names().map((timezone, index) => {
            return (<option key={index} value={timezone}>{timezone}</option>);
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

    setDefault(e) {
        e.preventDefault();
        this.setState({ processing: true });
        this.props.Account.setTimezone(this.state.timezone, (err) => {
            if (err)
                Bert.alert(err.reason, 'danger', 'growl-top-right');
            else
                Bert.alert('Default timezone set.', 'success', 'growl-top-right');
            this.setState({ save: false, processing: false });
        })
    }

    setTimezone(isTrue) {
        this.setState({ timezoneModal: isTrue });
    }

    render() {
        let save = this.state.save;
        return (
            <a className="nav-link" href="#" data-tip="Timezone" onClick={this.setTimezone.bind(this, true)}>
                <i className="fa fa-2x fa-globe" aria-hidden="true" />
                <Modal
                    isOpen={!!this.state.timezoneModal}
                    style={this.styleSet}
                    contentLabel="TimezoneModal"
                >
                    <form className="panel panel-primary" onSubmit={this.setDefault}>
                        <div className="panel-heading bg-secondary text-white p-2">
                            <div className="panel-title">
                                Timezone
                                <span className="pull-right">
                                    <a href="#" className="close-modal"
                                        onClick={this.setTimezone.bind(this, false)}>
                                        <i className="fa fa-remove" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="panel-body p-2">
                            <select className="form-control" name="timezone" onChange={this.handleChangeInput} value={this.state.timezone} required >
                                {this.renderTimezones()}
                            </select>
                            {save && <Button className="btn btn-warning mt-3 mb-3 form-control" type="submit" processing={this.state.processing}>Save</Button>}
                        </div>
                    </form>
                </Modal>
            </a>
        );
    }
}

Timezone.propTypes = {
    user: PropTypes.object,
    Account: PropTypes.object
};

export default withTracker(() => {
    return {};
})(Timezone);