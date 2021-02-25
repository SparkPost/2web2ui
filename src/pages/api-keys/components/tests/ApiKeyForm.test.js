import { shallow } from 'enzyme';
import React from 'react';

import { ApiKeyForm } from '../ApiKeyForm';

const props = {
  error: null,
  grants: {
    grant1: { key: 'value' },
    grant2: { key: 'value' },
    grant3: { key: 'value' },
    grant4: { key: 'value' }
  },
  subaccountGrants: {
    grant1: { key: 'value' },
    grant2: { key: 'value' }
  },
  hasSubaccounts: false,
  subaccount: false,
  isNew: true,
  handleSubmit: jest.fn(),
  onSubmit: jest.fn(),
  isReadOnly: false
};

let wrapper;

beforeEach(() => {
  wrapper = shallow(<ApiKeyForm {...props} />);
});

it('renders correctly - new and no subaccounts', () => {
  expect(wrapper).toMatchSnapshot();
});

it('renders correctly - readonly mode', () => {
  wrapper.setProps({ isReadOnly: true });
  expect(wrapper).toMatchSnapshot();
});

it('renders correctly - update and subaccounts', () => {
  wrapper.setProps({ isNew: false, hasSubaccounts: true, subaccount: true });
  expect(wrapper).toMatchSnapshot();
});

it('submits correctly', () => {
  const submitSpy = jest.spyOn(wrapper.instance().props, 'handleSubmit');
  wrapper.find('Form').simulate('submit');
  expect(submitSpy).toHaveBeenCalled();
  wrapper.setProps({ submitting: true });
  expect(wrapper).toMatchSnapshot();
});

describe('onSubmit tests', () => {
  let values;
  let instance;

  beforeEach(() => {
    values = {
      grants: {
        grant1: true,
        grant2: false,
        grant3: true,
        grant4: false
      },
      subaccount: 'my subby',
      grantsRadio: 'select',
      label: 'My key'
    };

    instance = wrapper.instance();
  });

  it('should format grants when selected', () => {
    instance.onSubmit(values);
    expect(instance.props.onSubmit).toHaveBeenCalledWith({
      label: 'My key',
      grants: ['grant1', 'grant3'],
      subaccount: 'my subby'
    });
  });

  it('should format grants when all radio is selected', () => {
    values.grantsRadio = 'all';
    instance.onSubmit(values);
    expect(instance.props.onSubmit).toHaveBeenCalledWith({
      label: 'My key',
      grants: ['grant1', 'grant2', 'grant3', 'grant4'],
      subaccount: 'my subby'
    });
  });

  it('should cast ips to array', () => {
    values.validIps = 'ip1,ip2,ip3';
    instance.onSubmit(values);
    expect(instance.props.onSubmit).toHaveBeenCalledWith({
      label: 'My key',
      grants: ['grant1', 'grant3'],
      subaccount: 'my subby',
      validIps: ['ip1', 'ip2', 'ip3']
    });
  });

  it('should set empty grants when none are selected', () => {
    values.grants = null;
    instance.onSubmit(values);
    expect(instance.props.onSubmit).toHaveBeenCalledWith({
      label: 'My key',
      grants: [],
      subaccount: 'my subby'
    });
  });

});
