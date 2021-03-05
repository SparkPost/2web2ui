import { shallow } from 'enzyme';
import React from 'react';

import { SubaccountCreateForm } from '../SubaccountCreateForm';

const handleSubmit = jest.fn();

const props = {
  grants: ['subaccount grants'],
  showGrants: false,
  createApiKey: false,
  ipPools: [],
  handleSubmit
};

let wrapper;

beforeEach(() => {
  wrapper = shallow(<SubaccountCreateForm {...props} />);
});

test('base case', () => {
  expect(wrapper).toMatchSnapshot();
});

test('api key Form', () => {
  wrapper.setProps({ createApiKey: true });
  expect(wrapper).toMatchSnapshot();
});

test('has ip pools', () => {
  wrapper.setProps({ ipPools: ['salt water']});
  expect(wrapper).toMatchSnapshot();
});

test('has ip pools and checked checkbox', () => {
  wrapper.setProps({ ipPools: ['salt water'], restrictedToIpPool: true });
  expect(wrapper).toMatchSnapshot();
});

test('submits correctly', () => {
  wrapper.find('Form').simulate('submit');
  expect(handleSubmit).toHaveBeenCalled();
  wrapper.setProps({ submitting: true });
  expect(wrapper).toMatchSnapshot();
});
