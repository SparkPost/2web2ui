import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { InfoOutline } from '@sparkpost/matchbox-icons';
import { Box, Panel, Tooltip } from 'src/components/matchbox';
import useUniqueId from 'src/hooks/useUniqueId';
import { Empty, PanelLoading, TableCollection } from 'src/components';
import { map as METRICS_MAP } from 'src/config/metrics';
import { formatNumber, formatPercent } from 'src/helpers/units';
import { safeRate } from 'src/helpers/math';

const StyledTooltipIcon = styled.div`
  margin-left: 5px;
  transform: translateY(-1px);
`;

const COLUMNS = [
  {
    key: 'link_name',
    label: 'Link',
    sortKey: 'link_name',
    width: '30%',
  },
  {
    key: 'count_raw_clicked_approx',
    label: (
      <HeaderTooltip tooltipContent={METRICS_MAP.count_raw_clicked_approx.description}>
        Unique Clicks
      </HeaderTooltip>
    ),
    sortKey: 'count_raw_clicked_approx',
    width: '30%',
  },
  {
    key: 'count_clicked',
    label: (
      <HeaderTooltip tooltipContent={METRICS_MAP.count_clicked.description}>Clicks</HeaderTooltip>
    ),
    sortKey: 'count_clicked',
    width: '20%',
  },
  {
    key: 'percentage_clicked',
    label: 'Percent of Total',
    sortKey: 'percentage_clicked',
    width: '20%',
  },
];

const DataRow = row => [
  row.link_name,
  formatNumber(row.count_raw_clicked_approx),
  formatNumber(row.count_clicked),
  formatPercent(row.percentage_clicked),
];

export default function EngagementTable({ data, loading }) {
  if (loading) {
    return <PanelLoading />;
  }

  if (data.length === 0) {
    return (
      <Panel.LEGACY>
        <Empty message="No clicks to report" />
      </Panel.LEGACY>
    );
  }

  // Manually count the total number of clicks (FWIW didn't included metric with chart data request,
  // and use the result here to avoid the dependency)
  const totalClicks = _.sumBy(data, 'count_clicked');

  // Must include percentage in data for sorting
  const dataWithPercentage = data.map(row => ({
    ...row,
    percentage_clicked: safeRate(row.count_clicked, totalClicks),
  }));

  return (
    <TableCollection
      columns={COLUMNS}
      defaultSortColumn="count_clicked"
      defaultSortDirection="desc"
      getRowData={DataRow}
      pagination
      rows={dataWithPercentage}
    />
  );
}

function HeaderTooltip({ children, tooltipContent }) {
  const id = useUniqueId('header-tooltip');

  return (
    <span>
      {children}
      <Tooltip id={id} dark top content={tooltipContent}>
        <Box as="span" color="blue.700">
          <StyledTooltipIcon as={InfoOutline} />
        </Box>
      </Tooltip>
    </span>
  );
}
