import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Actions
import { listRecipientLists } from 'src/actions/recipientLists';

// Components and Helpers
import { ListPage } from './ListPage';
import { useHibana } from 'src/context/HibanaContext';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();

  const { error, listLoading: loading, list: recipientLists } = useSelector(
    state => state.recipientLists,
  );
  const isEmptyStateEnabled = useSelector(isAccountUiOptionSet('allow_empty_states'));
  const dispatch = useDispatch();

  return (
    <ListPage
      isHibanaEnabled={isHibanaEnabled}
      {...props}
      error={error}
      loading={loading}
      recipientLists={recipientLists}
      isEmptyStateEnabled={isEmptyStateEnabled}
      listRecipientLists={() => dispatch(listRecipientLists())}
    />
  );
}

export default ListPageContainer;
