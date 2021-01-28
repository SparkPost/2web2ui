import React from 'react';
import { render } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import RelatedIncidents from '../RelatedIncidents';
import { formatDateTime, formatDate } from 'src/helpers/date';

const mixedIncidents = [
  {
    id: '1234',
    resource: '1.2.3.4',
    blocklist_name: 'spamhaus.org - sbl',
    occurred_at: '2019-07-23T12:48:00.000Z',
    occurred_at_timestamp: 1563886080,
    resolved_at: '2019-07-23T13:48:00.000Z',
    resolved_at_timestamp: 1563889680,
    status: 'resolved',
    occurred_at_formatted: formatDateTime('2019-07-23T12:48:00.000Z'),
    occurred_at_formatted_date_only: formatDate('2019-07-23T12:48:00.000Z'),
    resolved_at_formatted: formatDateTime('2019-07-23T13:48:00.000Z'),
    resolved_at_formatted_date_only: formatDate('2019-07-23T13:48:00.000Z'),
  },
  {
    id: '2345',
    resource: '2.3.4.5',
    blocklist_name: 'spamhaus.org 2 - sbl',
    occurred_at: '2019-07-23T12:48:00.000Z',
    occurred_at_timestamp: '2019-07-23T12:48:00.000Z',
    status: 'active',
    occurred_at_formatted: formatDateTime('2019-07-23T12:48:00.000Z'),
    occurred_at_formatted_date_only: formatDate('2019-07-23T12:48:00.000Z'),
  },
];

const activeIncidents = [
  {
    id: '2345',
    resource: '2.3.4.5',
    blocklist_name: 'spamhaus.org 2 - sbl',
    occurred_at: '2019-07-23T12:48:00.000Z',
    occurred_at_timestamp: '2019-07-23T12:48:00.000Z',
    status: 'active',
    occurred_at_formatted: formatDateTime('2019-07-23T12:48:00.000Z'),
    occurred_at_formatted_date_only: formatDate('2019-07-23T12:48:00.000Z'),
  },
];

describe('Blocklist Component: RelatedIncidents', () => {
  const subject = props => {
    const defaults = { incidents: [], loading: false, name: '', type: 'blocklist' };

    return render(
      <TestApp>
        <RelatedIncidents {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('renders the resource name of incidents when type is blocklist', () => {
    const { queryByText } = subject({ incidents: mixedIncidents });
    expect(queryByText('1.2.3.4')).toBeInTheDocument();
  });

  it('renders the blocklist name of incidents when type is resource', () => {
    const { queryByText } = subject({ incidents: mixedIncidents, type: 'resource' });
    expect(queryByText('spamhaus.org - sbl')).toBeInTheDocument();
  });

  it('renders the historical incidents version of the table when type is history', () => {
    const { queryByText } = subject({ incidents: mixedIncidents, type: 'history' });
    expect(queryByText('Resource')).not.toBeInTheDocument();
    expect(queryByText('Blocklist')).not.toBeInTheDocument();
    expect(queryByText('Date Listed')).toBeInTheDocument();
  });

  it('renders the resolved column as active for active incident', () => {
    const { queryByText } = subject({ incidents: activeIncidents });
    expect(queryByText('Active')).toBeInTheDocument();
  });
});
