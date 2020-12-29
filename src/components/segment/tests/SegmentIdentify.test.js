import React from 'react';
import { mount } from 'enzyme';
import { render } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import { SegmentIdentify, default as SegmentIdentifyWithRedux } from '../SegmentIdentify';
import getConfig from 'src/helpers/getConfig';
import * as helpers from 'src/helpers/segment';

jest.mock('src/helpers/getConfig');
jest.mock('src/helpers/segment');

const defaultTraits = {
  [helpers.SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
  [helpers.SEGMENT_TRAITS.USER_ID]: 'username',
  [helpers.SEGMENT_TRAITS.TENANT]: 'test-tenant',
};

describe('SegmentIdentify', () => {
  const getSubject = (props = {}) => {
    const traits = { ...defaultTraits, ...props };
    return mount(<SegmentIdentify accessControlReady {...traits} />);
  };

  beforeEach(() => {
    helpers.segmentIdentify = jest.fn();
    getConfig.mockReturnValue('test-tenant');
  });

  it('calls segmentIdentify when a trait value changes', () => {
    const subject = getSubject();

    expect(helpers.segmentIdentify).toBeCalledTimes(1);
    subject.setProps({ [helpers.SEGMENT_TRAITS.TENANT]: 'new-tenant' });
    expect(helpers.segmentIdentify).toBeCalledTimes(2);
    subject.setProps({ [helpers.SEGMENT_TRAITS.TENANT]: 'newer-tenant' });
    expect(helpers.segmentIdentify).toBeCalledTimes(3);
  });

  it('does not call segmentIdentify if access control is not ready', () => {
    getConfig.mockReturnValue('test-tenant');
    const props = {
      accessControlReady: false,
    };

    const subject = getSubject(props);

    subject.setProps({ [helpers.SEGMENT_TRAITS.EMAIL]: 'email2@abc.com' });
    expect(helpers.segmentIdentify).toBeCalledTimes(0);
  });

  it('calls identify based on redux state', () => {
    const defaultStore = {
      accessControlReady: true,
      account: {
        company_name: 'sparkpost',
        customer_id: '123',
        service_level: 'free',
        subscription: {
          code: 'abc123',
        },
      },
      currentUser: {
        access_level: 'admin',
        created: new Date('July 19 2013'),
        first_name: 'Test',
        last_name: 'User',
        is_sso: true,
        username: 'username',
        email: 'email@abc.com',
      },
      tfa: {
        enabled: true,
      },
    };

    render(
      <TestApp isHibanaEnabled={true} store={defaultStore}>
        <SegmentIdentifyWithRedux />
      </TestApp>,
    );

    expect(helpers.segmentIdentify).toBeCalledWith({
      company: 'sparkpost',
      createdAt: new Date('July 19 2013'),
      customer_id: '123',
      email: 'email@abc.com',
      first_name: 'Test',
      last_name: 'User',
      plan: 'abc123',
      service_level: 'free',
      sso_enabled: true,
      tenant: 'test-tenant',
      tfa_enabled: true,
      user_id: 'username',
      user_role: 'admin',
    });
  });
});
