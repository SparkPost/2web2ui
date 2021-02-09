import React from 'react';
import { useSelector } from 'react-redux';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import cx from 'classnames';

import { CheckboxWithLink } from './components';

import { _getTableDataReportBuilder } from 'src/actions/summaryChart';
import { hasSubaccounts as hasSubaccountsSelector } from 'src/selectors/subaccounts';

import { ApiErrorBanner, PanelLoading, TableCollection, Unit } from 'src/components';
import GroupByOption from './GroupByOption';
import { Empty } from 'src/components';
import { Box, Column, Columns, Panel, Table } from 'src/components/matchbox';
import { GROUP_BY_CONFIG } from '../../constants';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import AddFilterLink from '../AddFilterLink';
import MultiSelectDropdown from 'src/components/MultiSelectDropdown';
import EmptyCell from 'src/components/collection/EmptyCell';
import { useGroupByTable } from './useGroupByTable';
import styles from './ReportTable.module.scss';

const tableWrapper = props => {
  return (
    <Panel>
      <Table freezeFirstColumn>{props.children}</Table>
    </Panel>
  );
};

export const GroupByTable = () => {
  const {
    data,
    status,
    setGroupBy,
    groupBy,
    refetch,
    checkboxes,
    apiMetrics,
    hasSendingMetrics,
    hasInboxTrackingMetrics,
    hasSendingProduct,
    hasD12yProduct,
  } = useGroupByTable();
  const {
    selectors: { selectSummaryMetricsProcessed: displayMetrics },
  } = useReportBuilderContext();

  const hasSubaccounts = useSelector(hasSubaccountsSelector);
  const subaccounts = useSelector(state => state.subaccounts.list);
  const hasD12yMetricsEnabled = useSelector(state =>
    isAccountUiOptionSet('allow_deliverability_metrics')(state),
  );

  const group = GROUP_BY_CONFIG[groupBy];

  const getColumnHeaders = () => {
    const primaryCol = {
      key: 'group-by',
      label: group.label,
      className: cx(styles.HeaderCell, styles.FirstColumnHeader),
      sortKey: group.keyName,
    };

    const metricCols = displayMetrics.map(({ label, key }) => ({
      key,
      label: <Box textAlign="right">{label}</Box>,
      className: cx(styles.HeaderCell, styles.NumericalHeader),
      align: 'right',
      sortKey: key,
    }));

    return [primaryCol, ...metricCols];
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
    const metricCols = displayMetrics.map(({ key, unit }) => (
      <Box textAlign="right" key={key}>
        {row[key] !== undefined && row[key] !== null ? (
          <Unit value={row[key]} unit={unit} />
        ) : (
          <EmptyCell />
        )}
      </Box>
    ));

    return [primaryCol, ...metricCols];
  };

  const renderTable = () => {
    if (!group || displayMetrics.length === 0) {
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

    if (!Boolean(data.length) || !Boolean(apiMetrics.length)) {
      return (
        <Panel.LEGACY>
          <Empty message="There is no data to display" />
        </Panel.LEGACY>
      );
    }

    return (
      <TableCollection
        rowKeyName={group.keyName}
        columns={getColumnHeaders()}
        getRowData={getRowData}
        pagination
        defaultPerPage={10}
        rows={data}
        defaultSortColumn={displayMetrics[0].key}
        defaultSortDirection="desc"
        wrapperComponent={tableWrapper}
      />
    );
  };

  return (
    <>
      <Panel marginBottom="-1px">
        <Panel.Section>
          <Columns collapseBelow="sm">
            <GroupByOption
              disabled={status === 'loading' || displayMetrics.length === 0}
              groupBy={groupBy}
              hasSubaccounts={hasSubaccounts}
              onChange={setGroupBy}
            />
            {hasD12yMetricsEnabled && groupBy && (
              <Column>
                <MultiSelectDropdown
                  allowEmpty={false}
                  checkboxes={checkboxes}
                  id="group-by-dropdown"
                  label="Data Sources"
                  checkboxComponent={CheckboxWithLink({
                    hasSendingProduct,
                    hasD12yProduct,
                    hasSendingMetrics,
                    hasInboxTrackingMetrics,
                  })}
                />
              </Column>
            )}
          </Columns>
        </Panel.Section>
      </Panel>
      <div data-id="summary-table">{renderTable()}</div>
    </>
  );
};

export default GroupByTable;
