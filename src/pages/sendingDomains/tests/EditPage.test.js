import { shallow } from 'enzyme';
import React from 'react';

import { EditPage } from '../EditPage';

import { domain as domainRecord } from './domain';

describe('Sending Domains Edit Page', () => {
  let wrapper;
  let props;

  const domain = Object.assign({}, domainRecord);

  const apiErrorResp = {
    response: {
      data: {
        errors: [ { message: 'Unhelpful cheese configuration' } ]
      }
    }
  };

  beforeEach(() => {
    props = {
      domain,
      getError: null,
      getLoading: false,
      getDomain: jest.fn(),
      deleteDomain: jest.fn(() => Promise.resolve()),
      updateDomain: jest.fn(() => Promise.resolve()),
      history: {
        push: jest.fn()
      },
      showAlert: jest.fn(),
      match: {
        params: { id: 'example.com' }
      }
    };

    wrapper = shallow(<EditPage {...props}/>);
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.instance().props.getDomain).toHaveBeenCalledTimes(1);
  });

  it('renders loading correctly', () => {
    wrapper.setProps({ domain: {}});
    expect(wrapper).toMatchSnapshot();
  });

  it('renders error banner correctly', () => {
    wrapper.setProps({ getError: { message: 'error' }});
    expect(wrapper).toMatchSnapshot();
  });

  it('should show a delete modal', () => {
    wrapper.instance().toggleDelete();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('should delete a master account sending domain', async() => {
    await wrapper.instance().deleteDomain();
    expect(props.deleteDomain).toHaveBeenCalledWith(domain.id, null);
  });

  it('should delete a subaccount sending domain', async() => {
    wrapper.setProps({ domain: { ...domain, subaccount_id: 101 }});
    await wrapper.instance().deleteDomain();
    expect(props.deleteDomain).toHaveBeenCalledWith(domain.id, 101);
  });

  it('should show errors on delete', async() => {
    props.deleteDomain.mockImplementationOnce(() => Promise.reject(apiErrorResp));
    await wrapper.instance().deleteDomain();
    expect(props.showAlert).toHaveBeenCalledTimes(1);
  });

  it('should redirect after delete', async() => {
    await wrapper.instance().deleteDomain();
    expect(props.history.push).toHaveBeenCalledWith('/account/sending-domains');
  });

  it('should toggle subaccount sharing', async() => {
    await wrapper.instance().shareDomainChange();
    expect(props.updateDomain).toHaveBeenCalledWith(expect.objectContaining({
      shared_with_subaccounts: !domain.shared_with_subaccounts
    }));
  });

  it('should show errors on subacount sharing toggle', async() => {
    props.updateDomain.mockImplementationOnce(() => Promise.reject(apiErrorResp));
    await wrapper.instance().shareDomainChange();
    expect(props.showAlert).toHaveBeenCalledTimes(1);
  });
});
