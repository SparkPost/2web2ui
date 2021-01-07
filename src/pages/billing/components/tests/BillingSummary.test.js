import React from 'react';
import { shallow } from 'enzyme';
import BillingSummary from '../BillingSummary';

// mock connected components as named functions for better snapshots
jest.mock('../../forms/UpdatePaymentForm', () => function UpdatePaymentForm() {});
jest.mock('../../forms/UpdateContactForm', () => function UpdateContactForm() {});
jest.mock('../../forms/AddIps', () => function AddIpsForm() {});

describe('Component: Billing Summary', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      account: {
        billing: {},
        subscription: {
          plan_volume: 15000,
        },
        rvUsage: {
          // TODO: Rename to usage upon consolidation
          recipient_validation: {
            month: { used: 123123 },
            timestamp: '2019-06-10T00:00:00.000Z',
          },
        },
        cancelLoading: false,
      },
      currentPlan: {
        isFree: true,
      },
      subscription: {
        bill_cycle_day: 5,
        pending_downgrades: [],
        products: [
          {
            plan: '100K-premier-0519',
            product: 'messaging',
          },

          {
            plan: 'ip-0519',
            product: 'dedicated_ip',
            quantity: 1,
            limit: 14,
            price: 20,
            volume: 1,
            billing_period: 'quarter',
          },
        ],
        type: 'active',
      },
      canChangePlan: true,
      canUpdateBillingInfo: true,
      canPurchaseIps: true,
      sendingIps: [],
      invoices: [],
      accountAgeInDays: 5,
    };
    wrapper = shallow(<BillingSummary {...props} />);
  });

  it('should render correctly for a standard free plan', () => {
    wrapper.setProps({ canUpdateBillingInfo: false, canPurchaseIps: false });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly for a paid plan', () => {
    wrapper.setProps({
      currentPlan: {
        isFree: false,
      },
      canPurchaseIps: true,
      canUpdateBillingInfo: true,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly if you can't change your plan", () => {
    wrapper.setProps({
      canChangePlan: false,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly if you can't update your billing info", () => {
    wrapper.setProps({
      canUpdateBillingInfo: false,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly if you can't buy IPs", () => {
    wrapper.setProps({
      canPurchaseIps: false,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with the payment info modal open', () => {
    wrapper.instance().handlePaymentModal();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with the billing contact modal open', () => {
    wrapper.instance().handleContactModal();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with IP modal open', () => {
    wrapper.instance().handleIpModal();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('should show the invoice history if there are invoices', () => {
    wrapper.setProps({ invoices: ['an invoice', 'another invoice'] });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render recipient validation section if option is enabled', () => {
    wrapper.setProps({ hasRecipientValidation: true });
    expect(wrapper.find('LabelledValue[label="Recipient Validation"]')).toExist();
  });
});
