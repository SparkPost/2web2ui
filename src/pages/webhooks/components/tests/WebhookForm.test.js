import React from 'react';
import { shallow } from 'enzyme';
import { EventCheckBoxes, AuthFields, WebhookForm } from '../WebhookForm';
import SubaccountSection from '../SubaccountSection';

describe('EventCheckboxes component', () => {

  it('should return null if show is false', () => {
    expect(shallow(<EventCheckBoxes show={false} />)).toMatchSnapshot();
  });

  it('should render with events', () => {
    const events = [
      { key: 'testKeyA', display_name: 'Test Display Name A', description: 'A longer description for test event A' },
      { key: 'testKeyB', display_name: 'Test Display Name B', description: 'A longer description for test event B' },
      { key: 'testKeyC', display_name: 'Test Display Name C', description: 'A longer description for test event C' }
    ];
    expect(shallow(<EventCheckBoxes show={true} events={events} />)).toMatchSnapshot();
  });

});

describe('AuthFields component', () => {

  it('should render for basic auth', () => {
    expect(shallow(<AuthFields authType='basic' />)).toMatchSnapshot();
  });

  it('should render for oauth', () => {
    expect(shallow(<AuthFields authType='oauth2' />)).toMatchSnapshot();
  });

  it('should render null for unknown auth', () => {
    expect(shallow(<AuthFields authType='bananas' />)).toMatchSnapshot();
  });

});

describe('Webhooks Form Component', () => {
  let wrapper;
  const props = {
    handleSubmit: jest.fn(),
    submitting: false,
    pristine: true,
    auth: null,
    eventsTree: [],
    eventsRadio: 'all',
    hasSubaccounts: false,
    newWebhook: false
  };

  beforeEach(() => {
    wrapper = shallow(<WebhookForm {...props} />);
  });

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle submit', () => {
    wrapper.find('form').simulate('submit');
    expect(props.handleSubmit).toHaveBeenCalled();
  });

  it('should subaccount section if subaccounts exist', () => {
    wrapper.setProps({ hasSubaccounts: true });
    expect(wrapper.find(SubaccountSection)).toMatchSnapshot();
  });

  it('should show events checkboxes', () => {
    wrapper.setProps({ eventsRadio: 'select' });
    // Ghetto sibling selector
    // 'Grid' below radio group is the checkbox group
    expect(wrapper.find('EventsRadioGroup').parent().props().children).toMatchSnapshot();
  });

  describe('submit button props', () => {
    it('should render correct submit text when updating an existing webhook', () => {
      expect(wrapper.find('Button').props().children).toEqual('Update Webhook');
    });
    it('should render correct submit text when creating a new webhook', () => {
      wrapper.setProps({ newWebhook: true });
      expect(wrapper.find('Button').props().children).toEqual('Create Webhook');
    });
    it('should render correct submit text and be disabled when submitting', () => {
      wrapper.setProps({ submitting: true });
      expect(wrapper.find('Button').props().disabled).toEqual(true);
      expect(wrapper.find('Button').props().children).toEqual('Submitting...');
    });
    it('should disable submit button when pristine', () => {
      expect(wrapper.find('Button').props().disabled).toEqual(true);
    });
    it('should enable submit button when not pristine and not submitting', () => {
      wrapper.setProps({ pristine: false });
      expect(wrapper.find('Button').props().disabled).toEqual(false);
    });
  });

  describe('auth', () => {
    it('should render basic auth fields', () => {
      wrapper.setProps({ auth: 'basic' });
      expect(wrapper.find('AuthDropDown').parent().props().children).toMatchSnapshot();
    });

    it('should render basic oauth2 fields', () => {
      wrapper.setProps({ auth: 'oauth2' });
      expect(wrapper.find('AuthDropDown').parent().props().children).toMatchSnapshot();
    });
  });
});
