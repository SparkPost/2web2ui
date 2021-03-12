import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestApp } from 'src/__testHelpers__';
import Tooltip from '../Tooltip';

const MOCK_PAYLOAD = [
  {
    strokeWidth: 2,
    stroke: '#1273e6',
    fill: '#fff',
    dataKey: 'count_sent',
    name: 'Sent',
    color: '#1273e6',
    value: 3000,
    payload: {
      count_sent: 3000,
      count_accepted: 2687,
      count_bounce: 294,
      ts: '2021-02-25T20:00:00-05:00',
      count_unique_confirmed_opened_approx: 2000,
    },
  },
  {
    strokeWidth: 2,
    stroke: '#13bebf',
    fill: '#fff',
    dataKey: 'count_unique_confirmed_opened_approx',
    name: 'Unique Confirmed Opens',
    color: '#13bebf',
    value: 2000,
    payload: {
      count_sent: 3000,
      count_accepted: 2687,
      count_bounce: 294,
      ts: '2021-02-25T20:00:00-05:00',
      count_unique_confirmed_opened_approx: 2000,
    },
  },
];

const subject = props =>
  render(
    <TestApp>
      <Tooltip
        showTooltip={true}
        payload={MOCK_PAYLOAD}
        label="My Label"
        labelFormatter={label => label}
        formatter={val => val}
        {...props}
      />
    </TestApp>,
  );

describe('Tooltip', () => {
  it('renders nothing when the `showTooltip` prop is `false`', () => {
    subject({ showTooltip: false });

    expect(screen.queryByText('My Label')).not.toBeInTheDocument();
  });

  it('renders the passed in payload', () => {
    subject();

    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
    expect(screen.getByText('Unique Confirmed Opens')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('formats the label with the passed in `labelFormatter`', () => {
    const toUpperCase = str => str.toUpperCase();
    subject({ labelFormatter: toUpperCase });

    expect(screen.queryByText('My Label')).not.toBeInTheDocument();
    expect(screen.getByText('MY LABEL')).toBeInTheDocument();
  });

  it('formats the payload with the passed in `formatter`', () => {
    const double = val => val * 2;
    subject({ formatter: double });

    expect(screen.queryByText('3000')).not.toBeInTheDocument();
    expect(screen.getByText('6000')).toBeInTheDocument();
    expect(screen.queryByText('2000')).not.toBeInTheDocument();
    expect(screen.getByText('4000')).toBeInTheDocument();
  });
});
