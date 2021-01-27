import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import ComboBoxTypeaheadWrapper from 'src/components/reduxFormWrappers/ComboBoxTypeaheadWrapper';
import { getSubaccounts } from 'src/selectors/subaccounts';
import { list as listSubaccounts } from 'src/actions/subaccounts';

const isExclusiveItem = item => {
  return item < 0;
};

export const SubaccountsField = props => {
  const { listSubaccounts, disabled, subaccounts } = props;

  useEffect(() => {
    listSubaccounts();
  }, [listSubaccounts]);

  const subaccountItems = [
    { id: -1, name: 'Primary and all subaccounts' },
    { id: -2, name: 'Any subaccount' },
    { id: 0, name: 'Primary account' },
    ...subaccounts,
  ];

  const subaccountToString = subaccountId => {
    if (subaccountId === undefined) {
      return '';
    }
    const subaccount = subaccountItems.find(({ id }) => id === subaccountId) || {};
    return subaccountId > 0 ? `${subaccount.name} (${subaccount.id})` : subaccount.name;
  };

  const subAccountOptions = subaccountItems.map(({ id }) => id);

  return (
    <Field
      component={ComboBoxTypeaheadWrapper}
      disabled={disabled}
      isExclusiveItem={isExclusiveItem}
      itemToString={subaccountToString}
      id="combobox_subaccounts"
      label="Subaccounts"
      name="subaccounts"
      placeholder="Type To Search"
      results={subAccountOptions}
    />
  );
};

const mapStateToProps = state => ({
  subaccounts: getSubaccounts(state) || [],
});

export default connect(mapStateToProps, { listSubaccounts })(SubaccountsField);
