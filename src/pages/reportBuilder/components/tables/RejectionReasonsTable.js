import React from 'react';
import { LongTextContainer, TableCollection } from 'src/components';
import {
  EmptyWrapper,
  FilterBoxWrapper,
  LoadingWrapper,
  TableCollectionBody,
  TableWrapper,
} from '../Wrappers';

const filterBoxConfig = {
  show: true,
  keyMap: { category: 'rejection_category_name' },
  itemToStringKeys: ['rejection_category_name', 'domain', 'reason'],
  exampleModifiers: ['domain', 'category'],
  matchThreshold: 5,
  label: 'Filter',
  wrapper: FilterBoxWrapper,
};

const columns = [
  { label: 'Count', sortKey: 'count_rejected' },
  { label: 'Category', sortKey: 'rejection_category_name' },
  { label: 'Reason', width: '45%', sortKey: 'reason' },
  { label: 'Domain', sortKey: 'domain' },
];

export default function RejectionReasonsTable({ reasons, loading }) {
  const getRowData = rowData => {
    const { reason, domain, rejection_category_name, count_rejected } = rowData;

    return [count_rejected, rejection_category_name, <LongTextContainer text={reason} />, domain];
  };

  if (loading) {
    return <LoadingWrapper />;
  }

  if (!Boolean(reasons.length)) {
    return <EmptyWrapper message="No rejection reasons to report" />;
  }

  return (
    <TableCollection
      columns={columns}
      rows={reasons}
      getRowData={getRowData}
      pagination
      defaultSortColumn="count_rejected"
      defaultSortDirection="desc"
      wrapperComponent={TableWrapper}
      filterBox={filterBoxConfig}
    >
      {props => <TableCollectionBody {...props} />}
    </TableCollection>
  );
}
