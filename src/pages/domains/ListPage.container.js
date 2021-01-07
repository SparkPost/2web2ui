import { connect } from 'react-redux';
import { showAlert } from 'src/actions/globalAlert';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { ListPage } from './ListPage';
import React from 'react';
import { useHibana } from 'src/context/HibanaContext';

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();

  return <ListPage isHibanaEnabled={isHibanaEnabled} {...props} />;
}

const mapDispatchToProps = { showAlert };

function mapStateToProps(state) {
  return {
    isEmptyStateEnabled: isAccountUiOptionSet('allow_empty_states')(state),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListPageContainer);
