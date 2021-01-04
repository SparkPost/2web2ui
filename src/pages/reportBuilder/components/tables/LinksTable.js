import React, { useCallback } from 'react';
import { Percent, TableCollection } from 'src/components';
import { safeRate } from 'src/helpers/math';
import {
  EmptyWrapper,
  FilterBoxWrapper,
  LoadingWrapper,
  TableCollectionBody,
  TableWrapper,
} from '../Wrappers';

const filterBoxConfig = {
  show: true,
  keyMap: { link: 'link_name' },
  itemToStringKeys: ['link_name'],
  exampleModifiers: ['link_name'],
  matchThreshold: 5,
  label: 'Filter',
  wrapper: FilterBoxWrapper,
};

const columns = [
  { label: 'Link', sortKey: 'link_name' },
  { label: 'Unique Clicks', sortKey: 'count_raw_clicked_approx' },
  { label: 'Clicks', sortKey: 'count_clicked' },
  { label: 'Percent of Total', sortKey: 'percentage_clicked' },
];

export default function LinksTable({ totalClicks, links = [], loading }) {
  const getRowData = useCallback(
    rowData => {
      const { count_clicked, count_raw_clicked_approx, link_name } = rowData;
      return [
        link_name,
        count_raw_clicked_approx,
        count_clicked,
        <Percent value={safeRate(count_clicked, totalClicks)} />,
      ];
    },
    [totalClicks],
  );

  if (loading) {
    return <LoadingWrapper />;
  }

  if (!Boolean(links.length)) {
    return <EmptyWrapper message="No links to report" />;
  }

  return (
    <TableCollection
      columns={columns}
      rows={links}
      getRowData={getRowData}
      pagination
      defaultSortColumn="link_name"
      defaultSortDirection="asc"
      wrapperComponent={TableWrapper}
      filterBox={filterBoxConfig}
    >
      {props => <TableCollectionBody {...props} />}
    </TableCollection>
  );
}
