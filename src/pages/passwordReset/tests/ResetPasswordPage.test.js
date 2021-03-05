import { shallow } from 'enzyme';
import React from 'react';
import { ResetPasswordPage } from '../ResetPasswordPage';

describe('Forgot Password Page', () => {
  let wrapper;

  const props = {
    handleSubmit: jest.fn(a => a),
    invalid: true,
    submitting: false,
    resetPassword: jest.fn(a => Promise.resolve(props.invalidateAuthToken(a.token))),
    invalidateAuthToken: jest.fn(a => a),
    history: { push: jest.fn() },
    showAlert: jest.fn(),
    resetSuccess: false,
    resetError: null,
    token: 'faketoken',
  };

  beforeEach(() => {
    wrapper = shallow(<ResetPasswordPage {...props} />);
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
    expect(wrapper.find('Button').props().children).toEqual('Creating Password..');
  });

  it('should handle submit', () => {
    wrapper.find('Form').simulate('submit', { newPassword: 'pw123' });
    expect(props.handleSubmit).toHaveBeenCalledWith(wrapper.instance().handleResetPassword);
    expect(props.resetPassword).toHaveBeenCalledWith({ password: 'pw123', token: 'faketoken' });
  });

  it('calls invalidate token after the resetPassword resolves', () => {
    return props
      .resetPassword({ password: 'pw123', token: 'faketoken' })
      .then(() => expect(props.invalidateAuthToken).toHaveBeenCalledWith('faketoken'));
  });

  it('should handle success', () => {
    wrapper.setProps({ resetSuccess: true });
    expect(props.history.push).toHaveBeenCalledWith('/auth');
    expect(props.showAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'Your password has been updated.',
    });
  });

  it('should handle error', () => {
    wrapper.setProps({ resetError: { message: 'an error happened' } });
    expect(props.showAlert).toHaveBeenCalledWith({
      type: 'error',
      message: 'Unable to update your password.',
      details: 'an error happened',
    });
  });

  it('should handle 401 error', () => {
    wrapper.setProps({ resetError: { response: { status: 401 } } });
    expect(props.showAlert).toHaveBeenCalledWith({
      type: 'error',
      message: 'Your password reset request has expired. Please resubmit your request.',
    });
    expect(props.history.push).toHaveBeenCalledWith('/forgot-password');
  });

  it('should compare passwords', () => {
    const notSame = wrapper
      .instance()
      .comparePasswords('', { newPassword: '123', confirmNewPassword: 'qwe' });
    const same = wrapper
      .instance()
      .comparePasswords('', { newPassword: '123', confirmNewPassword: '123' });

    expect(notSame).toEqual('Must be the same password');
    expect(same).toEqual(undefined);
  });
});
