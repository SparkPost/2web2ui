import React from 'react';
import { BillingSummaryPage } from '../SummaryPage';
import { shallow } from 'enzyme';

describe('Page: BillingSummaryPage', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      account: {
        subscription: {},
      },
      billingInfo: { onZuoraPlan: true },
      loading: false,
      getBillingInfo: jest.fn(),
      getBundles: jest.fn(),
      getPlans: jest.fn(),
      getSubscription: jest.fn(),
      fetchAccount: jest.fn(),
      getUsage: jest.fn(),
      getInvoices: jest.fn(),
      accountAgeInDays: 5,
    };
    wrapper = shallow(<BillingSummaryPage {...props} />);
  });

  it('should render correctly when not loading', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when loading', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should get plans, sending ips, invoices, and account on mount', () => {
    expect(props.getSubscription).toHaveBeenCalledTimes(1);
    expect(props.fetchAccount).toHaveBeenCalledTimes(1);
    expect(props.getBillingInfo).toHaveBeenCalledTimes(1);
    expect(props.getInvoices).toHaveBeenCalledTimes(1);
    expect(props.getUsage).toHaveBeenCalledTimes(1);
  });
});
