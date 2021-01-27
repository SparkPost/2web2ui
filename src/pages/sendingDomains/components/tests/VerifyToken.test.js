import React from 'react';
import { shallow } from 'enzyme';
import { VerifyToken } from '../VerifyToken';
describe('VerifyToken component', () => {
  const props = {
    showAlert: jest.fn(),
    domains: [
      { domain: 'foo.co' },
      { domain: 'bar.co', subaccount_id: 101 },
      { domain: 'baz.co', subaccount_id: 0 },
    ],
    location: {
      search: '',
    },
    history: {
      push: jest.fn(),
    },
    verifyMailboxToken: jest.fn(() => Promise.resolve()),
    verifyAbuseToken: jest.fn(() => Promise.resolve()),
    verifyPostmasterToken: jest.fn(() => Promise.resolve()),
    tokenStatus: null,
  };

  let wrapper;
  let instance;

  beforeEach(() => {
    wrapper = shallow(<VerifyToken {...props} />);
    instance = wrapper.instance();
  });

  it('should render nothing', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('verify domain', () => {
    it('should not verify if domain does not exist', () => {
      instance.verifyDomain({ domain: 'no.co', mailbox: 'mail', token: '123' });
      expect(props.verifyMailboxToken).not.toHaveBeenCalled();
    });

    it('should not verify unless all required params are present', () => {
      instance.verifyDomain({ mailbox: 'mail', token: '123' });
      instance.verifyDomain({ domain: 'foo.co', token: '123' });
      instance.verifyDomain({ domain: 'foo.co', mailbox: 'mail' });
      expect(props.verifyMailboxToken).not.toHaveBeenCalled();
    });

    it('should verify mailbox with a domain shared with all', () => {
      instance.verifyDomain({ domain: 'foo.co', mailbox: 'mail', token: '123' });
      expect(props.verifyMailboxToken).toHaveBeenCalledWith({ id: 'foo.co', token: '123' });
    });

    it('should verify abuse with subaccount', () => {
      instance.verifyDomain({ domain: 'bar.co', mailbox: 'abuse', token: '123' });
      expect(props.verifyAbuseToken).toHaveBeenCalledWith({
        id: 'bar.co',
        subaccount: 101,
        token: '123',
      });
    });

    it('should verify postmaster with a primary only domain', () => {
      instance.verifyDomain({ domain: 'baz.co', mailbox: 'postmaster', token: '123' });
      expect(props.verifyPostmasterToken).toHaveBeenCalledWith({
        id: 'baz.co',
        subaccount: 0,
        token: '123',
      });
    });
  });

  describe('component did update', () => {
    it('show an error alert if domain is not valid', () => {
      wrapper.setProps({
        tokenStatus: { type: 'postmaster_at', domain: 'foo.co', postmaster_at_status: false },
      });
      expect(props.showAlert).toHaveBeenCalledWith({
        type: 'error',
        message: 'Unable to verify foo.co',
      });
    });

    it('show a success alert if domain has been verified', () => {
      wrapper.setProps({
        tokenStatus: { type: 'postmaster_at', domain: 'foo.co', postmaster_at_status: 'valid' },
      });
      expect(instance.props.showAlert).toHaveBeenCalledWith({
        type: 'success',
        message: 'foo.co has been verified',
      });
      expect(instance.props.history.push).toHaveBeenCalledWith(
        '/account/sending-domains/edit/foo.co',
      );
    });
  });
});
