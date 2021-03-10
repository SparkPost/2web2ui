import React from 'react';
import { BouncePage } from '../BouncePage';
import { shallow } from 'enzyme';
import MetricsSummary from '../../components/MetricsSummary';

describe('BouncePage: ', () => {
  const props = {
    loading: false,
    aggregates: {
      countBounce: 1,
      countSent: 10,
      countAdminBounce: 5,
    },
    reportOptions: {
      relativeRange: 'hour',
    },
    addFilters: jest.fn(),
    refreshBounceReport: jest.fn(),
    reasons: [
      {
        bounce_category_name: 'Block',
        bounce_class_description:
          'The message was blocked by the receiver as coming from a known spam source',
        bounce_class_name: 'Spam Block',
        classification_id: 51,
        count_bounce: 5,
        domain: 'yahoo.com',
        reason:
          "554 - 5.7.1 Blocklisted by 'twoomail.com'(twoo.com.multi.surbl.org) Contact the postmaster of this domain for resolution. This attempt has been logged.",
      },
    ],
    adminReasons: [
      {
        bounce_class_name: 'Admin Failure',
        bounce_class_description: 'The message was failed by eceleritys configured policies',
        bounce_category_name: 'Admin',
        classification_id: 25,
        count_admin_bounce: 2,
        domain: 'yahoo.com',
        reason: '550 - Administrative prohibition #51',
      },
    ],
    bounceSearchOptions: {},
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<BouncePage {...props} />);
  });

  it('should render', () => {
    expect(props.refreshBounceReport).not.toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('should refresh when report options reference changes', () => {
    const newReportOptions = {};
    expect(props.refreshBounceReport).not.toHaveBeenCalled();
    wrapper.setProps({ reportOptions: newReportOptions });
    expect(props.refreshBounceReport).toHaveBeenCalledWith(newReportOptions);
  });

  it('should render correctly with no bounces', () => {
    wrapper.setProps({ aggregates: {} });
    expect(wrapper).toMatchSnapshot();
  });

  it('should show loading panel when table is loading', () => {
    wrapper.setProps({ tableLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should display loading panel on top level metrics when aggregates are loading', () => {
    wrapper.setProps({ chartLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should not display top level metrics admin bounce message with no admin bounces', () => {
    wrapper.setProps({
      aggregates: {
        countBounce: 1,
        countSent: 10,
        countAdminBounce: 0,
      },
    });
    expect(wrapper.find(MetricsSummary).props().secondaryMessage).toBe(null);
  });

  it('should not display top level metrics when there are no aggregates', () => {
    wrapper.setProps({ aggregates: {} });
    expect(wrapper.find(MetricsSummary)).toHaveLength(0);
  });

  it('should show empty reasons table when there are no reasons when on regular bounce tab', () => {
    wrapper.setState({ tab: 0 });
    wrapper.setProps({
      reasons: [],
      adminReasons: [
        {
          bounce_class_name: 'Admin Failure',
          bounce_class_description: 'The message was failed by eceleritys configured policies',
          bounce_category_name: 'Admin',
          classification_id: 25,
          count_admin_bounce: 2,
          domain: 'yahoo.com',
          reason: '550 - Administrative prohibition #51',
        },
      ],
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should show empty reasons table when there are no admin reasons when on admin bounce tab', () => {
    wrapper.setState({ tab: 1 });
    wrapper.setProps({
      adminReasons: [],
      reasons: [
        {
          bounce_category_name: 'Block',
          bounce_class_description:
            'The message was blocked by the receiver as coming from a known spam source',
          bounce_class_name: 'Spam Block',
          classification_id: 51,
          count_bounce: 5,
          domain: 'yahoo.com',
          reason:
            "554 - 5.7.1 Blocklisted by 'twoomail.com'(twoo.com.multi.surbl.org) Contact the postmaster of this domain for resolution. This attempt has been logged.",
        },
      ],
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render row data properly', () => {
    const rows = wrapper.instance().getRowData({
      reason: 'u y bounce?',
      domain: 'gmail',
      bounce_category_name: 'bouncy',
      count_bounce: 10,
    });

    expect(rows).toMatchSnapshot();
  });

  it('should render row data for admin bounce properly', () => {
    const rows = wrapper.instance().getRowData({
      reason: 'bouncy boi',
      domain: 'gmail',
      bounce_category_name: 'Admin',
      count_admin_bounce: 5,
    });

    expect(rows).toMatchSnapshot();
  });

  it('should change state when the tab is clicked', () => {
    wrapper.instance().handleTab(1);
    expect(wrapper).toHaveState('tab', 1);
  });
});
