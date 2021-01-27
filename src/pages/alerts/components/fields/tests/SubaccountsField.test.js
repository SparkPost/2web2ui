import React from 'react';
import { mount, shallow } from 'enzyme';
import { reduxForm } from 'redux-form';
import TestApp from 'src/__testHelpers__/TestApp';
import { SubaccountsField } from '../SubaccountsField';

describe('Subaccount Field', () => {
  const defaultProps = {
    disabled: false,
    listSubaccounts: () => {},
    subaccounts: [{ id: 1, name: 'My Subaccount' }],
  };

  const subject = (props = {}) => shallow(<SubaccountsField {...defaultProps} {...props} />);

  it('renders combo box field', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders disabled combo box field', () => {
    const wrapper = subject({ disabled: true });
    expect(wrapper).toHaveProp('disabled', true);
  });

  it('calls listSubaccounts on mount', () => {
    const listSubaccounts = jest.fn();
    const ReduxFormWrapper = reduxForm({
      form: 'foo',
      initialValues: { subaccounts: [] },
    })(SubaccountsField);

    mount(
      <TestApp>
        <ReduxFormWrapper {...defaultProps} listSubaccounts={listSubaccounts} />
      </TestApp>,
    );

    expect(listSubaccounts).toHaveBeenCalled();
  });

  describe('isExclusiveItem function', () => {
    const wrapper = subject();
    const isExclusiveItem = wrapper.prop('isExclusiveItem');

    it('returns true for subaccount ids -1 and -2', () => {
      expect(isExclusiveItem(-1)).toEqual(true);
      expect(isExclusiveItem(-2)).toEqual(true);
    });

    it('returns false for subaccount ids > 0', () => {
      expect(isExclusiveItem(0)).toEqual(false);
      expect(isExclusiveItem(101)).toEqual(false);
    });
  });

  describe('itemToString function', () => {
    const wrapper = subject();
    const itemToString = wrapper.prop('itemToString');

    it('returns only the name for primary, primary&all, and any', () => {
      expect(itemToString(-1)).toEqual('Primary and all subaccounts');
      expect(itemToString(-2)).toEqual('Any subaccount');
      expect(itemToString(0)).toEqual('Primary account');
    });

    it('returns false for subaccount ids > 0', () => {
      expect(itemToString(1)).toEqual('My Subaccount (1)');
    });
  });
});
