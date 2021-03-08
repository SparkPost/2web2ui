import { shallow } from 'enzyme';
import React from 'react';

import { TfaForm } from '../TfaForm';

const props = {
  tfaPending: false,
  verifyAndLogin: jest.fn(() => Promise.resolve()),
  handleSubmit: jest.fn(),
  error: false,
  tfa: { enabled: false, name: 'me', test: 'this' },
};

let wrapper;
let instance;

beforeEach(() => {
  wrapper = shallow(<TfaForm {...props} />);
  instance = wrapper.instance();
});

it('renders correctly', () => {
  expect(wrapper).toMatchSnapshot();
});

it('renders correctly verifying tfa', () => {
  wrapper.setProps({ tfaPending: true });
  expect(wrapper).toMatchSnapshot();
});

it('calls correct method on submit', () => {
  wrapper
    .find('Form')
    .first()
    .simulate('submit', { code: 'my-code' });
  expect(instance.props.handleSubmit).toHaveBeenCalled();
});

it('should verify tfa login on submit', () => {
  const verifySpy = jest.spyOn(instance.props, 'verifyAndLogin');
  instance.handleSubmit({ code: 'my-code' });
  expect(verifySpy).toHaveBeenCalledWith({
    authData: { name: 'me', test: 'this' },
    code: 'my-code',
  });
});

it('should throw a submission error when verifyAndLogin fails with 4xx error', () => {
  instance.props.verifyAndLogin.mockImplementation(() =>
    Promise.reject({ response: { status: 400 } }),
  );
  return instance.handleSubmit({ code: 'code' }).catch(err => {
    expect(err.errors._error).toEqual(
      'The code is invalid. Please contact login.issues@sparkpost.com for assistance.',
    );
  });
});

it('should not throw an error when verifySpy fails with non 4xx error', async () => {
  instance.props.verifyAndLogin.mockImplementation(() =>
    Promise.reject({ response: { status: 500 } }),
  );
  await expect(instance.handleSubmit({ code: 'code' })).resolves.toBeUndefined();
});
