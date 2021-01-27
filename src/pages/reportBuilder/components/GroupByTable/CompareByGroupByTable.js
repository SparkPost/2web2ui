import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { _getTableDataReportBuilder } from 'src/actions/summaryChart';
import { hasSubaccounts as hasSubaccountsSelector } from 'src/selectors/subaccounts';
import { ApiErrorBanner, Empty, PanelLoading, TableCollection, Unit } from 'src/components';
import { Panel, Table, Box, Tag } from 'src/components/matchbox';
import EmptyCell from 'src/components/collection/EmptyCell';
import { GROUP_BY_CONFIG } from '../../constants';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import AddFilterLink from '../AddFilterLink';
import styles from './ReportTable.module.scss';
import useGroupByTable from './useGroupByTable';
import GroupByOption from './GroupByOption';

const tableWrapper = props => {
  return (
    <Panel>
      <Table freezeFirstColumn>{props.children}</Table>
    </Panel>
  );
};

export const CompareByTable = () => {
  const { data, status, setGroupBy, groupBy, comparisonType, refetch } = useGroupByTable();
  const {
    selectors: { selectSummaryMetricsProcessed: metrics },
  } = useReportBuilderContext();
  const hasSubaccounts = useSelector(hasSubaccountsSelector);
  const subaccounts = useSelector(state => state.subaccounts.list);
  const group = GROUP_BY_CONFIG[groupBy];

  const tableData = _.flatten(data);

  const getColumnHeaders = () => {
    const primaryCol = {
      key: 'group-by',
      label: group.label,
      className: cx(styles.HeaderCell, styles.FirstColumnHeader),
      sortKey: group.keyName,
    };

    const comparisonCol = {
      key: comparisonType,
      label: comparisonType,
      className: cx(styles.HeaderCell, styles.FirstColumnHeader),
      sortKey: comparisonType,
    };

    const metricCols = metrics.map(({ label, key }) => ({
      key,
      label: <Box textAlign="right">{label}</Box>,
      className: cx(styles.HeaderCell, styles.NumericalHeader),
      align: 'right',
      sortKey: key,
    }));

    return [primaryCol, comparisonCol, ...metricCols];
  };

  const getSubaccountFilter = subaccountId => {
    if (subaccountId === 0) {
      return { type: 'Subaccount', value: 'Primary Account (ID 0)', id: 0 };
    }

    const subaccount = subaccounts.find(({ id }) => {
      return id === subaccountId;
    });

    const value = subaccount
      ? `${subaccount?.name} (ID ${subaccount?.id})`
      : `Subaccount ${subaccountId}`;
    return { type: 'Subaccount', value, id: subaccountId };
  };

  const getRowData = row => {
    const filterKey = row[group.keyName];
    const newFilter =
      group.label === 'Subaccount'
        ? getSubaccountFilter(filterKey)
        : { type: group.label, value: filterKey };

    const primaryCol = <AddFilterLink newFilter={newFilter} />;
    const comparisonCol = <Tag>{row[comparisonType]}</Tag>;
    const metricCols = metrics.map(({ key, unit }) => (
      <Box textAlign="right" key={key}>
        {row[key] ? <Unit value={row[key]} unit={unit} /> : <EmptyCell />}
      </Box>
    ));

    return [primaryCol, comparisonCol, ...metricCols];
  };

  const TableContent = () => {
    if (!group || metrics.length === 0) {
      return null;
    }

    if (status === 'error') {
      return (
        <Panel>
          <Panel.Section>
            <ApiErrorBanner
              reload={refetch}
              status="muted"
              title="Unable to load report"
              message="Please try again"
            />
          </Panel.Section>
        </Panel>
      );
    }

    if (status === 'loading') {
      return <PanelLoading minHeight="250px" />;
    }

    if (!tableData.length) {
      return (
        <Panel>
          <Empty message="There is no data to display" />
        </Panel>
      );
    }

    return (
      <TableCollection
        rowKeyName={group.keyName}
        columns={getColumnHeaders()}
        getRowData={getRowData}
        pagination
        defaultPerPage={10}
        rows={tableData}
        defaultSortColumn="group-by"
        defaultSortDirection="desc"
        wrapperComponent={tableWrapper}
      />
    );
  };

  return (
    <>
      <Panel marginBottom="-1px">
        <Panel.Section>
          <GroupByOption
            disabled={status === 'loading' || metrics.length === 0}
            groupBy={groupBy}
            hasSubaccounts={hasSubaccounts}
            onChange={setGroupBy}
          />
        </Panel.Section>
      </Panel>
      <div data-id="summary-table">
        <TableContent />
      </div>
    </>
  );
};

export default CompareByTable;
