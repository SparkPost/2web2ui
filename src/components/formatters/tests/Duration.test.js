import React from 'react';
import { Duration } from '../Duration';
import { mount } from 'enzyme';

describe('Duration', () => {
  it('should render duration in seconds', () => {
    const wrapper = mount(<Duration value={1000}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render duration in minutes', () => {
    const wrapper = mount(<Duration value={60000}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render duration in hours', () => {
    const wrapper = mount(<Duration value={3600000}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render when not a number', () => {
    const wrapper = mount(<Duration value='not a number' />);
    expect(wrapper).toMatchSnapshot();
  });
});
