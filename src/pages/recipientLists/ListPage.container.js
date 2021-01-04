import React from 'react';
import { connect } from 'react-redux';

// Actions
import { listRecipientLists } from 'src/actions/recipientLists';

// Components and Helpers
import { ListPage } from './ListPage';
import { useHibana } from 'src/context/HibanaContext';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();

  return <ListPage isHibanaEnabled={isHibanaEnabled} {...props} />;
}

const mapStateToProps = state => ({
  error: state.recipientLists.error,
  loading: state.recipientLists.listLoading,
  recipientLists: state.recipientLists.list,
  isEmptyStateEnabled: isAccountUiOptionSet('allow_empty_states')(state),
});

export default connect(mapStateToProps, { listRecipientLists })(ListPageContainer);
