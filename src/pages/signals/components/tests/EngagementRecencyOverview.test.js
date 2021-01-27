import React from 'react';
import { shallow } from 'enzyme';
import SummaryTable from 'src/components/summaryTable';
import { DEFAULT_VIEW } from '../../constants/summaryTables';
import EngagementRecencyOverview from '../EngagementRecencyOverview';

describe('EngagementRecencyOverview', () => {
  const subject = (props = {}) =>
    shallow(
      <EngagementRecencyOverview
        data={[
          {
            current_engaged_recipients: 12,
            current_relative_engaged_recipients: 5,
            domain: 'example.com',
            history: [
              { date: '2018-01-13', relative_engaged_recipients: 5, engaged_recipients: 12 },
            ],
            WoW: 0.1,
          },
        ]}
        facet={{
          key: 'domain',
          label: 'Domain',
        }}
        getEngagementRecency={() => {}}
        loading={false}
        resetSummaryTable={() => {}}
        signalOptions={{
          facet: 'domain',
          facetSearchTerm: 'example.com',
          from: '2015-01-01',
          relativeRange: '14days',
          subaccount: {
            id: 123,
          },
          to: '2015-01-05',
        }}
        subaccounts={{
          123: { id: 123, name: 'Test Subaccount' },
        }}
        summaryTable={{
          currentPage: 1,
          order: { ascending: true, dataKey: 'domain' },
          perPage: 10,
        }}
        tableName="Test"
        totalCount={1}
        {...props}
      />,
    );

  it('renders overview panel with controls and table', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders empty summary table', () => {
    const wrapper = subject({ data: [] });
    expect(wrapper.find(SummaryTable).prop('empty')).toEqual(true);
  });

  it('renders error message', () => {
    const wrapper = subject({
      data: [],
      error: new Error('Oh no!'),
    });

    expect(wrapper.find(SummaryTable).prop('error')).toEqual('Oh no!');
  });

  it('renders loader', () => {
    const wrapper = subject({
      data: [],
      loading: true,
    });

    expect(wrapper.find(SummaryTable).prop('loading')).toEqual(true);
  });

  it('renders custom date range', () => {
    const wrapper = subject({ signalOptions: { relativeRange: 'custom' } });
    expect(
      wrapper.find('Column[dataKey="current_relative_engaged_recipients"]').prop('label'),
    ).toEqual('Ratio');
  });

  it('handles calculation change', () => {
    const wrapper = subject();
    wrapper.find('Calculation').simulate('change', 'absolute');
    expect(wrapper.state('calculation')).toEqual('absolute');
    expect(wrapper.find('Column[dataKey="current_engaged_recipients"]')).toMatchSnapshot();
  });

  it('renders custom date range with absolute calculation', () => {
    const wrapper = subject({ signalOptions: { relativeRange: 'custom' } });
    wrapper.find('Calculation').simulate('change', 'absolute');
    expect(wrapper.find('Column[dataKey="current_engaged_recipients"]').prop('label')).toEqual(
      'Count',
    );
  });

  it('requests reset on mount', () => {
    const resetSummaryTable = jest.fn();
    subject({ resetSummaryTable });
    expect(resetSummaryTable).toHaveBeenCalledWith('Test', {});
  });

  it('requests reset on mount with default options', () => {
    const resetSummaryTable = jest.fn();
    subject({ resetSummaryTable, defaults: { perPage: 25 } });
    expect(resetSummaryTable).toHaveBeenCalledWith('Test', { perPage: 25 });
  });

  it('requests reset to default view for subaccount view on mount', () => {
    const resetSummaryTable = jest.fn();
    subject({ facet: { key: 'sid', label: 'Subaccounts' }, resetSummaryTable });
    expect(resetSummaryTable).toHaveBeenCalledWith('Test', DEFAULT_VIEW);
  });

  it('requests table reset on signal options update', () => {
    const resetSummaryTable = jest.fn();
    const wrapper = subject();
    wrapper.setProps({ resetSummaryTable, signalOptions: {} });

    expect(resetSummaryTable).toHaveBeenCalledWith('Test', {});
  });

  it('requests data on summary table update', () => {
    const getEngagementRecency = jest.fn();
    const summaryTable = {
      currentPage: 2,
      perPage: 10,
    };
    const wrapper = subject();

    wrapper.setProps({ getEngagementRecency, summaryTable });

    expect(getEngagementRecency).toHaveBeenCalledWith({
      facet: 'domain',
      filter: 'example.com',
      from: '2015-01-01',
      limit: 10,
      offset: 10,
      order: undefined,
      orderBy: undefined,
      relativeRange: '14days',
      subaccount: {
        id: 123,
      },
      to: '2015-01-05',
    });
  });

  it('requests ordered data on summary table update', () => {
    const getEngagementRecency = jest.fn();
    const summaryTable = {
      currentPage: 1,
      order: { ascending: true, dataKey: 'domain' },
      perPage: 10,
    };
    const wrapper = subject();

    wrapper.setProps({ getEngagementRecency, summaryTable });

    expect(getEngagementRecency).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 'asc',
        orderBy: 'domain',
      }),
    );
  });

  it('requests data without subaccount data on summary table update', () => {
    const getEngagementRecency = jest.fn();
    const signalOptions = {
      facet: 'domain',
      facetSearchTerm: 'example.com',
      relativeRange: '14days',
      subaccount: {
        id: undefined,
        name: 'Primary & All Subaccounts',
      },
    };
    const summaryTable = {
      currentPage: 2,
      perPage: 10,
    };
    const wrapper = subject();

    wrapper.setProps({ getEngagementRecency, signalOptions, summaryTable });

    expect(getEngagementRecency).toHaveBeenCalledWith(
      expect.objectContaining({
        subaccount: undefined,
      }),
    );
  });

  describe('history component', () => {
    const factory = ({ calculation, history, ...props }) => {
      const wrapper = subject({
        history,
        metaData: { currentMax: 200, currentRelativeMax: 40 },
      });
      wrapper.setState({ calculation });
      const Column = wrapper.find('Column[dataKey="history"]').prop('component');

      return shallow(<Column {...props} domain="example.com" />);
    };

    it('renders absolute sparkline', () => {
      const wrapper = factory({ chartType: 'line' });
      expect(wrapper).toMatchSnapshot();
    });

    it('renders relative sparkline', () => {
      const wrapper = factory({ calculation: 'relative', chartType: 'line' });
      expect(wrapper).toMatchSnapshot();
    });

    it('redirects to details page when bar is clicked', () => {
      const historyPush = jest.fn();
      const wrapper = factory({ chartType: 'bar', history: { push: historyPush } });
      wrapper.simulate('click', { date: '2018-01-13' });

      expect(historyPush).toHaveBeenCalledWith({
        pathname: '/signals/engagement/cohorts/domain/example.com',
        search: '?subaccount=123',
        state: { date: '2018-01-13' },
      });
    });

    it('redirects to details page when dot is clicked', () => {
      const historyPush = jest.fn();
      const wrapper = factory({ chartType: 'line', history: { push: historyPush } });
      wrapper.simulate('click', { date: '2018-01-13' });

      expect(historyPush).toHaveBeenCalledWith({
        pathname: '/signals/engagement/cohorts/domain/example.com',
        search: '?subaccount=123',
        state: { date: '2018-01-13' },
      });
    });
  });

  describe('current column component', () => {
    const factory = ({ calculation, ...props }) => {
      const wrapper = subject();
      wrapper.setState({ calculation });
      const dataKey =
        calculation === 'relative'
          ? 'current_relative_engaged_recipients'
          : 'current_engaged_recipients';
      const Column = wrapper.find(`Column[dataKey="${dataKey}"]`).prop('component');

      return shallow(<Column {...props} />);
    };

    it('renders current count', () => {
      const wrapper = factory({ calculation: 'absolute', current_engaged_recipients: 123 });
      expect(wrapper).toMatchSnapshot();
    });

    it('renders current rate', () => {
      const wrapper = factory({
        calculation: 'relative',
        current_relative_engaged_recipients: 234,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
