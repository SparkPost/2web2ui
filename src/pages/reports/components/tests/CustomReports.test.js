import React from 'react';
import { shallow } from 'enzyme';
import { CustomReports } from '../CustomReports';

describe('Component: CustomReports', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      loading: false,
      reports: [
        { name: 'report 1', url: 'report1url' },
        {
          name: 'report 2',
          url: 'range=custom&metrics=count_delayed&filters=Sending%20Domain%3Atest.com'
        }
      ],
      addFilters: jest.fn(),
      clearFilters: jest.fn(),
      refreshReportOptions: jest.fn(),
      saveReport: jest.fn(),
      deleteReport: jest.fn(),
      searchOptions: { range: 'day', to: 'to', from: 'from' }
    };
    wrapper = shallow(<CustomReports {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('report name field', () => {
    it('should handle input change', () => {
      wrapper.find('TextField').simulate('change', { target: { value: 'test-name ' }});
      expect(wrapper.find('TextField').prop('value')).toEqual('test-name ');
    });

    it('should enabled the save button with a value', () => {
      wrapper.find('TextField').simulate('change', { target: { value: 'test-name ' }});
      expect(wrapper.find('Button').prop('disabled')).toBe(false);
    });
    it('should limit input to 24 characters', () => {
      wrapper.find('TextField').simulate('change', { target: { value: 'test-name' }});
      expect(wrapper.find('TextField').prop('value')).toEqual('test-name');
      wrapper.find('TextField').simulate('change', { target: {
        value: 'a-very-very-very-long-test-name'
      }});
      expect(wrapper.find('TextField').prop('value')).toEqual('test-name');
    });
  });

  describe('save button', () => {
    it('should handle saving a report', () => {
      wrapper.find('TextField').simulate('change', { target: { value: 'test-name ' }});
      expect(wrapper.find('Button').prop('disabled')).toBe(false);
      wrapper.find('Button').simulate('click');
      expect(props.saveReport).toHaveBeenCalledWith({
        name: 'test-name',
        url: 'range=day'
      });
    });

    it('should handle saving a report with custom dates', () => {
      wrapper.setProps({ searchOptions: { ...props.searchOptions, range: 'custom' }});
      wrapper.find('TextField').simulate('change', { target: { value: 'test-name ' }});
      wrapper.find('Button').simulate('click');
      expect(props.saveReport).toHaveBeenCalledWith({
        name: 'test-name',
        url: 'from=from&range=custom&to=to'
      });
    });

    it('should be disabled when saving a report', () => {
      wrapper.setProps({ loading: true });
      expect(wrapper.find('Button').prop('disabled')).toBe(true);
    });

    it('should not be visible when exceeding report limit', () => {
      wrapper.setProps({ reports: new Array(10) });
      expect(wrapper.find('Button')).not.toExist();
    });

    it('should be visible when exceeding report limit, but able to overwrite an existing report', () => {
      const newReports = new Array(10);
      newReports.push(props.reports[0]);

      wrapper.setProps({ reports: newReports });
      wrapper.find('TextField').simulate('change', { target: { value: 'report 1 ' }});
      expect(wrapper.find('Button')).toExist();
    });
  });

  it('should show a message when exceeding report limit', () => {
    wrapper.setProps({ reports: new Array(11) });
    expect(wrapper.find('.Limited').text()).toEqual('You are limited to 10 saved reports');
  });

  it('should correctly load a report', () => {
    wrapper.find('withRouter(CustomReportsList)').prop('handleLoad')(props.reports[1]);
    expect(wrapper.find('TextField').prop('value')).toEqual('report 2');
    expect(props.clearFilters).toHaveBeenCalled();

    expect(props.addFilters).toHaveBeenCalledWith([{
      id: undefined,
      type: 'Sending Domain',
      value: 'test.com'
    }]);

    expect(props.refreshReportOptions).toHaveBeenCalledWith({
      metrics: ['count_delayed'],
      relativeRange: 'custom'
    });
  });
});
