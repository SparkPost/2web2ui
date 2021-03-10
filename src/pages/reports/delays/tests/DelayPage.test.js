import React from 'react';
import { DelayPage } from '../DelayPage';
import { shallow } from 'enzyme';

jest.mock('src/helpers/reports');

describe('DelayPage: ', () => {
  const props = {
    reportOptions: { relativeRange: 'hour' },
    tableLoading: false,
    reasons: [
      {
        count_delayed: 100,
        count_delayed_first: 1,
        reason: 'my reason'
      }
    ],
    aggregates: {
      count_delayed: 1000,
      count_delayed_first: 10,
      count_accepted: 10000
    },
    totalAccepted: 1000,
    refreshDelayReport: jest.fn()
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<DelayPage {...props} />);
  });

  it('should render', () => {
    expect(props.refreshDelayReport).not.toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('should refresh when report options reference changes', () => {
    const newReportOptions = {};
    expect(props.refreshDelayReport).not.toHaveBeenCalled();
    wrapper.setProps({ reportOptions: newReportOptions });
    expect(props.refreshDelayReport).toHaveBeenCalledWith(newReportOptions);
  });

  it('should show loading indicator when loading table', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should show loading panel when aggregates are still loading', () => {
    wrapper.setProps({ aggregatesLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should not display top level metrics when there are no aggregates', () => {
    wrapper.setProps({ aggregates: {}});
    expect(wrapper.find('MetricsSummary')).toHaveLength(0);
  });
});
