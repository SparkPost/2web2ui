/* eslint max-lines: ["error", 200] */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { subMonths, format } from 'date-fns';
import { getStartOfDay, getEndOfDay, relativeDateOptions } from 'src/helpers/date';
import { refreshReportOptions } from 'src/actions/reportOptions';
import { Button, Datepicker, TextField, Select, Popover } from '@sparkpost/matchbox';
import DateForm from './DateForm';
import styles from './DateFilter.module.scss';

export class DateFilter extends Component {
  format = 'MMM D YYYY h:mma';
  state = {
    showDatePicker: false,
    selecting: false,
    selected: { }
  }

  componentDidMount() {
    this.syncPropsToState(this.props);
    window.addEventListener('click', this.handleClickOutside);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    this.syncPropsToState(nextProps);
  }

  // Sets local state from reportOptions redux state - need to separate to handle pre-apply state
  syncPropsToState = ({ filter }) => {
    this.setState({ selected: { from: filter.from, to: filter.to }});
  }

  // Closes popover when clicking outside
  handleClickOutside = (e) => {
    const domNode = ReactDOM.findDOMNode(this);
    if ((!domNode || !domNode.contains(e.target))) {
      this.setState({ showDatePicker: false });
    }
  }

  // Closes popover on escape, submits on enter
  handleKeyDown = (e) => {
    if (!this.state.showDatePicker) {
      return;
    }

    if (e.key === 'Escape') {
      this.cancelDatePicker();
    }

    if (!this.state.selecting && e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  handleDayKeyDown = (day, modifiers, e) => {
    this.handleKeyDown(e);
    e.stopPropagation();
  }

  cancelDatePicker = () => {
    this.syncPropsToState(this.props);
    this.setState({ showDatePicker: false });
  }

  showDatePicker = () => {
    this.setState({ showDatePicker: true });
  }

  handleDayClick = (clicked) => {
    const { selecting, selected } = this.state;
    const dates = selecting
      ? selected
      : { from: getStartOfDay(clicked), to: getEndOfDay(clicked, { preventFuture: true }) };

    this.setState({
      selected: dates,
      beforeSelected: dates,
      selecting: !selecting
    });
  }

  handleDayHover = (hovered) => {
    const { selecting } = this.state;

    if (selecting) {
      this.setState({ selected: { ...this.getOrderedRange(hovered) }});
    }
  }

  getOrderedRange(newDate) {
    const { from, to } = this.state.beforeSelected;
    return (from.getTime() <= newDate.getTime())
      ? { from, to: getEndOfDay(newDate, { preventFuture: true }) }
      : { from: getStartOfDay(newDate), to };
  }

  handleSelectRange = (e) => {
    const value = e.currentTarget.value;

    if (value === 'custom') {
      this.setState({ showDatePicker: true });
    } else {
      this.setState({ showDatePicker: false });
      this.props.refreshReportOptions({ relativeRange: value });
    }
  }

  handleFormDates = ({ from, to }, callback) => {
    this.setState({ selected: { from, to }}, () => callback());
  }

  handleSubmit = () => {
    this.setState({ showDatePicker: false, selecting: false });
    this.props.refreshReportOptions({ ...this.state.selected, relativeRange: 'custom' });
  }

  render() {
    const { selected: { from, to }, showDatePicker } = this.state;
    const selectedRange = showDatePicker ? 'custom' : this.props.filter.relativeRange;

    // allow for prop-level override of "now" (DI, etc.)
    const { now = new Date() } = this.props;

    const rangeSelect = <Select
      options={relativeDateOptions}
      onChange={this.handleSelectRange}
      value={selectedRange}
      disabled={this.props.reportLoading} />;

    const dateField = <TextField
      labelHidden={true}
      onClick={this.showDatePicker}
      connectLeft={rangeSelect}
      value={`${format(from, this.format)} - ${format(to, this.format)}`}
      readOnly />;

    return (
      <Popover
        wrapper='div'
        className={styles.Popover}
        manualTrigger
        trigger={dateField}
        open={this.state.showDatePicker} >

        <Datepicker
          numberOfMonths={2}
          fixedWeeks
          enableOutsideDays={false}
          initialMonth={subMonths(now, 1)}
          toMonth={now}
          disabledDays={{ after: now }}
          onDayClick={this.handleDayClick}
          onDayMouseEnter={this.handleDayHover}
          onDayFocus={this.handleDayHover}
          onKeyDown={this.handleKeyDown}
          onDayKeyDown={this.handleDayKeyDown}
          selectedDays={this.state.selected}
        />

        <DateForm selectDates={this.handleFormDates} onEnter={this.handleKeyDown} to={to} from={from} />
        <Button primary onClick={this.handleSubmit} className={styles.Apply}>Apply</Button>
        <Button onClick={this.cancelDatePicker}>Cancel</Button>
      </Popover>
    );
  }
}

const mapStateToProps = ({ reportOptions }) => ({ filter: reportOptions });
export default connect(mapStateToProps, { refreshReportOptions })(DateFilter);
