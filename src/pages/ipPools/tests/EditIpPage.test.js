import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestApp from 'src/__testHelpers__/TestApp';
import { EditIpPage } from '../EditIpPage';
import { getRelativeDates, getLocalTimezone } from 'src/helpers/date';

jest.mock('../components/IpForm');
jest.mock('src/helpers/date');
getRelativeDates.mockImplementation(() => ({ from: 'mock-from', to: 'mock-to' }));
getLocalTimezone.mockImplementation(() => 'Mock/Timezone');

describe('IP Edit Page', () => {
  const subject = props => {
    const defaultProps = {
      listPools: jest.fn(() => Promise.resolve()),
      getTimeSeries: jest.fn(() => Promise.resolve()),
      pool: { name: 'My Pool', id: 'my-pool' },
      loading: false,
      ip: { external_ip: '1.1.1.1', ip_pool: 'foo', auto_warmup_stage: 10 },
      updateSendingIp: jest.fn(),
      showAlert: jest.fn(),
      match: {
        params: {
          id: 'my-pool',
        },
      },
      history: {
        replace: jest.fn(),
      },
    };
    const mergedProps = Object.assign({}, defaultProps, props);

    // Router needed to use <Link/> component inside
    return render(
      <TestApp>
        <EditIpPage {...mergedProps} />
      </TestApp>,
    );
  };

  it('loads data after mount', () => {
    const mockListPools = jest.fn(() => Promise.resolve());
    subject({ listPools: mockListPools });

    expect(mockListPools).toHaveBeenCalled();
  });

  it('renders a loader when and no page `pageLoading` is true', () => {
    const { queryByTestId, queryByText } = subject({ pageLoading: true });

    expect(queryByTestId('loading')).toBeInTheDocument();
    expect(queryByText('Sending IP: 1.1.1.1')).not.toBeInTheDocument();
  });

  it('renders a loader and not the page when no pool is present', () => {
    const { queryByTestId, queryByText } = subject({ pool: null });

    expect(queryByTestId('loading')).toBeInTheDocument();
    expect(queryByText('Sending IP: 1.1.1.1')).not.toBeInTheDocument();
  });

  it('renders a loader not the page when no ip is present', () => {
    const { queryByTestId, queryByText } = subject({ ip: null });

    expect(queryByTestId('loading')).toBeInTheDocument();
    expect(queryByText('Sending IP: 1.1.1.1')).not.toBeInTheDocument();
  });

  it('invokes `updateSendingIp` on on submit, invokes `showAlert`, invokes `history.push` when the ip pool value has been re-assigned, and then invokes `listPools`', () => {
    const promise = Promise.resolve();
    const mockUpdateSendingIp = jest.fn(() => promise);
    const mockListPools = jest.fn(() => Promise.resolve());
    const mockPush = jest.fn();
    const mockShowAlert = jest.fn();
    const stubbedIp = {
      external_ip: 'foobar',
      ip_pool: 'a',
    };
    const { queryByTestId } = subject({
      updateSendingIp: mockUpdateSendingIp,
      ip: stubbedIp,
      listPools: mockListPools,
      history: {
        push: mockPush,
      },
      showAlert: mockShowAlert,
    });

    fireEvent.submit(queryByTestId('mock-ip-form'), { ip_pool: 'b' });

    expect(mockUpdateSendingIp).toHaveBeenCalled();

    return promise.then(() => {
      expect(mockShowAlert).toHaveBeenCalled();
      expect(mockListPools).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('renders a page-level error banner controlled by the `pageError` prop', () => {
    const { queryByText } = subject({ pageError: { message: 'API Failed' } });

    expect(
      queryByText('Sorry, we seem to have had some trouble loading your IP data.'),
    ).toBeInTheDocument();

    userEvent.click(queryByText('Show Error Details'));

    expect(queryByText('API Failed')).toBeInTheDocument();
  });

  it('reloads data upon clicking the reload button on the page level error banner', () => {
    const mockListPools = jest.fn(() => Promise.resolve());
    const { queryByText } = subject({
      pageError: { message: 'This is a page error' },
      listPools: mockListPools,
    });

    userEvent.click(queryByText('Try Again'));

    expect(mockListPools).toHaveBeenCalledTimes(2);
  });

  it('renders an error for delivery history via the `chartError` prop that has a reload button that invokes `listPools` when clicked', () => {
    const mockListPools = jest.fn(() => Promise.resolve());
    const { queryByText } = subject({
      chartError: { message: 'A chart error' },
      listPools: mockListPools,
    });

    userEvent.click(queryByText('Show Error Details'));

    expect(queryByText('A chart error')).toBeInTheDocument();

    userEvent.click(queryByText('Try Again'));

    expect(mockListPools).toHaveBeenCalled();
  });

  it('requests IP pool time series data on mount with relevant request parameters', () => {
    const mockGetTimeSeries = jest.fn(() => Promise.resolve());
    subject({ getTimeSeries: mockGetTimeSeries });

    expect(mockGetTimeSeries).toHaveBeenCalledWith({
      from: 'mock-from',
      to: 'mock-to',
      sending_ips: '1.1.1.1',
      precision: 'day',
      metrics: 'count_delivered',
      timezone: 'Mock/Timezone',
    });
  });

  it('renders the delivery history section in a loading state controlled via the `chartLoading` prop', () => {
    const { queryByTestId } = subject({ chartLoading: true });

    expect(queryByTestId('panel-loading')).toBeInTheDocument();
  });

  it('renders a line chart when data is passed in via the `deliveryHistory` prop', () => {
    const { queryByTestId, queryByText } = subject({
      deliveryHistory: [{ deliveries: 123, date: '10/11/12' }],
    });

    expect(queryByTestId('delivery-history-line-chart')).toBeInTheDocument();
    expect(queryByTestId('delivery-history-line-chart')).toHaveAttribute('aria-hidden', 'true');
    expect(queryByText('Delivery History')).toBeInTheDocument();
  });

  it('does not render a line chart when empty data is passed in via the `deliveryHistory` prop', () => {
    const { queryByTestId, queryByText } = subject({ deliveryHistory: [] });

    expect(queryByTestId('delivery-history-line-chart')).not.toBeInTheDocument();
    expect(queryByText('Delivery History')).not.toBeInTheDocument();
  });
});
