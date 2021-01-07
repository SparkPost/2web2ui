import React from 'react';
import cases from 'jest-in-case';
import { shallow } from 'enzyme';

import DedicatedIpSummarySection from '../DedicatedIpSummarySection';

const TEST_CASES = {
  'renders upgrade button and zero count': {},
  'renders zero count and first is free notice': {
    count: 0,
    canPurchaseIps: true,
    plan: { includesIp: true },
    limitOnDedicatedIps: 4,
    priceOfEachDedicatedIp: 20,
    billingPeriodOfDedicatedIp: 'month',
  },
  'renders count and zero cost': {
    count: 1,
    canPurchaseIps: true,
    plan: { includesIp: true },
    limitOnDedicatedIps: 4,
    priceOfEachDedicatedIp: 20,
    billingPeriodOfDedicatedIp: 'month',
  },
  'renders disabled add button, count, cost, and max plan notice': {
    count: 4, // configuration default
    canPurchaseIps: true,
    plan: {},
    limitOnDedicatedIps: 4,
    priceOfEachDedicatedIp: 20,
    billingPeriodOfDedicatedIp: 'month',
  },
};

cases(
  'DedicatedIpSummarySection',
  props => {
    const wrapper = shallow(<DedicatedIpSummarySection {...props} />);
    expect(wrapper).toMatchSnapshot();
  },
  TEST_CASES,
);
