import React from 'react';
import { GroupByOption } from '../GroupByOption';
import { shallow } from 'enzyme';

describe('Group By Option', () => {

  let wrapper;

  const props = {
    _getTableData: jest.fn(),
    groupBy: 'watched-domain',
    tableLoading: false,
    hasSubaccounts: false
  };

  beforeEach(() => {
    wrapper = shallow(<GroupByOption {...props} />);
  });

  it('should render correctly with both selector and checkbox', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with selector only and not the checkbox', () => {
    wrapper.setProps({ groupBy: 'campaign' });
    expect(wrapper.find('Checkbox')).not.toExist();
    expect(wrapper).toMatchSnapshot();
  });

  it('should render subaccount option', () => {
    wrapper.setProps({ hasSubaccounts: true });
    expect(wrapper.find('Select').prop('options')).toContainEqual({ label: 'Subaccount',
      value: 'subaccount' });
    expect(wrapper.find('Select').prop('options')).toMatchSnapshot();
  });

  it('should handle select change', () => {
    wrapper.find('Select').simulate('change', { target: { value: 'campaign' }});
    expect(props._getTableData).toHaveBeenCalledWith({ groupBy: 'campaign' });
  });

  it('should correctly show watched domain in the select options when "Only Top Domains" is checked', () => {
    wrapper.setState({ topDomainsOnly: true });
    expect(wrapper.find('Select').prop('options')).toContainEqual({ label: 'Recipient Domain',
      value: 'watched-domain' });
    expect(wrapper.find('Select').prop('options')).toMatchSnapshot();
  });

  it('should correctly show domain in the select options when "Only Top Domains" is not checked', () => {
    wrapper.setState({ topDomainsOnly: false });
    expect(wrapper.find('Select').prop('options')).toContainEqual({ label: 'Recipient Domain',
      value: 'domain' });
    expect(wrapper.find('Select').prop('options')).toMatchSnapshot();
  });

  it('should make new domain api call when unchecking the "Only Top Domains" checkbox', () => {
    wrapper.setState({ topDomainsOnly: true });
    wrapper.find('Checkbox').simulate('change');
    expect(props._getTableData).toHaveBeenCalledWith({ groupBy: 'domain' });
    expect(wrapper.find('Checkbox')).toHaveProp('checked', false);
  });

  it('should make new watched-domain api call when checking the "Only Top Domains" checkbox', () => {
    wrapper.setState({ topDomainsOnly: false });
    wrapper.find('Checkbox').simulate('change');
    expect(props._getTableData).toHaveBeenCalledWith({ groupBy: 'watched-domain' });
    expect(wrapper.find('Checkbox')).toHaveProp('checked', true);
  });
});
