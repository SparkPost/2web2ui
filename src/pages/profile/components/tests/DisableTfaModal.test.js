import { shallow } from 'enzyme';
import React from 'react';
import DisableTfaModal from '../DisableTfaModal';
import _ from 'lodash';

describe('DisableTfaModal tests', () => {
  let wrapper;
  let instance;

  beforeEach(() => {
    const props = {
      enabled: true,
      open: true,
      toggleError: false,
      togglePending: false,
      onClose: jest.fn(),
      disable: jest.fn(),
    };

    wrapper = shallow(<DisableTfaModal {...props} />);
    instance = wrapper.instance();
    _.functions(instance).forEach(f => jest.spyOn(instance, f));
    jest.spyOn(instance, 'setState');
  });

  it('should show disabling as button text when togglePending and tfaRequired is false', () => {
    wrapper.setProps({ togglePending: true, tfaRequired: false });
    expect(
      wrapper
        .find('Button')
        .first()
        .children()
        .contains('Disabling...'),
    ).toBe(true);
  });

  it('should show error on TextField when toggleError and showErrors', () => {
    wrapper.setState({ showErrors: true });
    wrapper.setProps({ toggleError: true });
    expect(wrapper.find('TextField').prop('error')).toEqual('Incorrect password');
  });

  it('should handle changes to password', () => {
    wrapper.find('TextField').simulate('change', { target: { value: 'pass' } });
    expect(instance.setState).toHaveBeenCalledWith({ password: 'pass' });
  });

  it('should call call disable on button click', () => {
    wrapper.setState({ password: 'password1' });
    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(instance.props.disable).toHaveBeenCalledWith('password1');
  });

  it('should close on cancel', () => {
    wrapper
      .find('Button')
      .at(1)
      .simulate('click');
    expect(instance.props.onClose).toHaveBeenCalled();
  });

  describe('cDU tests', () => {
    it('should close if not enabled and open', () => {
      wrapper.setProps({ enabled: false });
      expect(instance.props.onClose).toHaveBeenCalled();
    });

    it('should reset state if no longer open', () => {
      wrapper.setProps({ open: false });
      expect(instance.setState).toHaveBeenCalledWith({
        password: '',
        showErrors: false,
      });
    });

    it('should set showErrors to true if toggleError is true', () => {
      wrapper.setProps({ toggleError: true });
      expect(instance.setState).toHaveBeenCalledWith({ showErrors: true });
    });
  });
});
