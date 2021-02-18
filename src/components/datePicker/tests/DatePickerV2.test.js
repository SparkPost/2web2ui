import React from 'react';
import { render, screen } from '@testing-library/react';
import { DatePicker } from '../DatePickerV2';
import styles from '../DatePicker.module.scss';
import utc from 'src/__testHelpers__/time';
import TestApp from 'src/__testHelpers__/TestApp';

jest.mock('react-dom');

describe('Component: DatePicker', () => {
  const mockNow = utc({ year: 2019, month: 2, day: 15, hour: 12 });
  const mockFrom = utc({ year: 2019, month: 2, day: 14, hour: 11 });
  Date.now = jest.fn(() => mockNow);

  const defaultProps = {
    id: 'date-picker',
    from: mockFrom,
    to: mockNow,
    label: 'Date Picker',
    relativeRange: 'custom',
    relativeDateOptions: ['day', '7days', '30days', '90days', 'custom'],
    onChange: jest.fn(),
    onBlur: jest.fn(),
    now: mockNow,
    disabled: false,
    preventFuture: true,
    roundToPrecision: true,
    styles,
  };

  const subject = props => {
    render(
      <TestApp isHibanaEnabled={true}>
        <DatePicker {...defaultProps} {...props} />
      </TestApp>,
    );
  };

  it('should render correctly', () => {
    subject();
    screen.getByLabelText('Date Picker').click();
    expect(screen.getByLabelText('Date Picker')).toHaveAttribute(
      'value',
      'Feb 14th 2019 6:00am – Feb 15th 2019 7:00am',
    );
    expect(screen.getByLabelText('From Date')).toBeInTheDocument();
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByLabelText('From Date')).toHaveAttribute('value', '2019-02-14');
    expect(screen.getByLabelText('From Time')).toHaveAttribute('value', '6:00am');
    expect(screen.getByLabelText('To Date')).toHaveAttribute('value', '2019-02-15');
    expect(screen.getByLabelText('To Time')).toHaveAttribute('value', '7:00am');
  });

  it('should render based on the timezone specified', () => {
    subject({ timezone: 'Europe/Paris' });
    screen.getByLabelText('Date Picker').click();
    expect(screen.getByLabelText('Date Picker')).toHaveAttribute(
      'value',
      'Feb 14th 2019 12:00pm – Feb 15th 2019 1:00pm',
    );
    expect(screen.getByLabelText('From Date')).toHaveAttribute('value', '2019-02-14');
    expect(screen.getByLabelText('From Time')).toHaveAttribute('value', '12:00pm');
    expect(screen.getByLabelText('To Date')).toHaveAttribute('value', '2019-02-15');
    expect(screen.getByLabelText('To Time')).toHaveAttribute('value', '1:00pm');
  });

  it('should change date range correctly', () => {
    subject();
    screen.getByLabelText('Date Picker').click();
    screen.getByText('Last 7 Days').click();
    screen.getByRole('button', { name: 'Apply' }).click();
    expect(screen.queryByText('Last 7 Days')).not.toBeVisible();
    expect(screen.getByLabelText('Date Picker')).toHaveAttribute(
      'value',
      'Feb 8th 2019 7:00am – Feb 15th 2019 7:00am',
    );
  });

  it('should change date range correctly when given valid precision option', () => {
    subject({ precision: 'day', selectPrecision: true });
    screen.getByLabelText('Date Picker').click();
    screen.getByText('Last 7 Days').click();
    screen.getByRole('button', { name: 'Apply' }).click();
    expect(screen.queryByText('Last 7 Days')).not.toBeVisible();
    expect(screen.getByLabelText('Date Picker')).toHaveAttribute(
      'value',
      'Feb 8th 2019 12:00am – Feb 15th 2019 7:00am',
    );
  });

  it('should change date range correctly using recommended precision if given precision is not an option', () => {
    subject({ precision: '15min', selectPrecision: true });
    screen.getByLabelText('Date Picker').click();
    screen.getByText('Last 7 Days').click();
    screen.getByRole('button', { name: 'Apply' }).click();
    expect(screen.queryByText('Last 7 Days')).not.toBeVisible();
    expect(screen.getByLabelText('Date Picker')).toHaveAttribute(
      'value',
      'Feb 8th 2019 7:00am – Feb 15th 2019 7:00am',
    );
  });
});
