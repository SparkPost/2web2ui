import React from 'react';
import { RejectionPage } from '../RejectionPage';
import { shallow } from 'enzyme';

jest.mock('src/helpers/reports');

describe('RejectionPage: ', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      loading: false,
      reportOptions: {},
      list: [
        {
          count_rejected: 65,
          rejection_category_name: 'Policy Rejection',
          rejection_category_id: 1,
          reason: '551 - Cannot Relay 105',
          domain: 'gmail.com'
        },
        {
          count_rejected: 62,
          rejection_category_name: 'Policy Rejection',
          rejection_category_id: 1,
          reason: '550 - Invalid recipient ...@... (#5.1.1)',
          domain: 'gmail.com'
        }
      ],
      aggregates: {
        count_rejected: 14,
        count_targeted: 100
      },
      refreshRejectionReport: jest.fn()
    };

    wrapper = shallow(<RejectionPage {...props} />);
  });

  it('should render', () => {
    expect(props.refreshRejectionReport).not.toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('should refresh when report options reference changes', () => {
    const newReportOptions = {};
    expect(props.refreshRejectionReport).not.toHaveBeenCalled();
    wrapper.setProps({ reportOptions: newReportOptions });
    expect(props.refreshRejectionReport).toHaveBeenCalledWith(newReportOptions);
  });

  it('renders correctly when loading', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders loading pannel when aggregates are still loading', () => {
    wrapper.setProps({ aggregatesLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should not display top level metrics when there are no aggregates', () => {
    wrapper.setProps({ aggregates: {}});
    expect(wrapper.find('MetricsSummary')).toHaveLength(0);
  });
});
