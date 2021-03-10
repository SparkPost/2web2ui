import React from 'react';
import { shallow } from 'enzyme';
import { SummaryReportPage } from '../SummaryPage';
import * as reportHelpers from 'src/helpers/reports';
import { MetricsModal, ChartHeader } from '../components';
import { GUIDE_IDS } from 'src/constants';
jest.mock('src/helpers/reports');

describe('Page: SummaryPage', () => {
  let wrapper;
  let testProps;
  const mockshow = jest.fn();

  beforeEach(() => {
    reportHelpers.getFilterSearchOptions = jest.fn(() => ({}));
    reportHelpers.parseSearch = jest.fn(() => ({ options: {} }));
    testProps = {
      reportOptions: [],
      chart: {
        metrics: [1, 2, 3],
      },
      refreshSummaryReport: jest.fn(),
      refreshReportOptions: jest.fn(),
      addFilters: jest.fn(),
      location: { state: { triggerGuide: true } },
    };
    wrapper = shallow(<SummaryReportPage {...testProps} />);
    window.Appcues = {};
    window.Appcues = { show: mockshow };
  });

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should refresh when report options reference changes', () => {
    const newReportOptions = {};
    expect(testProps.refreshSummaryReport).not.toHaveBeenCalled();
    wrapper.setProps({ reportOptions: newReportOptions });
    expect(testProps.refreshSummaryReport).toHaveBeenCalledWith(newReportOptions);
  });

  it('should trigger guide when location state has triggerGuide set to true', () => {
    const location = { state: { triggerGuide: true } };
    expect(mockshow).not.toHaveBeenCalled();
    wrapper.setProps({ location: location });
    expect(mockshow).toHaveBeenCalledWith(GUIDE_IDS.EXPLORE_ANALYTICS);
  });

  it('should render when loading', () => {
    testProps.chart.chartLoading = true;
    wrapper = shallow(<SummaryReportPage {...testProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should toggle metrics modal chart header', () => {
    const header = wrapper.find(ChartHeader);
    expect(wrapper.state('metricsModal')).toEqual(false);
    header.simulate('metricsToggle');
    expect(wrapper.state('metricsModal')).toEqual(true);
    header.simulate('metricsToggle');
    expect(wrapper.state('metricsModal')).toEqual(false);
  });

  it('should toggle modals via metrics modal cancel', () => {
    const modal = wrapper.find(MetricsModal);
    expect(wrapper.state('metricsModal')).toEqual(false);
    modal.simulate('cancel');
    expect(wrapper.state('metricsModal')).toEqual(true);
    modal.simulate('cancel');
    expect(wrapper.state('metricsModal')).toEqual(false);
  });

  it('should apply metrics via metrics modal submit', () => {
    wrapper.setState({ metricsModal: true });
    const modal = wrapper.find(MetricsModal);
    const metrics = {};
    modal.simulate('submit', metrics);
    expect(testProps.refreshReportOptions).toHaveBeenCalledWith({ metrics });
    expect(wrapper.state('metricsModal')).toEqual(false);
  });

  it('should handle scale changes', () => {
    const header = wrapper.find(ChartHeader);
    header.simulate('scaleClick', 'test-scale');
    expect(wrapper.state('scale')).toEqual('test-scale');
  });

  it('should handle time changes', () => {
    const header = wrapper.find(ChartHeader);
    header.simulate('timeClick', 'test-time');
    expect(wrapper.state('eventTime')).toEqual('test-time');
  });
});
