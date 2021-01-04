import React from 'react';
import { render } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import IncidentDetails from '../IncidentDetails';
import { formatDateTime } from 'src/helpers/date';

describe('Blocklist Component: RelatedIncidents', () => {
  const subject = props => {
    const defaults = {
      resourceName: '1.2.3.4',
      blocklistName: 'spamhaus.org - sbl',
      listedTimestamp: '2019-05-23T12:48:00.000Z',
      resolvedTimestamp: '2019-05-24T13:48:00.000Z',
      daysListed: 45,
      historicalIncidents: [],
    };

    return render(
      <TestApp isHibanaEnabled={false}>
        <IncidentDetails {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('renders the listed date', () => {
    const { queryByText } = subject();
    expect(queryByText('Date Listed')).toBeInTheDocument();
    expect(queryByText(formatDateTime('2019-05-23T12:48:00.000Z'))).toBeInTheDocument();
  });

  it('renders the resolved date', () => {
    const { queryByText } = subject();
    expect(queryByText('Date Resolved')).toBeInTheDocument();
    expect(queryByText(formatDateTime('2019-05-24T13:48:00.000Z'))).toBeInTheDocument();
  });

  it('renders the days listed', () => {
    const { queryByText } = subject();
    expect(queryByText('Days Listed')).toBeInTheDocument();
    expect(queryByText('45')).toBeInTheDocument();
  });

  it('renders the resource name and blocklist name', () => {
    const { queryByText } = subject();
    expect(queryByText('1.2.3.4')).toBeInTheDocument();
    expect(queryByText('spamhaus.org - sbl')).toBeInTheDocument();
  });
});
