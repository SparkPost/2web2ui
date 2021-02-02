import { shallow } from 'enzyme';
import React from 'react';
import { TfaManager } from '../TfaManager';

describe('EnableTfaModal tests', () => {
  let wrapper;
  let instance;
  let props;

  beforeEach(() => {
    props = {
      getTfaBackupStatus: jest.fn(),
      getTfaStatus: jest.fn(),
      getTfaSecret: jest.fn(),
      clearBackupCodes: jest.fn(),
      generateBackupCodes: jest.fn().mockImplementation(() => Promise.resolve(null)),
      toggleTfa: jest.fn().mockImplementation(() => Promise.resolve(null)),
      showAlert: jest.fn(),
      logout: jest.fn(),
      enabled: false,
      required: false,
      secret: 'shhh',
      username: 'kevin-mitnick',
      togglePending: false,
      toggleError: false,
      backupCodes: { activeCount: 1 },
      statusUnknown: false,
    };

    wrapper = shallow(<TfaManager {...props} />);
    instance = wrapper.instance();
  });

  it('should call getTfaBackupStatus and getTfaStatus', () => {
    expect(instance.props.getTfaBackupStatus).toHaveBeenCalled();
    expect(instance.props.getTfaStatus).not.toHaveBeenCalled();
  });

  it('should show panel loading while status unknown', () => {
    wrapper.setProps({ statusUnknown: true });
    expect(wrapper.find('PanelLoading')).toHaveLength(1);
  });

  it('should call getTfaStatus when statusUnknown at mount', () => {
    props.statusUnknown = true;
    shallow(<TfaManager {...props} />);
    expect(instance.props.getTfaBackupStatus).toHaveBeenCalled();
    expect(instance.props.getTfaStatus).toHaveBeenCalled();
  });

  it('should toggle status text when enabled', () => {
    wrapper.setProps({ enabled: true });
    expect(
      wrapper
        .find('LabelledValue')
        .at(0)
        .children()
        .contains('Enabled'),
    ).toBe(true);
  });

  it('should show a message about 0 codes', () => {
    wrapper.setProps({ enabled: true, backupCodes: { activeCount: 0 } });
    expect(
      wrapper
        .find('h6')
        .text()
        .includes('0'),
    ).toBe(true);
    expect(
      wrapper
        .find('small')
        .text()
        .includes(
          'We recommend saving a set of backup codes in case you lose or misplace your current device.',
        ),
    ).toBe(true);
  });

  it('should refresh backup code status after enable', () => {
    instance.onEnable();
    expect(instance.props.getTfaBackupStatus).toHaveBeenCalled();
  });

  it('should toggleTfa on disable', () => {
    instance.disable('pw');
    expect(instance.props.toggleTfa).toHaveBeenCalledWith({ enabled: false, password: 'pw' });
  });

  it('should generate back codes on request', () => {
    instance.generateBackupCodes('password');
    expect(instance.props.generateBackupCodes).toHaveBeenCalled();
  });

  it('should refresh backup code status after generation', () => {
    instance.generateBackupCodes('code');
    expect(instance.props.getTfaBackupStatus).toHaveBeenCalled();
  });

  it('should close modal when closing backup modal', () => {
    jest.spyOn(instance, 'closeModals');
    wrapper.find('BackupCodesModal').simulate('close');
    expect(instance.closeModals).toHaveBeenCalled();
  });

  it('should close enable modal on close', () => {
    wrapper.find('EnableTfaModal').simulate('close');
    expect(wrapper.state('openModal')).toEqual(null);
    wrapper.find('DisableTfaModal').simulate('close');
    expect(wrapper.state('openModal')).toEqual(null);
  });

  it('logs out if disabling TFA with TFA enforced', async () => {
    wrapper.setProps({ enabled: true, required: true });
    await wrapper.instance().disable();
    expect(wrapper.instance().props.logout).toHaveBeenCalled();
  });

  it('should not logout if disabling TFA and TFA not enforced', async () => {
    wrapper.setProps({ enabled: true });
    await wrapper.instance().disable();
    expect(wrapper.instance().props.logout).not.toHaveBeenCalled();
  });
});
