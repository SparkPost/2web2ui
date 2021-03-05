import { shallow } from 'enzyme';
import React from 'react';
import { ForgotPasswordPage } from '../ForgotPasswordPage';

describe('Forgot Password Page', () => {
  let wrapper;

  const props = {
    handleSubmit: jest.fn((a) => a),
    invalid: true,
    submitting: false,
    sendPasswordResetEmail: jest.fn((a) => a),
    history: { push: jest.fn() },
    showAlert: jest.fn(),
    emailSuccess: false,
    emailError: null
  };

  beforeEach(() => {
    wrapper = shallow(<ForgotPasswordPage {...props} />);
  });

  it('should render with initial props', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render submit button states correctly', () => {
    expect(wrapper.find('Button').props().disabled).toBe(true);

    wrapper.setProps({ invalid: false });
    expect(wrapper.find('Button').props().disabled).toBe(false);

    wrapper.setProps({ submitting: true });
    expect(wrapper.find('Button').props().disabled).toBe(true);
    expect(wrapper.find('Button').props().children).toEqual('Sending Email..');
  });

  it('should handle submit', () => {
    wrapper.find('Form').simulate('submit', { user: 'username' });
    expect(props.handleSubmit).toHaveBeenCalledWith(props.sendPasswordResetEmail);
    expect(props.sendPasswordResetEmail).toHaveBeenCalledWith({ user: 'username' });
  });

  it('should handle success', () => {
    wrapper.setProps({ emailSuccess: true });
    expect(props.history.push).toHaveBeenCalledWith('/auth');
    expect(props.showAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'If you have an account with us, please check your email for your password reset instructions.'
    });
  });

  it('should handle error', () => {
    wrapper.setProps({ emailError: { message: 'an error happened' }});
    expect(props.showAlert).toHaveBeenCalledWith({
      type: 'error',
      message: 'Unable to send your password reset email.',
      details: 'an error happened'
    });
  });
});
