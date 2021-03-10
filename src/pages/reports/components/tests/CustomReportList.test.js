import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'src/components/matchbox';
import { CustomReportsList } from '../CustomReportsList';

describe('Component: CustomReportsList', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      reports: [
        { name: 'report 1', url: 'report1url' },
        { name: 'report 2', url: 'report2url' },
      ],
      handleLoad: jest.fn(),
      onDelete: jest.fn(),
      deleting: false,
    };
    wrapper = shallow(<CustomReportsList {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render empty state with no reports', () => {
    wrapper.setProps({ reports: [] });
    expect(wrapper.contains('You do not have any saved reports.')).toBe(true);
  });

  it('should open the modal when clicking saved reports', () => {
    wrapper.find('Button').simulate('click');
    expect(wrapper.find(Modal.LEGACY).prop('open')).toBe(true);
  });

  it('should close the modal with the onClose callback', () => {
    wrapper.find('Button').simulate('click');
    wrapper.find(Modal.LEGACY).simulate('close');
    expect(wrapper.find(Modal.LEGACY).prop('open')).toBe(false);
  });

  it('should load a report with the onLoad callback', () => {
    wrapper.find('Button').simulate('click');
    wrapper
      .find('ReportRow')
      .first()
      .simulate('load');
    expect(props.handleLoad).toHaveBeenCalledWith(props.reports[0]);
    expect(wrapper.find(Modal.LEGACY).prop('open')).toBe(false);
  });
});
