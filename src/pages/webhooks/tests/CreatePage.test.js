import { shallow } from 'enzyme';
import React from 'react';

import { WebhooksCreate } from '../CreatePage';

describe('Page: Webhook Create', () => {
  const props = {
    eventDocs: true,
    getEventDocs: jest.fn(),
    createWebhook: jest.fn(() => Promise.resolve()),
    history: {
      push: jest.fn(),
    },
    eventsLoading: false,
    eventListing: [
      {
        key: 'event1',
        description: 'desc for event 1',
        display_name: 'Event 1',
      },
      {
        key: 'event2',
        description: 'desc for event 2',
        display_name: 'Event 2',
      },
      {
        key: 'event3',
        description: 'desc for event 3',
        display_name: 'Event 3',
      },
      {
        key: 'event4',
        description: 'desc for event 4',
        display_name: 'Event 4',
      },
    ],
    showAlert: jest.fn(),
    webhook: {},
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<WebhooksCreate {...props} />);
  });

  it('should render happy path', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should build proper events tree', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should show loading component while events are loading if no events are present', () => {
    wrapper.setProps({ eventsLoading: true, eventListing: [] });
    expect(wrapper).toMatchSnapshot();
  });

  it('should not show loading component while events are loading if events are present', () => {
    wrapper.setProps({ eventsLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should call createWebhook on submit of form', () => {
    wrapper.find('withRouter(Connect(ReduxForm))').simulate('submit', {});
    expect(props.createWebhook).toHaveBeenCalled();
  });

  describe('create tests', () => {
    it('should redirect on create success, and receive events from only primary', async () => {
      const instance = wrapper.instance();
      await instance.create({
        name: 'my webhook',
        target: 'http://url.com',
        assignTo: 'master',
        eventsRadio: 'select',
        events: {
          event1: true,
          event2: true,
          event3: true,
        },
      });

      expect(props.createWebhook).toHaveBeenCalledWith({
        subaccount: 0,
        webhook: {
          name: 'my webhook',
          target: 'http://url.com',
          events: ['event1', 'event2', 'event3'],
        },
      });
      expect(props.showAlert).toHaveBeenCalledWith({ type: 'success', message: 'Webhook created' });
      wrapper.setProps({ webhook: { id: 'webhook-updated-in-store', subaccount: 0 } }); // simulate redux updating the store
      expect(props.history.push).toHaveBeenCalledWith(
        '/webhooks/details/webhook-updated-in-store?subaccount=0',
      );
    });

    it('should only pass in checked events, and receive events from all', async () => {
      const instance = wrapper.instance();
      await instance.create({
        name: 'my webhook',
        target: 'http://url.com',
        eventsRadio: 'select',
        events: {
          event1: true,
          event2: false,
          event3: true,
        },
        assignTo: 'all',
      });

      expect(props.createWebhook).toHaveBeenCalledWith({
        subaccount: undefined,
        webhook: {
          name: 'my webhook',
          target: 'http://url.com',
          events: ['event1', 'event3'],
        },
      });
      expect(props.showAlert).toHaveBeenCalledWith({ type: 'success', message: 'Webhook created' });
    });

    it('should set appropriate values for basic auth webhook, and receive events from single sub', async () => {
      const instance = wrapper.instance();
      await instance.create({
        name: 'my webhook',
        target: 'http://url.com',
        eventsRadio: 'select',
        events: { event1: true },
        auth: 'basic',
        basicUser: 'user',
        basicPass: 'pw',
        assignTo: 'subaccount',
        subaccount: { id: 101 }, // subaccount object from typeahead
      });

      expect(props.createWebhook).toHaveBeenCalledWith({
        subaccount: 101,
        webhook: {
          name: 'my webhook',
          target: 'http://url.com',
          events: ['event1'],
          auth_type: 'basic',
          auth_credentials: {
            username: 'user',
            password: 'pw',
          },
        },
      });
      expect(props.showAlert).toHaveBeenCalledWith({ type: 'success', message: 'Webhook created' });
    });

    it('should set appropriate values for oauth2 webhook', async () => {
      const instance = wrapper.instance();
      await instance.create({
        name: 'my webhook',
        target: 'http://url.com',
        eventsRadio: 'select',
        events: { event2: true },
        auth: 'oauth2',
        tokenURL: 'token',
        clientId: 'client',
        clientSecret: 'shhhh',
      });

      expect(props.createWebhook).toHaveBeenCalledWith({
        webhook: {
          name: 'my webhook',
          target: 'http://url.com',
          events: ['event2'],
          auth_type: 'oauth2',
          auth_request_details: {
            url: 'token',
            body: {
              client_id: 'client',
              client_secret: 'shhhh',
            },
          },
        },
      });
      expect(props.showAlert).toHaveBeenCalledWith({ type: 'success', message: 'Webhook created' });
    });
  });

  describe('componentDidMount tests', () => {
    it('should call getEventDocs', () => {
      const instance = wrapper.instance();
      instance.componentDidMount();
      expect(instance.props.getEventDocs).toHaveBeenCalled();
    });
  });
});
