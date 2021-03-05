import React from 'react';
import { shallow } from 'enzyme';
import { SearchForm } from '../SearchForm';
jest.mock('src/hooks/useHibanaOverride', () => jest.fn(a => a));

describe('SearchForm', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      filterValues: {},
      onChange: jest.fn(),
      handleSubmit: jest.fn(a => a),
      handleCancel: jest.fn(),
      handleApply: jest.fn(),
    };
    wrapper = shallow(<SearchForm {...props} />);
  });

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should call handleApply when submitting', () => {
    const formValues = {};
    wrapper.find('Form').simulate('submit', formValues);
    expect(props.handleApply).toHaveBeenCalledWith(formValues);
  });

  it('should handle cancel when clicking the cancel button', () => {
    wrapper
      .find('Button')
      .last()
      .simulate('click');
    expect(props.handleCancel).toHaveBeenCalled();
  });
});
