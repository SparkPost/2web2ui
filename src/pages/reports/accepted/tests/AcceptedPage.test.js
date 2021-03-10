import React from 'react';
import { AcceptedPage } from '../AcceptedPage';
import { shallow } from 'enzyme';

describe('AcceptedPage: ', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      loading: false,
      aggregates: { count_accepted: 1 },
      refreshAcceptedReport: jest.fn(),
      reportOptions: {
        relativeRange: 'day'
      },
      searchOptions: { from: '', to: '', range: '7d', filters: {}}
    };

    wrapper = shallow(<AcceptedPage {...props} />);
  });

  it('should render', () => {
    expect(props.refreshAcceptedReport).not.toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('should refresh when report options reference changes', () => {
    const newReportOptions = { relativeRange: 'hour' };
    expect(props.refreshAcceptedReport).not.toHaveBeenCalled();
    wrapper.setProps({ reportOptions: newReportOptions });
    expect(props.refreshAcceptedReport).toHaveBeenCalledWith(newReportOptions);
  });

  it('should render correctly with no accepted results', () => {
    wrapper.setProps({ aggregates: null });
    expect(wrapper.find('Empty')).toMatchSnapshot();
  });

  it('should render loading correctly over top level metrics', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper.find('PanelLoading')).toHaveLength(1);
  });

});
