import React from 'react';
import { shallow } from 'enzyme';
import TypeaheadItem from '../TypeaheadItem';

describe('Component: TypeaheadItem', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      value: 'found'
    };
    wrapper = shallow(<TypeaheadItem {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render help text', () => {
    wrapper.setProps({ helpText: 'I am helping!' });
    expect(wrapper).toMatchSnapshot();
  });
});
