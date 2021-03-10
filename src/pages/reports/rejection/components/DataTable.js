import React, { Component } from 'react';
import { TableCollection, Empty, LongTextContainer } from 'src/components';
import { Panel } from 'src/components/matchbox';
import AddFilterLink from '../../components/AddFilterLink';

const columns = [
  { label: 'Reason', width: '45%', sortKey: 'reason' },
  { label: 'Domain', sortKey: 'domain' },
  { label: 'Category', sortKey: 'rejection_category_name' },
  { label: 'Count', sortKey: 'count_rejected' },
];

export class DataTable extends Component {
  getRowData = rowData => {
    const { reason, domain, rejection_category_name, count_rejected } = rowData;
    return [
      <LongTextContainer text={reason} />,
      <AddFilterLink
        newFilter={{ type: 'Recipient Domain', value: domain }}
        reportType="rejections"
        content={domain}
      />,
      rejection_category_name,
      count_rejected,
    ];
  };

  render() {
    const { list } = this.props;

    if (!list.length) {
      return (
        <Panel.LEGACY>
          <Empty message="No rejection reasons to report" />
        </Panel.LEGACY>
      );
    }

    return (
      <TableCollection
        columns={columns}
        rows={list}
        getRowData={this.getRowData}
        pagination
        defaultSortColumn="reason"
        defaultSortDirection="desc"
        filterBox={{
          show: true,
          keyMap: { category: 'rejection_category_name' },
          itemToStringKeys: ['rejection_category_name', 'domain', 'reason'],
          exampleModifiers: ['domain', 'category'],
          matchThreshold: 5,
        }}
      />
    );
  }
}

export default DataTable;
