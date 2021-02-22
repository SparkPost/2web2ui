import React from 'react';
import { shallow } from 'enzyme';
import { IpForm } from '../IpForm';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import styles from './IpForm.module.scss';
jest.mock('src/hooks/useHibanaOverride');
useHibanaOverride.mockReturnValue(styles);
describe('Edit IP form', () => {
  const subject = props => {
    const defaultProps = {
      handleSubmit: jest.fn(),
      onSubmit: jest.fn(),
      submit: jest.fn(),
      submitting: false,
      ip: {
        hostname: 'abcd.com',
      },
      pools: [],
      pool: null,
      isAutoWarmupEnabled: true,
    };
    const mergedProps = Object.assign({}, defaultProps, props);

    return shallow(<IpForm {...mergedProps} />);
  };

  it('disables form submission and interaction when submitting', () => {
    const wrapper = subject({ submitting: true });

    expect(wrapper.find('Button')).toHaveProp('disabled', true);
    wrapper.find('Field').forEach(el => {
      expect(el).toHaveProp('disabled', true);
    });
  });

  it('renders the IP hostname', () => {
    const wrapper = subject({ ip: { hostname: 'my-mock-hostname.com' } });

    expect(wrapper).toHaveTextContent('my-mock-hostname.com');
  });

  it('renders the "Engagement Based IP Warmup" section', () => {
    const wrapper = subject();

    expect(wrapper).toHaveTextContent('Engagement Based IP Warmup');
  });

  it('renders the button content as "Saving" while the form is submitting', () => {
    const wrapper = subject({ submitting: true });

    expect(wrapper.find('Button')).toHaveTextContent('Saving');
  });

  it('renders the button content as "Update Sending IP" while the form is not submitting', () => {
    const wrapper = subject();

    expect(wrapper.find('Button')).toHaveTextContent('Update Sending IP');
  });

  it('submits passed in data when the <Form> is submitted', () => {
    const mockHandleSubmit = jest.fn();
    const wrapper = subject({ handleSubmit: mockHandleSubmit });
    const formData = { ip_pool: 'abc', auto_warmup_enabled: true };

    wrapper.find('Form').simulate('submit', formData);

    expect(mockHandleSubmit).toHaveBeenCalledWith(formData);
  });

  it('renders "Auto IP Warmup" with "true" checked when auto warmup is enabled', () => {
    const wrapper = subject({ isAutoWarmupEnabled: true });

    expect(wrapper.find('[name="auto_warmup_enabled"]')).toHaveProp('value', 'true');
  });

  it('renders "Auto IP Warmup" with "false" checked when auto warmup is not enabled', () => {
    const wrapper = subject({ isAutoWarmupEnabled: false });

    expect(wrapper.find('[name="auto_warmup_enabled"]')).toHaveProp('value', 'false');
  });

  it('renders the "Warmup Stage" <select> when auto IP warmup is enabled', () => {
    const wrapper = subject({ isAutoWarmupEnabled: true });

    expect(wrapper).toHaveTextContent('Warmup Stage');
  });

  it('does not render the "Warmup Stage" <select> when auto IP warmup is not enabled', () => {
    const wrapper = subject({ isAutoWarmupEnabled: false });

    expect(wrapper).not.toHaveTextContent('Warmup Stage');
  });

  it('opens the confirmation modal when clicking the "Update Sending IP" button when the state of auto warmup enabling is changed from its initial state', () => {
    let wrapper = subject({
      isAutoWarmupDirty: true,
      isAutoWarmupEnabled: true,
      ip: { auto_warmup_enabled: false },
    });

    wrapper.find('Button').simulate('click');

    expect(wrapper.find('ConfirmationModal')).toHaveProp('open', true);
    expect(wrapper.find('ConfirmationModal')).toHaveTextContent(
      'Are you sure you want to enable Auto IP Warmup?',
    );

    wrapper = subject({
      isAutoWarmupDirty: true,
      isAutoWarmupEnabled: false,
      ip: { auto_warmup_enabled: true },
    });

    wrapper.find('Button').simulate('click');

    expect(wrapper).toHaveTextContent('Are you sure you want to disable Auto IP Warmup?');
    expect(wrapper.find('ConfirmationModal')).toHaveProp('open', true);
  });

  it('does not open the confirmation modal when the state of auto warmup enabling remains unchanged', () => {
    const wrapper = subject({ isAutoWarmupEnabled: true, ip: { auto_warmup_enabled: true } });

    wrapper.find('Button').simulate('click');

    expect(wrapper.find('ConfirmationModal')).toHaveProp('open', false);
  });
});
