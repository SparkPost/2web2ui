import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';

import { _getTableDataReportBuilder } from 'src/actions/summaryChart';
import { hasSubaccounts as hasSubaccountsSelector } from 'src/selectors/subaccounts';

import { TableCollection, Unit, PanelLoading } from 'src/components';
import GroupByOption from './GroupByOption';
import { Empty } from 'src/components';
import { Panel, Table, Box, Grid } from 'src/components/matchbox';
import { GROUP_BY_CONFIG } from '../../constants';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import AddFilterLink from '../AddFilterLink';
import MultiSelectDropdown, { useMultiSelect } from 'src/components/MultiSelectDropdown';

import styles from './ReportTable.module.scss';

const tableWrapper = props => {
  return (
    <Panel>
      <Table freezeFirstColumn>{props.children}</Table>
    </Panel>
  );
};

export const GroupByTable = () => {
  const dispatch = useDispatch();
  const {
    selectors: { selectSummaryMetricsProcessed: metrics },
    state: reportOptions,
  } = useReportBuilderContext();
  const hasSubaccounts = useSelector(hasSubaccountsSelector);
  const subaccounts = useSelector(state => state.subaccounts.list);
  const { groupBy, tableData = [], tableLoading } = useSelector(state => state.summaryChart);
  const group = GROUP_BY_CONFIG[groupBy];

  const { checkboxes } = useMultiSelect({
    checkboxes: [
      { name: 'sending', label: 'Sending' },
      { name: 'panel', label: 'Panel' },
      { name: 'seed_list', label: 'Seed List' },
    ],
    useSelectAll: false,
  });

  const getColumnHeaders = () => {
    const primaryCol = {
      key: 'group-by',
      label: group.label,
      className: cx(styles.HeaderCell, styles.FirstColumnHeader),
      sortKey: group.keyName,
    };

    const metricCols = metrics.map(({ label, key }) => ({
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
    const metricCols = metrics.map(({ key, unit }) => (
      <Box textAlign="right" key={key}>
        <Unit value={row[key]} unit={unit} />
      </Box>
    ));

    return [primaryCol, ...metricCols];
  };

  const renderTable = () => {
    if (!group || metrics.length === 0) {
      return null;
    }

    if (tableLoading) {
      return <PanelLoading minHeight="250px" />;
    }

    if (!tableData.length) {
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
        rows={tableData}
        defaultSortColumn={metrics[0].key}
        defaultSortDirection="desc"
        wrapperComponent={tableWrapper}
      />
    );
  };

  return (
    <>
      <Panel marginBottom="-1px">
        <Panel.Section>
          <Grid>
            <Grid.Column xs={5}>
              <GroupByOption
                disabled={tableLoading || metrics.length === 0}
                groupBy={groupBy}
                hasSubaccounts={hasSubaccounts}
                onChange={value => {
                  dispatch(
                    _getTableDataReportBuilder({
                      groupBy: value,
                      metrics,
                      reportOptions: {
                        ...reportOptions,
                        filters: Boolean(reportOptions.filters.length)
                          ? reportOptions.filters
                          : undefined,
                      },
                    }),
                  );
                }}
              />
            </Grid.Column>
            <Grid.Column xs={4}></Grid.Column>
            <Grid.Column xs={3}>
              <MultiSelectDropdown checkboxes={checkboxes} label="Data Sources" />
            </Grid.Column>
          </Grid>
        </Panel.Section>
      </Panel>
      <div data-id="summary-table">{renderTable()}</div>
    </>
  );
};

export default GroupByTable;
