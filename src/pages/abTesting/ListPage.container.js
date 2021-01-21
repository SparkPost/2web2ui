import { connect } from 'react-redux';
import { listAbTests, deleteAbTest, cancelAbTest } from 'src/actions/abTesting';
import { showAlert } from 'src/actions/globalAlert';
import { ListPage } from './ListPage';
import React from 'react';
import { useHibana } from 'src/context/HibanaContext';

function ListPageContainer(props) {
  const [{ isHibanaEnabled }] = useHibana();

  return <ListPage isHibanaEnabled={isHibanaEnabled} {...props} />;
}

const mapDispatchToProps = { listAbTests, deleteAbTest, cancelAbTest, showAlert };

function mapStateToProps(state) {
  const { abTesting } = state;
  return {
    abTests: abTesting.list,
    loading: abTesting.listLoading,
    deletePending: abTesting.deletePending,
    cancelPending: abTesting.cancelPending,
    error: abTesting.listError,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListPageContainer);
