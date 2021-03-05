import { shallow } from 'enzyme';
import React from 'react';

import { SubaccountEditForm } from '../SubaccountEditForm';

const handleSubmit = jest.fn();

const props = {
  submitting: false,
  pristine: true,
  compliance: false,
  ipPools: ['an array of ip pools'],
  handleSubmit
};

let wrapper;

beforeEach(() => {
  wrapper = shallow(<SubaccountEditForm {...props} />);
});

test('base case', () => {
  expect(wrapper).toMatchSnapshot();
});

test('no ip pools', () => {
  wrapper.setProps({ ipPools: []});
  expect(wrapper).toMatchSnapshot();
});

test('with an assigned ip pool', () => {
  wrapper.setProps({ ipPool: 'test', restrictedToIpPool: true });
  expect(wrapper).toMatchSnapshot();
});

test('cancel button', () => {
  wrapper.setProps({ pristine: false });
  expect(wrapper).toMatchSnapshot();
});

test('submits correctly', () => {
  wrapper.find('Form').simulate('submit');
  expect(handleSubmit).toHaveBeenCalled();
  wrapper.setProps({ submitting: true });
  expect(wrapper).toMatchSnapshot();
});

test('should disable all fields when compliance is true', () => {
  wrapper.setProps({ compliance: true });
  expect(wrapper).toMatchSnapshot();
});
