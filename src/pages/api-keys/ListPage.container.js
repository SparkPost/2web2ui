import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

// Actions
import { listApiKeys, hideNewApiKey } from 'src/actions/api-keys';
import { list as listSubaccounts } from 'src/actions/subaccounts';

// Selectors
import { hasSubaccounts } from 'src/selectors/subaccounts';
import { selectKeysForAccount } from 'src/selectors/api-keys';

// Components/helpers
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { ListPage } from './ListPage';
import { useHibana } from 'src/context/HibanaContext';

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();

  return <ListPage isHibanaEnabled={isHibanaEnabled} {...props} />;
}

const mapDispatchToProps = { listApiKeys, hideNewApiKey, listSubaccounts };

function mapStateToProps(state) {
  const { error, newKey, keysLoading } = state.apiKeys;

  return {
    hasSubaccounts: hasSubaccounts(state),
    subaccounts: state.subaccounts.list,
    keys: selectKeysForAccount(state),
    error,
    newKey,
    loading: keysLoading,
    isEmptyStateEnabled: isAccountUiOptionSet('allow_empty_states')(state),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListPageContainer);
