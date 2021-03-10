import React from 'react';
import { shallow } from 'enzyme';
import CustomReportRow from '../CustomReportRow';

describe('Component: CustomReportRow', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      name: 'mock name',
      onLoad: jest.fn(),
      onDelete: jest.fn()
    };
    wrapper = shallow(<CustomReportRow {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle load', () => {
    wrapper.find('div').first().simulate('click');
    expect(props.onLoad).toHaveBeenCalled();
  });

  it('should handle deletion', () => {
    const event = {
      stopPropagation: jest.fn()
    };

    wrapper.find('Button').simulate('click', event);
    expect(props.onDelete).toHaveBeenCalledWith('mock name');
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should disabled delete button when deleting', () => {
    wrapper.setProps({ deleting: true });
    expect(wrapper.find('Button').prop('disabled')).toBe(true);
  });
});
