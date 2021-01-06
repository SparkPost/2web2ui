import { segmentIdentify, SEGMENT_TRAITS, segmentPage } from '../segment';

describe('segment helpers', () => {
  describe('segmentIdentify', () => {
    beforeEach(() => {
      window.analytics = {};
      window.analytics.identify = jest.fn();
      window.analytics.group = jest.fn();
    });

    it('does not pass invalid traits to segment', () => {
      const traits = {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.USER_ID]: 'username',
        [SEGMENT_TRAITS.TENANT]: 'tenant',
        'invalid-trait': 'this-is-invalid',
      };
      segmentIdentify(traits);
      expect(window.analytics.identify).toBeCalledWith('email@abc.com//123', {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.USER_ID]: 'username',
        [SEGMENT_TRAITS.TENANT]: 'tenant',
      });
      expect(window.analytics.group).toBeCalledWith('tenant//123', { groupId: 'tenant//123' });
    });

    it('passes valid boolean traits to segment', () => {
      const traits = {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.USER_ID]: 'username',
        [SEGMENT_TRAITS.TENANT]: 'tenant',
        [SEGMENT_TRAITS.SSO_ENABLED]: true,
        [SEGMENT_TRAITS.TFA_ENABLED]: false,
      };
      segmentIdentify(traits);
      expect(window.analytics.identify).toBeCalledWith('email@abc.com//123', {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.USER_ID]: 'username',
        [SEGMENT_TRAITS.TENANT]: 'tenant',
        [SEGMENT_TRAITS.SSO_ENABLED]: true,
        [SEGMENT_TRAITS.TFA_ENABLED]: false,
      });
    });

    it('does not call window.analytics.identify without user id/email', () => {
      const traits = {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.TENANT]: 'test-tenant',
      };
      segmentIdentify(traits);
      expect(window.analytics.identify).toBeCalledTimes(0);
      expect(window.analytics.group).toBeCalledTimes(0);
    });

    it('calls window.analytics.identify with the correct id', () => {
      const traits = {
        [SEGMENT_TRAITS.CUSTOMER_ID]: 123,
        [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
        [SEGMENT_TRAITS.USER_ID]: 'username',
        [SEGMENT_TRAITS.TENANT]: 'test-tenant',
      };

      segmentIdentify(traits);
      expect(window.analytics.identify).toBeCalledWith('email@abc.com//123', traits);
      expect(window.analytics.group).toBeCalledWith('test-tenant//123', {
        groupId: 'test-tenant//123',
      });
    });
  });

  describe('segmentPage', () => {
    it('calls window.analytics.page when it is set', () => {
      window.analytics = {};
      window.analytics.page = jest.fn();

      segmentPage();
      expect(window.analytics.page).toBeCalled();
    });
  });
});
