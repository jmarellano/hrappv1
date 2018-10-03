import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

class DropdownSelect extends React.Component {
  constructor() {
    super();
    this.state = {
      options: false
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.change = this.change.bind(this);
  }

  onFocus() {
    this.setState({ options: true });
  }

  onBlur() {
    setTimeout(() => {
      this.setState({ options: false });
    }, 200);
  }

  renderGroups() {
    return this.props.options.map((group, index) => {
      let options = [...new Set(group.options.map(item => item.value))];
      let checked = true;
      options.forEach(item => {
        if (this.props.value && this.props.value.indexOf(item) > -1) return;
        checked = false;
      });
      return (
        <div key={index}>
          <a
            href="#"
            className={'list-group-item list-group-item-action pl-2'}
            key={index}
            onClick={() => {
              this.change(options, !checked);
            }}
          >
            <input type="checkbox" checked={checked} readOnly />{' '}
            <b>{group.label}</b>
          </a>
          {this.renderOptions(group)}
        </div>
      );
    });
  }

  renderValue() {
    let value = '';
    this.props.options.forEach(group => {
      let options = [...new Set(group.options.map(item => item.value))];
      let checked = true;
      options.forEach(item => {
        if (this.props.value && this.props.value.indexOf(item) > -1) return;
        checked = false;
      });
      if (checked)
        value = value + (value.length > 0 ? ', ' : ' ') + group.label;
      else value = this.renderValueOptions(group, value);
    });
    return value;
  }

  renderValueOptions(group, value) {
    group.options.forEach(option => {
      if (this.props.value && this.props.value.indexOf(option.value) > -1)
        value = value + (value.length > 0 ? ', ' : ' ') + option.label;
    });
    return value;
  }

  renderOptions(group) {
    return group.options.map((option, index) => {
      let checked =
        this.props.value && this.props.value.indexOf(option.value) > -1;
      return (
        <a
          href="#"
          className={'list-group-item list-group-item-action'}
          key={index}
          onClick={() => {
            this.change([option.value], !checked);
          }}
        >
          <input type="checkbox" checked={checked} readOnly />{' '}
          {option.element || option.label}{' '}
          <small className="pull-right">({group.label}) </small>
        </a>
      );
    });
  }

  change(ids, checked) {
    let values = this.props.value;
    ids.forEach(id => {
      if (!checked) values.splice(values.indexOf(id), 1);
      else if (values.indexOf(id) < 0) values.push(id);
    });
    this.props.onChange(values);
  }

  render() {
    return (
      <div className={this.props.className || ''}>
        <input
          type="text"
          name={this.props.name || ''}
          className={'form-control dropdown-multi text-right pr-4'}
          disabled={this.props.disabled || false}
          value={this.renderValue()}
          readOnly={true}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
        <span className="caret">
          <i className="fa fa-sort-down" />
        </span>
        <div
          style={{ display: this.state.options ? 'block' : 'none' }}
          className="dropdown-multi-options"
        >
          {this.renderGroups()}
        </div>
      </div>
    );
  }
}
DropdownSelect.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  value: PropTypes.any
};
export default withTracker(() => {
  return {};
})(DropdownSelect);
