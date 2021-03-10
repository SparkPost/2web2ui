import React from 'react';
import { shallow } from 'enzyme';
import { EngagementPage } from '../EngagementPage';

describe('Engagement Report Page', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      loading: false,
      aggregateMetrics: {
        data: {
          count_accepted: 1,
          count_sent: 2,
          count_unique_clicked_approx: 3,
          count_unique_confirmed_opened_approx: 4
        },
        loading: false
      },
      linkMetrics: {
        data: [
          { count_clicked: 1776, count_raw_clicked_approx: 1657, link_name: 'Raw URL' }
        ],
        loading: false
      },
      refreshEngagementReport: jest.fn(),
      reportOptions: {},
      engagementSearchOptions: {}
    };
    wrapper = shallow(<EngagementPage {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should not refresh when report options reference is unchanged', () => {
    expect(props.refreshEngagementReport).toHaveBeenCalledTimes(0);
  });

  it('should refresh when report options reference changes', () => {
    wrapper.setProps({ reportOptions: {}});
    expect(props.refreshEngagementReport).toHaveBeenCalledTimes(1);
  });

  it('should refresh when report options change', () => {
    wrapper.setProps({ reportOptions: { relativeRange: 'day' }});
    expect(props.refreshEngagementReport).toHaveBeenLastCalledWith({ relativeRange: 'day' });
  });
});
