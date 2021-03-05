import { shallow } from 'enzyme';
import React from 'react';

import { LoginForm } from '../LoginForm';

const baseProps = {
  loginPending: false
};

function subject(props) {
  return shallow(<LoginForm {...baseProps} {...props} />);
}

it('renders correctly', () => {
  expect(subject()).toMatchSnapshot();
});

it('renders correctly when logging in', () => {
  expect(subject({ loginPending: true })).toMatchSnapshot();
});

it('calls correct method on submit', () => {
  const handleSubmit = jest.fn();
  subject({ handleSubmit }).find('Form').first().simulate('submit');
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

it('renders errors', () => {
  expect(subject({ loginError: 'asplode' })).toMatchSnapshot();
});
