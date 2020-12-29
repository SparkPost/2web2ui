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
import { useEmptyState } from 'src/hooks';
import APIKeysEmptyState from './components/EmptyState';
import { Loading } from 'src/components';
import { useHibana } from 'src/context/HibanaContext';

function ListPageContainer(props) {
  const {
    keys,
    loading,
    hasSubaccounts,
    subaccounts,
    isEmptyStateEnabled,
    listApiKeys,
    listSubaccounts,
    hideNewApiKey,
  } = props;
  const [{ isHibanaEnabled }] = useHibana();

  React.useEffect(() => {
    listApiKeys();

    return () => {
      // only want to show the new key after a create
      hideNewApiKey();
    };
  }, [hideNewApiKey, listApiKeys]);

  React.useEffect(() => {
    if (hasSubaccounts && subaccounts.length === 0) {
      listSubaccounts();
    }
  }, [hasSubaccounts, listSubaccounts, subaccounts]);

  const component = useEmptyState({
    isEmpty: keys.length === 0 && isEmptyStateEnabled && isHibanaEnabled,
    pageComponent: ListPage,
    emptyComponent: APIKeysEmptyState,
  })({ ...props, isHibanaEnabled });

  if (loading) {
    return <Loading />;
  }

  return component;
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
