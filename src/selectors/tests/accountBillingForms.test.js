import { onboardingInitialValues, changePlanInitialValues, updatePaymentInitialValues, updateContactInitialValues } from '../accountBillingForms';
import * as billingInfo from '../accountBillingInfo';
import { isSelfServeBilling } from 'src/helpers/conditions/account';

jest.mock('src/helpers/conditions/account');

const baseUser = {
  first_name: 'ann',
  last_name: 'perkins',
  email: 'ann@perkins.com',
  country_code: 'GG',
  state: 'EZ',
  zip_code: '54321'
};

describe('Selector: Account billing form', () => {
  let user;
  let store;

  beforeEach(() => {
    billingInfo.getPlansSelector = jest.fn(() => [
      { billingId: 'if', code: 'im free', isFree: true, status: 'public' },
      { billingId: 'inf', code: 'im not free', isFree: false, status: 'public' }
    ]);
    billingInfo.deepLinkablePlansSelector = jest.fn(() => [
      { billingId: 'inf', code: 'im not free', isFree: false, status: 'public' },
      { billingId: 'ias', code: 'im a secret', isFree: false, status: 'secret' }
    ]);
    isSelfServeBilling.mockImplementation(() => true);
    user = Object.assign({}, baseUser);
    store = { currentUser: user };
  });

  describe('changePlanInitialValues when NOT self serve', () => {
    beforeEach(() => {
      billingInfo.currentPlanSelector = jest.fn();
      isSelfServeBilling.mockImplementation(() => false);
    });

    it('should return change plan values: with a billing id', () => {
      billingInfo.currentPlanSelector.mockReturnValue({ billingId: '1', code: 'abc' });
      expect(changePlanInitialValues(store)).toMatchSnapshot();
    });

    it('should return change plan values: without billing id', () => {
      billingInfo.currentPlanSelector.mockReturnValue({ code: 'abc' });
      expect(changePlanInitialValues(store)).toMatchSnapshot();
    });

    it('should find and return secret plan', () => {
      expect(changePlanInitialValues(store, { code: 'im a secret' })).toMatchSnapshot();
    });
  });

  describe('onboardingInitialValues', () => {
    it('should set reasonable defaults', () => {
      expect(onboardingInitialValues(store)).toMatchSnapshot();
    });

    it('should set the plan picker to the plan specified by /join', () => {
      expect(onboardingInitialValues(store, { plan: 'im not free' })).toMatchSnapshot();
    });

    it('should gracefully handle invalid plan values from /join', () => {
      expect(onboardingInitialValues(store, { plan: 'im not even a real plan' })).toMatchSnapshot();
    });

    it('should set the plan picker to the secret plan specified by /join', () => {
      expect(onboardingInitialValues(store, { plan: 'im a secret' })).toMatchSnapshot();
    });
  });

  describe('updatePaymentInitialValues', () => {
    it('should return update payment values', () => {
      const store = { currentUser: Object.assign({}, baseUser) };
      expect(updatePaymentInitialValues(store)).toMatchSnapshot();
    });
  });

  describe('updateConteactInitialValues', () => {
    it('should return update contact values', () => {
      const store = { account: { billing: Object.assign({}, baseUser) }};
      expect(updateContactInitialValues(store)).toMatchSnapshot();
    });
  });
});
