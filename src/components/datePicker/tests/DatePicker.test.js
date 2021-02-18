import React from 'react';
import { shallow } from 'enzyme';
import _ from 'lodash';
import * as dateHelpers from 'src/helpers/date';
import * as metricsHelpers from 'src/helpers/metrics';
import * as dateFns from 'date-fns';
import moment from 'moment';
import { DatePickerClassComponent as DatePicker } from '../DatePicker';
import styles from '../DatePicker.module.scss';
import utc from 'src/__testHelpers__/time';

jest.mock('src/context/HibanaContext');
jest.mock('src/helpers/date');
jest.mock('react-dom');
jest.mock('date-fns');

describe('Component: DatePicker', () => {
  let wrapper;
  let instance;
  let props;
  let mockNow;
  let mockFrom;

  beforeEach(() => {
    mockNow = utc({ year: 2017, month: 1, day: 15, hour: 12 });
    mockFrom = utc({ year: 2017, month: 1, day: 15, hour: 11 });
    props = {
      id: 'date-picker',
      from: mockFrom,
      to: mockNow,
      relativeRange: 'day',
      relativeDateOptions: [],
      onChange: jest.fn(),
      onBlur: jest.fn(),
      now: mockNow,
      disabled: false,
      preventFuture: true,
      roundToPrecision: true,
      styles,
    };

    dateHelpers.getStartOfDay = jest.fn(() => 'start-of-day');
    dateHelpers.getNextHour = jest.fn(() => 'next-hour');
    dateHelpers.getEndOfDay = jest.fn(() => 'end-of-day');
    dateHelpers.isSameDate = jest.fn(() => false);
    metricsHelpers.roundBoundaries = jest.fn(() => ({
      from: moment(mockFrom),
      to: moment(mockNow),
    }));
    metricsHelpers.getRollupPrecision = jest.fn(({ precision }) => precision);
    dateHelpers.getRelativeDateOptions = jest.fn(() => [1, 2, 3]);
    dateFns.format = jest.fn((a, b) => b);
    dateFns.subMonths = jest.fn(a => a);
    wrapper = shallow(<DatePicker {...props} />);
    instance = wrapper.instance();

    // spy on all instance methods
    _.functions(instance).forEach(f => jest.spyOn(instance, f));
  });

  it('should render ok by default', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render range select if showPresets is false', () => {
    wrapper.setProps({ showPresets: false });
    expect(wrapper.find('Popover').prop('trigger')).toMatchSnapshot();
  });

  it('should properly mount', () => {
    jest.spyOn(window, 'addEventListener');

    instance.componentDidMount();
    expect(instance.syncTimeToState).toHaveBeenCalledTimes(1);
  });

  it('should not render form fields when manual entry is hidden', () => {
    wrapper.setProps({ hideManualEntry: true });
    expect(wrapper.find('ManualEntryForm')).not.toExist();
  });

  describe('syncTimeToState', () => {
    const before = { from: 'unchanged', to: 'unchanged' };
    const after = { from: new Date(), to: new Date() };

    it('should sync the state when from or to is changed', () => {
      wrapper.setState({ selected: before });
      expect(wrapper.state('selected')).toEqual(before);
      wrapper.setProps(after);
      expect(instance.syncTimeToState).toHaveBeenCalledTimes(1);
      expect(wrapper.state('selected')).toEqual(after);
    });

    it("shouldn't sync the state when from and to aren't changed", () => {
      wrapper.setState({ selected: before });
      wrapper.setProps({ other: 'stuff' });
      expect(instance.syncTimeToState).not.toHaveBeenCalled();
      expect(wrapper.state('selected')).toEqual(before);
    });

    it('should update precision when changed', () => {
      wrapper.setProps({ selectPrecision: true, precision: '5min' });
      wrapper.update();
      wrapper.setState({ selected: before, selectedPrecision: '5min' });
      wrapper.setProps({ precision: 'hour' });

      expect(instance.syncTimeToState).toHaveBeenCalled();
      expect(wrapper.state('selectedPrecision')).toEqual('hour');
    });
  });

  describe('updateShownPrecision', () => {
    const mockUpdateShownPrecision = jest.fn();

    it('should be called with internal state precision when it changes', () => {
      wrapper.setProps({ updateShownPrecision: mockUpdateShownPrecision, precision: '15min' });
      wrapper.update();
      wrapper.setState({ selectedPrecision: 'hour', showDatePicker: true });
      expect(mockUpdateShownPrecision).toHaveBeenCalledWith('hour');
    });

    it('should be called with empty string when the datepicker closes', () => {
      wrapper.setProps({ updateShownPrecision: mockUpdateShownPrecision, precision: '15min' });
      wrapper.setState({ showDatePicker: true });
      wrapper.update();
      wrapper.setState({ showDatePicker: false });
      wrapper.update();
      expect(mockUpdateShownPrecision).toHaveBeenCalledWith('');
    });
  });

  describe('handleKeyDown', () => {
    const ESCAPE = { key: 'Escape' };
    const ENTER = { key: 'Enter' };

    it('should do nothing if picker is closed already', () => {
      wrapper.setState({ showDatePicker: false });
      instance.handleKeyDown(ESCAPE);
      expect(instance.cancelDatePicker).not.toHaveBeenCalled();
      expect(instance.handleSubmit).not.toHaveBeenCalled();
      expect(wrapper.state('showDatePicker')).toEqual(false);
    });

    it('should cancel date picker on escape keydown', () => {
      wrapper.setState({ showDatePicker: true });
      instance.handleKeyDown(ESCAPE);
      expect(instance.cancelDatePicker).toHaveBeenCalledTimes(1);
      expect(instance.handleSubmit).not.toHaveBeenCalled();
      expect(wrapper.state('showDatePicker')).toEqual(false);
    });

    it('should submit on enter', () => {
      wrapper.setState({ showDatePicker: true, selecting: false });
      instance.handleKeyDown(ENTER);
      expect(instance.cancelDatePicker).not.toHaveBeenCalled();
      expect(instance.handleSubmit).toHaveBeenCalledTimes(1);
      expect(wrapper.state('showDatePicker')).toEqual(false);
    });

    it('should not submit if selecting is true', () => {
      wrapper.setState({ showDatePicker: true, selecting: true });
      instance.handleKeyDown(ENTER);
      expect(instance.cancelDatePicker).not.toHaveBeenCalled();
      expect(instance.handleSubmit).not.toHaveBeenCalled();
      expect(wrapper.state('showDatePicker')).toEqual(true);
    });
  });

  describe('handleDayKeyDown', () => {
    it('should stop propagation on a day key down event', () => {
      const e = { stopPropagation: jest.fn() };
      const x = '';
      instance.handleDayKeyDown(x, x, e);
      expect(instance.handleKeyDown).toHaveBeenCalledWith(e);
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleTextUpdate', () => {
    it('should call props.onBlur if it exists', () => {
      instance.handleTextUpdate();
      expect(props.onBlur).toHaveBeenCalled();
    });

    it('should do nothing if props.onBlur does not exist', () => {
      wrapper.setProps({ onBlur: undefined });
      instance.handleTextUpdate();
      expect(props.onBlur).not.toHaveBeenCalled();
    });
  });

  describe('cancelDatePicker', () => {
    it('should sync props and close date picker', () => {
      wrapper.setState({ showDatePicker: true });
      instance.cancelDatePicker();
      expect(instance.syncTimeToState).toHaveBeenCalledWith(instance.props);
      expect(wrapper.state('showDatePicker')).toEqual(false);
    });
  });

  describe('showDatePicker', () => {
    it('should set date picker state', () => {
      wrapper.setState({ showDatePicker: false });
      instance.showDatePicker();
      expect(wrapper.state('showDatePicker')).toEqual(true);
    });
  });

  describe('handleDayClick', () => {
    it('should handle a day click while selecting', () => {
      const mockSelected = {};
      wrapper.setState({ selecting: true, selected: mockSelected, beforeSelected: null });
      instance.handleDayClick();
      expect(dateHelpers.getStartOfDay).not.toHaveBeenCalled();
      expect(wrapper.state('selected')).toBe(mockSelected);
      expect(wrapper.state('beforeSelected')).toBe(mockSelected);
      expect(wrapper.state('selecting')).toEqual(false);
    });

    it('should handle a day click when not selecting (start of day)', () => {
      const mockSelected = {};
      const mockClicked = {};

      wrapper.setState({ selecting: false, selected: mockSelected, beforeSelected: null });
      const mockNewSelected = { from: 'start-of-day', to: 'end-of-day' };

      instance.handleDayClick(mockClicked);

      expect(dateHelpers.getStartOfDay).toHaveBeenCalledWith(mockClicked);
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(3);
      expect(dateHelpers.getEndOfDay).toHaveBeenCalledWith(mockClicked, { preventFuture: true });
      expect(wrapper.state('selected')).toEqual(mockNewSelected);
      expect(wrapper.state('beforeSelected')).toEqual(mockNewSelected);
      expect(wrapper.state('selecting')).toEqual(true);
    });

    it('should handle a day click when not selecting (next hour)', () => {
      const mockSelected = {};
      const mockClicked = {};

      dateHelpers.isSameDate = jest.fn(() => true);

      wrapper.setProps({ fromSelectsNextHour: true });
      wrapper.setState({ selecting: false, selected: mockSelected, beforeSelected: null });
      const mockNewSelected = { from: 'next-hour', to: 'end-of-day' };

      instance.handleDayClick(mockClicked);

      expect(dateHelpers.getStartOfDay).toHaveBeenCalledWith(mockClicked);
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(2);
      expect(dateHelpers.getNextHour).toHaveBeenCalledWith(mockClicked);
      expect(dateHelpers.getEndOfDay).toHaveBeenCalledWith(mockClicked, { preventFuture: true });
      expect(wrapper.state('selected')).toEqual(mockNewSelected);
      expect(wrapper.state('beforeSelected')).toEqual(mockNewSelected);
      expect(wrapper.state('selecting')).toEqual(true);
    });

    it('should handle a day click with a validation error', () => {
      const validate = jest.fn(() => 'error oh no');
      const mockSelected = {};
      const mockClicked = {};

      dateHelpers.isSameDate = jest.fn(() => true);

      wrapper.setProps({ validate });
      wrapper.setState({ selecting: false, selected: mockSelected, beforeSelected: null });
      const mockNewSelected = { from: 'start-of-day', to: 'end-of-day' };

      instance.handleDayClick(mockClicked);
      expect(validate).toHaveBeenCalledWith(mockNewSelected);
      expect(wrapper.state('selecting')).toEqual(true);
    });
  });

  describe('handleDayHover', () => {
    it('should handle a day hover while selecting', () => {
      const mockOrderedRange = { from: 'from', to: 'to' };
      const mockHovered = {};
      instance.getOrderedRange = jest.fn(() => mockOrderedRange);
      wrapper.setState({ selecting: true });

      instance.handleDayHover(mockHovered);

      expect(instance.getOrderedRange).toHaveBeenCalledWith(mockHovered);
      expect(wrapper.state('selected')).toEqual(mockOrderedRange);
    });

    it('should handle a day hover when not selecting', () => {
      const mockHovered = {};
      const mockSelected = {};
      instance.getOrderedRange = jest.fn();
      wrapper.setState({ selecting: false, selected: mockSelected });

      instance.handleDayHover(mockHovered);

      expect(instance.getOrderedRange).not.toHaveBeenCalled();
      expect(wrapper.state('selected')).toEqual(mockSelected);
    });
  });

  describe('getOrderedRange', () => {
    it('should return correct range when new date is between from and to', () => {
      const from = new Date('2018-01-01');
      const newDate = new Date('2018-01-02');
      const to = new Date('2018-01-03');

      wrapper.setState({ beforeSelected: { from, to } });
      const range = instance.getOrderedRange(newDate);

      expect(dateHelpers.getEndOfDay).toHaveBeenCalledWith(newDate, { preventFuture: true });
      expect(dateHelpers.getStartOfDay).not.toHaveBeenCalled();
      expect(metricsHelpers.roundBoundaries).toHaveBeenCalledWith({ from, to: 'end-of-day' });
      expect(range).toEqual({ from: moment(mockFrom).toDate(), to: moment(mockNow).toDate() });
    });

    it('should round to precision if given', () => {
      const from = new Date('2018-01-01');
      const newDate = new Date('2018-01-02');
      const to = new Date('2018-01-03');

      wrapper.setProps({ selectPrecision: true, precision: 'hour' });
      wrapper.update();
      wrapper.setState({ beforeSelected: { from, to }, selectedPrecision: 'hour' });
      wrapper.update();
      const range = instance.getOrderedRange(newDate);

      expect(range).toEqual({
        from: moment(mockFrom).toDate(),
        to: moment(mockNow).toDate(),
        precision: 'hour',
      });
    });

    it('should return correct range when new date is before from and to (start of day)', () => {
      const newDate = new Date('2018-01-01');
      const from = new Date('2018-01-02');
      const to = new Date('2018-01-03');

      wrapper.setState({ beforeSelected: { from, to } });
      const range = instance.getOrderedRange(newDate);

      expect(dateHelpers.getEndOfDay).not.toHaveBeenCalled();
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledWith(newDate);
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(3);
      expect(metricsHelpers.roundBoundaries).toHaveBeenCalledWith({ from: 'start-of-day', to });
      expect(range).toEqual({ from: moment(mockFrom).toDate(), to: moment(mockNow).toDate() });
    });

    it('should return correct range when new date is before from and to (next hour)', () => {
      const newDate = new Date('2018-01-01');
      const from = new Date('2018-01-02');
      const to = new Date('2018-01-03');

      dateHelpers.isSameDate = jest.fn(() => true);

      wrapper.setProps({ fromSelectsNextHour: true });
      wrapper.setState({ beforeSelected: { from, to } });
      const range = instance.getOrderedRange(newDate);

      expect(dateHelpers.getEndOfDay).not.toHaveBeenCalled();
      expect(dateHelpers.getNextHour).toHaveBeenCalledWith(newDate);
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(2);
      expect(metricsHelpers.roundBoundaries).toHaveBeenCalledWith({ from: 'next-hour', to });
      expect(range).toEqual({ from: moment(mockFrom).toDate(), to: moment(mockNow).toDate() });
    });

    it('should return correct range when new date is after from and to', () => {
      const from = new Date('2018-01-01');
      const to = new Date('2018-01-02');
      const newDate = new Date('2018-01-03');

      wrapper.setState({ beforeSelected: { from, to } });
      const range = instance.getOrderedRange(newDate);

      expect(dateHelpers.getEndOfDay).toHaveBeenCalledWith(newDate, { preventFuture: true });
      expect(dateHelpers.getStartOfDay).not.toHaveBeenCalled();
      expect(metricsHelpers.roundBoundaries).toHaveBeenCalledWith({ from, to: 'end-of-day' });
      expect(range).toEqual({ from: moment(mockFrom).toDate(), to: moment(mockNow).toDate() });
    });

    it('should return correct range when from and newDate are the same', () => {
      const from = new Date('2018-01-01');
      const newDate = new Date('2018-01-01');
      const to = new Date('2018-01-03');

      wrapper.setState({ beforeSelected: { from, to } });
      const range = instance.getOrderedRange(newDate);

      expect(dateHelpers.getEndOfDay).toHaveBeenCalledWith(newDate, { preventFuture: true });
      expect(dateHelpers.getStartOfDay).not.toHaveBeenCalled();
      expect(metricsHelpers.roundBoundaries).toHaveBeenCalledWith({ from, to: 'end-of-day' });
      expect(range).toEqual({ from: moment(mockFrom).toDate(), to: moment(mockNow).toDate() });
    });
  });

  describe('handleSelectRange', () => {
    let e;

    beforeEach(() => {
      e = {
        currentTarget: {},
      };
    });

    it('should open date picker for custom value', () => {
      e.currentTarget.value = 'custom';
      wrapper.setState({ showDatePicker: false });
      instance.handleSelectRange(e);
      expect(wrapper.state('showDatePicker')).toEqual(true);
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should close date picker and refresh for non-custom value', () => {
      e.currentTarget.value = 'lasagna';
      wrapper.setState({ showDatePicker: true });
      instance.handleSelectRange(e);
      expect(wrapper.state('showDatePicker')).toEqual(false);
      expect(props.onChange).toHaveBeenCalledWith({ relativeRange: 'lasagna' });
    });
  });

  describe('handleFormDates', () => {
    it('should use a date field format if provided', () => {
      wrapper.setProps({ dateFieldFormat: 'YYYY-MM h' });
      expect(wrapper.find('Popover').props().trigger).toMatchSnapshot();
    });

    it('should set from and to state and call the passed in callback', () => {
      wrapper.setState({ selected: false });
      const mockCallback = jest.fn();
      const mockSelected = { from: 'from', to: 'to' };
      instance.handleFormDates(mockSelected, mockCallback);
      expect(wrapper.state('selected')).toEqual(mockSelected);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSubmit', () => {
    it('should reset some state and refresh', () => {
      const mockSelected = { a: 1, b: 2, c: 3 };
      wrapper.setState({
        showDatePicker: true,
        selecting: true,
        selected: mockSelected,
        selectedPrecision: 'hour',
      });
      instance.handleSubmit();
      expect(wrapper.state('showDatePicker')).toEqual(false);
      expect(wrapper.state('selecting')).toEqual(false);
      expect(props.onChange).toHaveBeenCalledWith({
        ...mockSelected,
        precision: 'hour',
        relativeRange: 'custom',
      });
    });

    it('should not do anything with a validation error', () => {
      const validate = jest.fn(() => 'error oh no');
      const mockSelected = { a: 1, b: 2, c: 3 };
      wrapper.setProps({ validate });
      wrapper.setState({
        showDatePicker: true,
        selecting: true,
        selected: mockSelected,
      });
      instance.handleSubmit();
      expect(wrapper.state('selecting')).toEqual(true);
      expect(wrapper.find('Popover')).toHaveProp('open', true);
      expect(validate).toHaveBeenCalled();
      expect(props.onChange).not.toHaveBeenCalled();
    });
  });

  describe('fromFormatter', () => {
    it('should format from date with getNextHour', () => {
      dateHelpers.isSameDate = jest.fn(() => true);
      wrapper.setProps({ fromSelectsNextHour: true });
      expect(instance.fromFormatter('from-date')).toEqual('next-hour');
      expect(dateHelpers.getNextHour).toHaveBeenCalledWith('from-date');
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(2);
    });

    it('should format from date with getStartOfDay (fromSelectsNextHour === false)', () => {
      dateHelpers.isSameDate = jest.fn(() => true);
      expect(instance.fromFormatter('from-date')).toEqual('start-of-day');
      expect(dateHelpers.getNextHour).not.toHaveBeenCalled();
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledWith('from-date');
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(3);
    });

    it('should format from date with getStartOfDay (isDateToday === false)', () => {
      wrapper.setProps({ fromSelectsNextHour: true });
      expect(instance.fromFormatter('from-date')).toEqual('start-of-day');
      expect(dateHelpers.getNextHour).not.toHaveBeenCalled();
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledWith('from-date');
      expect(dateHelpers.getStartOfDay).toHaveBeenCalledTimes(3);
    });
  });
});
