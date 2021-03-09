import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { TestApp } from 'src/__testHelpers__';
import { ScreenReaderOnlyTable } from '../ScreenReaderOnlyTable';

const DEFAULT_PROPS = {
  captionUnit: 'Count',
  metrics: [
    {
      key: 'count_targeted',
      label: 'Targeted',
      unit: 'number',
    },
    {
      key: 'count_rendered',
      label: 'Opens',
      unit: 'number',
    },
    {
      key: 'count_accepted',
      label: 'Accepted',
      unit: 'number',
    },
    {
      key: 'count_bounce',
      label: 'Bounces',
      unit: 'number',
    },
  ],
  data: [
    {
      count_targeted: 10760,
      count_rendered: 5298,
      count_accepted: 9112,
      count_bounce: 1005,
      ts: '2021-03-02T15:00:00-05:00',
      industry_rate: [34, 25, 'retail_online'],
    },
    {
      count_targeted: 10716,
      count_rendered: 5467,
      count_accepted: 9103,
      count_bounce: 1013,
      ts: '2021-03-02T16:00:00-05:00',
      industry_rate: [null, null, null],
    },
    {
      count_targeted: 10763,
      count_rendered: 5516,
      count_accepted: 9078,
      count_bounce: 967,
      ts: '2021-03-02T17:00:00-05:00',
      industry_rate: [null, null, null],
    },
  ],
};

const subject = props =>
  render(
    <TestApp>
      <ScreenReaderOnlyTable {...DEFAULT_PROPS} {...props} />
    </TestApp>,
  );

describe('ScreenReaderOnlyTable', () => {
  it('renders the default caption along with the passed in `captionUnit`', () => {
    subject({ captionUnit: 'Percent' });

    const table = screen.getByRole('table', { name: 'Analytics Data Over Time by Percent' });

    expect(table).toBeInTheDocument();
  });

  it('renders with a custom caption', () => {
    subject({ caption: 'The Best Data', captioUnit: 'Count' });

    const table = screen.getByRole('table', { name: 'The Best Data by Count' });

    expect(table).toBeInTheDocument();
  });

  it('renders with relevant table headers', () => {
    subject();
    const expectedHeaders = [
      'Timestamp',
      'Industry Benchmark Rate',
      'Targeted',
      'Opens',
      'Accepted',
      'Bounces',
    ];

    expectedHeaders.forEach(header => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });
  });

  it('renders the passed in data in accordance with the passed in metrics', () => {
    subject();

    const firstRow = screen.getAllByRole('row')[1];
    const secondRow = screen.getAllByRole('row')[2];
    const thirdRow = screen.getAllByRole('row')[3];

    expect(within(firstRow).getByText('Mar 2 2021, 3:00pm')).toBeInTheDocument();
    expect(
      within(firstRow).getByText(
        '25th percentile is 34%, 75th percentile is 25% for the Retail Online industry',
      ),
    ).toBeInTheDocument();
    expect(within(firstRow).getByText('10.76K')).toBeInTheDocument();
    expect(within(firstRow).getByText('5.3K')).toBeInTheDocument();
    expect(within(firstRow).getByText('9.11K')).toBeInTheDocument();
    expect(within(firstRow).getByText('1K')).toBeInTheDocument();

    expect(within(secondRow).getByText('Mar 2 2021, 4:00pm')).toBeInTheDocument();
    expect(within(secondRow).getByText('No Data')).toBeInTheDocument();
    expect(within(secondRow).getByText('10.72K')).toBeInTheDocument();
    expect(within(secondRow).getByText('5.47K')).toBeInTheDocument();
    expect(within(secondRow).getByText('9.1K')).toBeInTheDocument();
    expect(within(secondRow).getByText('1.01K')).toBeInTheDocument();

    expect(within(thirdRow).getByText('Mar 2 2021, 5:00pm')).toBeInTheDocument();
    expect(within(thirdRow).getByText('No Data')).toBeInTheDocument();
    expect(within(thirdRow).getByText('10.76K')).toBeInTheDocument();
    expect(within(thirdRow).getByText('5.52K')).toBeInTheDocument();
    expect(within(thirdRow).getByText('9.08K')).toBeInTheDocument();
    expect(within(thirdRow).getByText('967')).toBeInTheDocument();
  });
});
