import React from 'react';
import { shallow } from 'enzyme';
import DedicatedIpCost from '../DedicatedIpCost';

describe('Component: Dedicated IP Cost', () => {
  let wrapper;
  beforeEach(() => {
    const props = {
      priceOfEachDedicatedIp: 20,
      quantity: 2,
      billingPeriodOfDedicatedIp: 'month',
    };
    wrapper = shallow(<DedicatedIpCost {...props} />);
  });
  it('should render a regular price', () => {
    expect(wrapper.text()).toEqual('$40.00 per month');
  });
});
