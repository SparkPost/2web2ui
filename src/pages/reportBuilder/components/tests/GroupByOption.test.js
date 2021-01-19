import React from 'react';
import { shallow } from 'enzyme';
import GroupByOption from '../GroupByTable/GroupByOption';
import { useReportBuilderContext } from 'src/pages/reportBuilder/context/ReportBuilderContext';
jest.mock('src/pages/reportBuilder/context/ReportBuilderContext');

describe('GroupByOption', () => {
  let wrapper;

  const props = {
    groupBy: 'watched-domain',
    hasSubaccounts: false,
    onChange: jest.fn(),
    tableLoading: false,
  };

  beforeEach(() => {
    useReportBuilderContext.mockImplementation(() => ({
      state: { comparisons: [] },
    }));
    wrapper = shallow(<GroupByOption {...props} />);
  });

  it('should render correctly with selector only and not the checkbox', () => {
    wrapper.setProps({ groupBy: 'campaign' });
    expect(wrapper.find('Checkbox')).not.toExist();
    expect(wrapper.find('Select')).toExist();
  });

  it('should render subaccount option', () => {
    wrapper.setProps({ hasSubaccounts: true });
    expect(wrapper.find('Select').prop('options')).toContainEqual({
      label: 'Subaccount',
      value: 'subaccount',
    });
  });

  it('does not render options with the same type as current active comparisons', () => {
    useReportBuilderContext.mockImplementationOnce(() => ({
      state: { comparisons: [{ type: 'Subaccount', value: '123456' }] },
    }));
    wrapper.setProps({ hasSubaccounts: true });
    expect(wrapper.find('Select').prop('options')).not.toContainEqual({
      label: 'Subaccount',
      value: 'subaccount',
    });
  });

  it('should handle select change', () => {
    wrapper.find('Select').simulate('change', { target: { value: 'campaign' } });
    expect(props.onChange).toHaveBeenCalledWith('campaign');
  });

  it('should handle select change when its just a placeholder value', () => {
    wrapper.find('Select').simulate('change', { target: { value: 'placeholder' } });
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it('should correctly show watched domain in the select options when "Only Top Domains" is checked', () => {
    expect(wrapper.find('Checkbox')).toBeChecked();
    expect(wrapper.find('Select').prop('options')).toContainEqual({
      label: 'Recipient Domain',
      value: 'watched-domain',
    });
  });

  it('should correctly show domain in the select options when "Only Top Domains" is not checked', () => {
    expect(wrapper.find('Checkbox')).toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(wrapper.find('Checkbox')).not.toBeChecked();
    expect(wrapper.find('Select').prop('options')).toContainEqual({
      label: 'Recipient Domain',
      value: 'domain',
    });
  });

  it('should make new domain api call when unchecking the "Only Top Domains" checkbox', () => {
    expect(wrapper.find('Checkbox')).toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(props.onChange).toHaveBeenCalledWith('domain');
    expect(wrapper.find('Checkbox')).not.toBeChecked();
  });

  it('should make new watched-domain api call when checking the "Only Top Domains" checkbox', () => {
    expect(wrapper.find('Checkbox')).toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(wrapper.find('Checkbox')).not.toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenCalledWith('watched-domain');
    expect(wrapper.find('Checkbox')).toBeChecked();
  });

  it('should dehydrate filters if on new comparators filters', () => {
    expect(wrapper.find('Checkbox')).toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(wrapper.find('Checkbox')).not.toBeChecked();
    wrapper.find('Checkbox').simulate('change');
    expect(props.onChange).toHaveBeenCalledTimes(2);
  });
});
