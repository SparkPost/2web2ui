import { mount } from 'enzyme';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import TestApp from 'src/__testHelpers__/TestApp';
import { IncidentDetailsPage } from '../IncidentDetailsPage';
import RelatedIncidents from '../components/RelatedIncidents';
import IncidentDetails from '../components/IncidentDetails';
import * as segmentHelpers from 'src/helpers/segment';

jest.mock('../components/IncidentDetails');
IncidentDetails.mockImplementation(() => <div className="mock-incident-details"></div>);

jest.mock('../components/RelatedIncidents');
RelatedIncidents.mockImplementation(() => <div className="mock-related-incidents"></div>);

segmentHelpers.segmentTrack = jest.fn();

const recommendation = {
  title: 'Fix This',
  check_list: ['If you are happy', 'And you know it', 'Clap your hands'],
  action_text: 'Request Removal',
  action_link: 'https://www.foo.com',
  info_text: 'Learn More',
  info_url: 'https://www.bar.com',
};

const mockIncident = {
  id: '123',
  resource: '1.2.3.4',
  blocklist_name: 'spamhaus.org - pbl',
  occurred_at: '2019-12-31T18:14:57.899Z',
  resolved_at: '2019-12-31T19:01:32.741Z',
  status: 'resolved',
  recommendation,
};

const mockDomainIncident = {
  id: '123',
  resource: 'realNigerianPrince.com',
  blocklist_name: 'spamhaus.org - pbl',
  occurred_at: '2019-12-31T18:14:57.899Z',
  resolved_at: '2019-12-31T19:01:32.741Z',
  status: 'resolved',
  recommendation,
};

const mockHistoricalIncidents = [
  {
    id: '1234',
    resource: '1.2.3.4',
    blocklist_name: 'spamhaus.org - pbl',
    occurred_at: '2019-12-31T18:14:57.899Z',
    resolved_at: '2019-12-31T19:01:32.741Z',
    status: 'resolved',
  },
];

const mockIncidentsForResource = [
  {
    id: '1234',
    resource: '1.2.3.4',
    blocklist_name: 'spamhaus.org 2',
    occurred_at: '2019-12-31T18:14:57.899Z',
    resolved_at: '2019-12-31T19:01:32.741Z',
    status: 'resolved',
  },
];

const mockIncidentsForBlocklist = [
  {
    id: '2345',
    resource: '2.3.4.5',
    blocklist_name: 'spamhaus.org - pbl',
    occurred_at: '2019-12-31T18:14:57.899Z',
    resolved_at: '2019-12-31T19:01:32.741Z',
    status: 'resolved',
  },
];

describe('IncidentDetailsPage', () => {
  const mockGetIncident = jest.fn(() => Promise.resolve(mockIncident));
  const mockListIncidentsForResource = jest.fn();
  const mockListIncidentsForBlocklist = jest.fn();
  const mockListHistoricalResolvedIncidents = jest.fn();

  const subject = (props, renderFn = mount, isHibanaEnabled = false) => {
    const defaults = {
      id: mockIncident.id,
      getIncident: mockGetIncident,
      incidentsForBlocklist: mockIncidentsForBlocklist,
      incidentsForResource: mockIncidentsForResource,
      historicalIncidents: mockHistoricalIncidents,
      listIncidentsForResource: mockListIncidentsForResource,
      listIncidentsForBlocklist: mockListIncidentsForBlocklist,
      listHistoricalResolvedIncidents: mockListHistoricalResolvedIncidents,
    };

    return renderFn(
      <TestApp isHibanaEnabled={isHibanaEnabled}>
        <IncidentDetailsPage {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('fetches incident, similar incidents for resource and blocklist, and historical incidents on mount', async () => {
    const wrapper = subject({ loading: true });

    wrapper.update();

    expect(mockGetIncident).toHaveBeenCalledWith(mockIncident.id);
    wrapper.update();
    await mockGetIncident(mockIncident.id).then(() => {
      expect(mockListIncidentsForResource).toHaveBeenCalledWith(mockIncident.resource);
      expect(mockListIncidentsForBlocklist).toHaveBeenCalledWith(mockIncident.blocklist_name);
      expect(mockListHistoricalResolvedIncidents).toHaveBeenCalledWith(
        mockIncident.blocklist_name,
        mockIncident.resource,
      );
    });
  });

  it('renders the 4 panels once data has come back', () => {
    const wrapper = subject({
      loading: false,
      incident: mockIncident,
    });

    wrapper.update();

    expect(wrapper.find('.mock-related-incidents')).toHaveLength(3);
    expect(wrapper.find('.mock-incident-details')).toHaveLength(1);
  });

  it('renders IP address incident correctly in Hibana', () => {
    subject(
      {
        loading: false,
        incident: mockIncident,
      },
      render,
      true,
    );

    expect(screen.getByText('Other Incidents for this IP')).toBeVisible();
    expect(screen.getByText('View all incidents for this IP')).toBeVisible();
  });

  it('renders Domain incident correctly in Hibana', () => {
    subject(
      {
        loading: false,
        incident: mockDomainIncident,
      },
      render,
      true,
    );

    expect(screen.getByText('Other Incidents for this Domain')).toBeVisible();
    expect(screen.getByText('View all incidents for this Domain')).toBeVisible();
  });

  it('renders the remediation steps for Hibana', () => {
    const props = {
      loading: false,
      incident: mockIncident,
    };

    subject(props, render, true);

    expect(screen.getByText('If you are happy')).toBeVisible();
    expect(screen.getByText('And you know it')).toBeVisible();
    expect(screen.getByText('Clap your hands')).toBeVisible();
    expect(screen.getByText('Request Removal')).toBeVisible();
    expect(screen.getByText('Request Removal').closest('a')).toHaveAttribute(
      'href',
      'https://www.foo.com',
    );
    expect(screen.getByText('Learn More')).toBeVisible();
    expect(screen.getByText('Learn More').closest('a')).toHaveAttribute(
      'href',
      'https://www.bar.com',
    );
  });

  it('does not render info button when info_text does not exist', () => {
    const props = {
      loading: false,
      incident: {
        ...mockIncident,
        recommendation: { ...recommendation, info_text: '', info_url: '' },
      },
    };

    subject(props, render, true);
    const recommendations = screen.getByTestId('remediation-steps');

    expect(within(recommendations).getAllByRole('link')).toHaveLength(1);
  });

  it('tracks user interaction with remediation steps in Segment for external url actions', () => {
    const props = {
      loading: false,
      incident: mockIncident,
    };

    subject(props, render, true);

    screen.getByText('Request Removal').click();
    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith(
      segmentHelpers.SEGMENT_EVENTS.BLOCKLIST_INCIDENT_ACTION_CLICKED,
    );
    screen.getByText('Learn More').click();
    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith(
      segmentHelpers.SEGMENT_EVENTS.BLOCKLIST_INCIDENT_INFO_CLICKED,
    );
  });

  it('tracks user interaction with remediation steps in Segment for Contact Support actions', () => {
    const props = {
      loading: false,
      incident: {
        ...mockIncident,
        recommendation: {
          ...recommendation,
          action_text: 'Contact Support',
          action_link: undefined,
        },
      },
    };

    subject(props, render, true);

    screen.getByText('Contact Support').click();
    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith(
      segmentHelpers.SEGMENT_EVENTS.BLOCKLIST_INCIDENT_ACTION_CLICKED,
    );
  });
});
