import React from 'react';
import { shallow } from 'enzyme';
import SummaryTable from 'src/components/summaryTable';
import { DEFAULT_VIEW } from '../../constants/summaryTables';
import HealthScoreOverview from '../HealthScoreOverview';

describe('HealthScoreOverview', () => {
  const subject = (props = {}) =>
    shallow(
      <HealthScoreOverview
        data={[
          {
            current_health_score: 98,
            current_total_injection_count: 200000,
            domain: 'example.com',
            history: [{ date: '2018-01-13', health_score: 98 }],
            average_health_score: 98,
            WoW: 0.1,
            sid: 123,
          },
        ]}
        facet={{
          key: 'domain',
          label: 'Domain',
        }}
        getHealthScore={() => {}}
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

  it('renders both subaccount and facet columns', () => {
    const wrapper = subject({
      signalOptions: {
        id: undefined,
        name: 'Primary & All Subaccounts',
      },
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('renders custom date range', () => {
    const wrapper = subject({
      signalOptions: { relativeRange: 'custom', to: new Date('2019/06/08') },
    });
    expect(wrapper.find('Column[dataKey="current_health_score"]').prop('label')).toEqual('Score');
    expect(wrapper.find('Column[dataKey="current_total_injection_count"]').prop('label')).toEqual(
      'Injections',
    );
  });

  it('renders injections column if after V2 release date', () => {
    const wrapper = subject({ signalOptions: { to: new Date('2019/06/08') } });
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render title', () => {
    const wrapper = subject({ hideTitle: true });
    expect(wrapper.find('div[className="Header"]')).not.toExist();
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
    const getHealthScore = jest.fn();
    const summaryTable = {
      currentPage: 2,
      perPage: 10,
    };
    const wrapper = subject();

    wrapper.setProps({ getHealthScore, summaryTable });

    expect(getHealthScore).toHaveBeenCalledWith({
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
    const getHealthScore = jest.fn();
    const summaryTable = {
      currentPage: 1,
      order: { ascending: true, dataKey: 'domain' },
      perPage: 10,
    };
    const wrapper = subject();

    wrapper.setProps({ getHealthScore, summaryTable });

    expect(getHealthScore).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 'asc',
        orderBy: 'domain',
      }),
    );
  });

  it('requests data without subaccount data on summary table update', () => {
    const getHealthScore = jest.fn();
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
    const wrapper = subject({ signalOptions });

    wrapper.setProps({ getHealthScore, summaryTable });

    expect(getHealthScore).toHaveBeenCalledWith(
      expect.objectContaining({
        subaccount: undefined,
      }),
    );
  });

  describe('history component', () => {
    const factory = pageProps => props => {
      const wrapper = subject(pageProps);
      const Column = wrapper.find('Column[dataKey="history"]').prop('component');

      return shallow(<Column domain="example.com" sid={123} {...props} />);
    };

    it('redirects to details page when bar is clicked', () => {
      const historyPush = jest.fn();
      const wrapper = factory({ history: { push: historyPush } })();
      wrapper.simulate('click', { date: '2018-01-13' });

      expect(historyPush).toHaveBeenCalledWith({
        pathname: '/signals/health-score/domain/example.com',
        search: '?subaccount=123',
        state: { date: '2018-01-13' },
      });
    });

    it('redirects to details page when dot is clicked', () => {
      const historyPush = jest.fn();
      const wrapper = factory({ history: { push: historyPush } })();
      wrapper.simulate('click', { date: '2018-01-13' });

      expect(historyPush).toHaveBeenCalledWith({
        pathname: '/signals/health-score/domain/example.com',
        search: '?subaccount=123',
        state: { date: '2018-01-13' },
      });
    });

    it('ignores primary and all subaccount clickthrough to details page', () => {
      const historyPush = jest.fn();
      const wrapper = factory({
        facet: {
          key: 'sid',
          label: 'Subaccount',
        },
        history: { push: historyPush },
      })({
        sid: -1,
      });
      wrapper.simulate('click', { date: '2018-01-13' });

      expect(historyPush).not.toHaveBeenCalled();
    });
  });

  describe('current score column component', () => {
    it('renders current score', () => {
      const wrapper = subject();
      const Column = wrapper.find('Column[dataKey="current_health_score"]').prop('component');
      const columnWrapper = shallow(<Column current_health_score={99} />);

      expect(columnWrapper).toMatchSnapshot();
    });
  });

  describe('current injections column component', () => {
    it('renders current injection count', () => {
      const wrapper = subject({
        signalOptions: { relativeRange: 'custom', to: new Date('2019/06/08') },
      });
      const Column = wrapper
        .find('Column[dataKey="current_total_injection_count"]')
        .prop('component');
      const columnWrapper = shallow(<Column current_total_injection_count={235000} />);

      expect(columnWrapper).toMatchSnapshot();
    });
  });

  it('filters out primary and all subaccounts row', () => {
    const data = [
      {
        current_health_score: 98,
        domain: 'example.com',
        history: [{ date: '2018-01-13', health_score: 98 }],
        average_health_score: 98,
        WoW: 0.1,
        sid: 123,
      },
      {
        current_health_score: 50,
        domain: 'primary-and-all.com',
        history: [{ date: '2018-01-13', health_score: 50 }],
        average_health_score: 50,
        WoW: 0.5,
        sid: -1,
      },
    ];
    const wrapper = subject({ data });
    expect(wrapper.find(SummaryTable).prop('data')).toHaveLength(1);
    expect(wrapper.find(SummaryTable).prop('data')[0]).toEqual(data[0]);
  });
});
