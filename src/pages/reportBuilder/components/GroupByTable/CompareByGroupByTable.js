import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';

import { CheckboxWithLink } from './components';
import { _getTableDataReportBuilder } from 'src/actions/summaryChart';
import { hasSubaccounts as hasSubaccountsSelector } from 'src/selectors/subaccounts';
import { ApiErrorBanner, Empty, PanelLoading, TableCollection, Unit } from 'src/components';
import MultiCheckboxDropdown from 'src/components/MultiCheckboxDropdown';
import { Box, Column, Columns, Panel, Table, Tag } from 'src/components/matchbox';
import EmptyCell from 'src/components/collection/EmptyCell';
import { GROUP_BY_CONFIG } from '../../constants';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import AddFilterLink from '../AddFilterLink';
import styles from './ReportTable.module.scss';
import { useCompareByGroupByTable } from './useGroupByTable';
import GroupByOption from './GroupByOption';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { getFilterTypeLabel } from 'src/pages/reportBuilder/helpers';

const tableWrapper = props => {
  return (
    <Panel>
      <Table freezeFirstColumn>{props.children}</Table>
    </Panel>
  );
};

export const CompareByTable = () => {
  const {
    data,
    statuses = [],
    setGroupBy,
    groupBy,
    comparisonType,
    refetchAll,
    checkboxes,
    apiMetrics,
    hasSendingMetrics,
    hasInboxTrackingMetrics,
    hasSendingProduct,
    hasD12yProduct,
  } = useCompareByGroupByTable();
  const {
    selectors: { selectSummaryMetricsProcessed: metrics },
  } = useReportBuilderContext();
  const hasD12yMetricsEnabled = useSelector(state =>
    isAccountUiOptionSet('allow_deliverability_metrics')(state),
  );

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
      label: getFilterTypeLabel(comparisonType),
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
        {row[key] !== undefined && row[key] !== null ? (
          <Unit value={row[key]} unit={unit} />
        ) : (
          <EmptyCell />
        )}
      </Box>
    ));

    return [primaryCol, comparisonCol, ...metricCols];
  };

  const TableContent = () => {
    if (!group || metrics.length === 0) {
      return null;
    }

    if (statuses.includes('error')) {
      return (
        <Panel>
          <Panel.Section>
            <ApiErrorBanner
              reload={refetchAll}
              status="muted"
              title="Unable to load report"
              message="Please try again"
            />
          </Panel.Section>
        </Panel>
      );
    }

    if (statuses.includes('loading')) {
      return <PanelLoading minHeight="250px" />;
    }

    if (!Boolean(tableData.length) || !Boolean(apiMetrics.length)) {
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

  //TODO: Make a more reusable version of this component (without the double function call)
  const checkboxComponent = React.useMemo(
    () =>
      CheckboxWithLink({
        hasSendingProduct,
        hasD12yProduct,
        hasSendingMetrics,
        hasInboxTrackingMetrics,
      }),
    [hasSendingMetrics, hasSendingProduct, hasD12yProduct, hasInboxTrackingMetrics],
  );

  return (
    <>
      <Panel marginBottom="-1px">
        <Panel.Section>
          <Columns collapseBelow="sm">
            <GroupByOption
              disabled={statuses.includes('loading') || metrics.length === 0}
              groupBy={groupBy}
              hasSubaccounts={hasSubaccounts}
              onChange={setGroupBy}
            />
            {hasD12yMetricsEnabled && groupBy && (
              <Column>
                <MultiCheckboxDropdown
                  allowEmpty={false}
                  checkboxes={checkboxes}
                  id="group-by-dropdown"
                  label="Data Sources"
                  screenReaderDirections="Filter the table by the selected checkboxes"
                  checkboxComponent={checkboxComponent}
                />
              </Column>
            )}
          </Columns>
        </Panel.Section>
      </Panel>

      <div data-id="breakdown-by-table-with-comparisons">
        <TableContent />
      </div>
    </>
  );
};

export default CompareByTable;
