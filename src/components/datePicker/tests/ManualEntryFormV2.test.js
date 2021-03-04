import React from 'react';
import { render } from '@testing-library/react';
import moment from 'moment';
import * as metricsHelpers from 'src/helpers/metrics';
import { ManualEntryForm } from '../ManualEntryFormV2';
import styles from '../ManualEntryFormNew.module.scss';
import { TestApp } from 'src/__testHelpers__';

describe('Component: DatePicker ManualEntryForm(new)', () => {
  const defaultProps = {
    selectDates: jest.fn(),
    onEnter: jest.fn(),
    now: moment('2018-01-15T12:00:00'),
    to: moment('2018-01-15T11:00:00'),
    from: moment('2018-01-10T11:00:00'),
    roundToPrecision: true,
    timezone: 'America/New_York',
    styles,
  };

  const subject = (props = {}, mount = render) => {
    const mergedProps = { ...defaultProps, ...props };
    metricsHelpers.getValidDateRange = jest.fn(() => ({
      from: mergedProps.from,
      to: mergedProps.to,
    }));
    metricsHelpers.getPrecision = jest.fn(() => 'hour');
    return mount(
      <TestApp>
        <ManualEntryForm {...mergedProps} />
      </TestApp>,
    );
  };

  it('should sync props to state', () => {
    const { getByTestId } = subject({
      from: moment('2018-01-10T10:00:00'),
      to: moment('2018-01-15T14:00:00'),
    });
    expect(getByTestId('fromDate')).toHaveValue('2018-01-10');
    expect(getByTestId('fromTime')).toHaveValue('10:00am');
    expect(getByTestId('toDate')).toHaveValue('2018-01-15');
    expect(getByTestId('toTime')).toHaveValue('2:00pm');
  });

  it('should not show precision when rounding is disabled', () => {
    const { queryByTestId } = subject({
      roundToPrecision: false,
    });
    expect(queryByTestId('precision-label')).not.toBeInTheDocument();
  });

  it('should disable time picker if precision is day (time difference > 2 days)', () => {
    const { getByTestId } = subject({
      from: moment('2018-01-10T10:00:00'),
      to: moment('2018-01-15T14:00:00'),
    });
    expect(getByTestId('fromTime')).toHaveAttribute('disabled');
    expect(getByTestId('toTime')).toHaveAttribute('disabled');
  });

  it('should disable time picker if precision is explicitly set to day', () => {
    const { getByTestId } = subject({
      from: moment('2018-01-10T10:00:00'),
      to: moment('2018-01-15T14:00:00'),
      selectedPrecision: 'day',
      defaultPrecision: 'day',
    });

    expect(getByTestId('fromTime')).toHaveAttribute('disabled');
    expect(getByTestId('toTime')).toHaveAttribute('disabled');
  });

  it('should enable time picker if precision is minutes or hours (time difference <= 2 days)', () => {
    const { getByTestId } = subject({
      from: moment('2018-01-10T10:00:00'),
      to: moment('2018-01-12T10:00:00'),
    });

    expect(getByTestId('fromTime')).not.toHaveAttribute('disabled');
    expect(getByTestId('toTime')).not.toHaveAttribute('disabled');
  });
});
