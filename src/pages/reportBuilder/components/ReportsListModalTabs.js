import React from 'react';
import { MoreHoriz, PushPin } from '@sparkpost/matchbox-icons';
import styled from 'styled-components';
import { TableCollection, Subaccount } from 'src/components';
import {
  ActionList,
  Box,
  Button,
  Popover,
  ScreenReaderOnly,
  Table,
  Tag,
  Tooltip,
} from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { ButtonLink, PageLink } from 'src/components/links';

const PinToDashboardAction = styled(ActionList.Action)`
  &[disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const FilterBoxWrapper = props => (
  <Box borderBottom="400" padding="400">
    {props}
  </Box>
);

const Icons = ({ report, pinnedReport, allowDashboardV2 }) => {
  let icons = [];

  if (!allowDashboardV2) {
    return icons;
  }

  if (pinnedReport && pinnedReport.id === report.id) {
    icons.push(
      <Tooltip
        content="Pinned to Dashboard"
        key={`tooltip-key-${report.id}`}
        id={`tooltip-id-${report.id}`}
      >
        <PushPin label="pinned-to-dashboard" />
      </Tooltip>,
    );
  }

  return icons;
};

const Actions = ({
  id,
  handleDelete,
  handleEdit,
  handlePin,
  reportType,
  report,
  canEdit,
  ...rest
}) => {
  let reportIsPinned = false;
  if (rest.pinnedReport) {
    reportIsPinned = rest.pinnedReport.id === report.id;
  }

  return (
    <Popover
      left
      top={rest.isLast}
      id={id}
      trigger={
        <Button variant="minimal" aria-controls={id} data-id={id}>
          <Button.Icon as={MoreHoriz} />
          <ScreenReaderOnly>Open Menu</ScreenReaderOnly>
        </Button>
      }
    >
      <ActionList>
        {canEdit && <ActionList.Action content="Delete" onClick={() => handleDelete(report)} />}
        <ActionList.Action content="Schedule" to={`/signals/schedule/${report.id}`} as={PageLink} />
        {rest.allowDashboardV2 && (
          <PinToDashboardAction
            content="Pin to Dashboard"
            is="button"
            onClick={() => (reportIsPinned ? '' : handlePin(report, rest.pinnedReport))}
            disabled={reportIsPinned}
            tabIndex={reportIsPinned ? '-1' : 'false'}
          />
        )}
        {canEdit && <ActionList.Action content="Edit" onClick={() => handleEdit(report)} />}
      </ActionList>
    </Popover>
  );
};

const rowComponent = (cell, index) => {
  if (!cell) {
    return <Table.Cell></Table.Cell>;
  }
  const { type } = cell;
  const { id } = cell.props;

  if (type.name === 'Actions' || type.name === 'Icons') {
    return (
      <Box
        key={`row-${id}-cell-${index}`}
        as={Table.Cell}
        textAlign={['Actions', 'Icons'].includes(type.name) ? 'right' : 'left'}
      >
        {cell}
      </Box>
    );
  }

  return <Table.Cell key={`row-${id}-cell-${index}`}>{cell}</Table.Cell>;
};

export const MyReportsTab = ({
  reports,
  currentUser,
  handleReportChangeAndClose,
  handlePin,
  handleDelete,
  handleEdit,
  pinnedReport,
  allowDashboardV2,
}) => {
  const myReports = reports.filter(({ creator }) => creator === currentUser);

  const myReportColumnHeaders = [
    { label: 'Name', sortKey: 'name' },
    { label: 'Last Modification', sortKey: 'modified' },
    {},
    {},
  ];

  const myReportsColumns = report => {
    const { name, modified, isLast } = report;

    const myColumns = [
      <ButtonLink
        onClick={() => {
          handleReportChangeAndClose(report);
        }}
      >
        {name}
      </ButtonLink>,
      <div>{formatDateTime(modified)}</div>,
      <Icons
        report={report}
        pinnedReport={pinnedReport}
        allowDashboardV2={allowDashboardV2}
      ></Icons>,
      <Actions
        id={`popover-myreports-${report.id}`}
        handlePin={handlePin}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        report={report}
        pinnedReport={pinnedReport}
        allowDashboardV2={allowDashboardV2}
        isLast={isLast}
        canEdit={true}
      />,
    ];

    return myColumns;
  };

  const getMyReportRowComponent = report => {
    return <Table.Row>{myReportsColumns(report).map(rowComponent)}</Table.Row>;
  };

  return (
    <TableCollection
      rows={myReports}
      columns={myReportColumnHeaders}
      rowComponent={getMyReportRowComponent}
      wrapperComponent={Table}
      filterBox={{
        label: '',
        show: true,
        itemToStringKeys: ['name', 'modified'],
        exampleModifiers: ['name', 'modified'],
        maxWidth: '1250',
        wrapper: FilterBoxWrapper,
      }}
    />
  );
};

export const AllReportsTab = ({
  reports,
  handleReportChangeAndClose,
  handlePin,
  handleDelete,
  handleEdit,
  pinnedReport,
  allowDashboardV2,
}) => {
  const allReportColumnHeaders = [
    { label: 'Name', sortKey: 'name' },
    { label: 'Last Modification', width: '25%', sortKey: 'modified' },
    { label: 'Created By', sortKey: 'creator' },
    {},
    {},
    {},
  ];

  const getColumnsForAllReports = () => {
    return allReportColumnHeaders;
  };

  const allReportsColumns = report => {
    const { name, modified, creator, subaccount_id, current_user_can_edit, isLast } = report;

    const allColumns = [
      <ButtonLink
        onClick={() => {
          handleReportChangeAndClose(report);
        }}
      >
        {name}
      </ButtonLink>,
      <div>{formatDateTime(modified)}</div>,
      <div>{creator}</div>,
      <Tag>
        <Subaccount id={subaccount_id} master={subaccount_id === 0} shrinkLength={12} />
      </Tag>,
      <Icons
        report={report}
        pinnedReport={pinnedReport}
        allowDashboardV2={allowDashboardV2}
      ></Icons>,
      <Actions
        id={`popover-allreports-${report.id}`}
        handlePin={handlePin}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        report={report}
        pinnedReport={pinnedReport}
        allowDashboardV2={allowDashboardV2}
        isLast={isLast}
        canEdit={current_user_can_edit}
      />,
    ];

    return allColumns;
  };

  const getAllReportRowComponent = report => {
    return <Table.Row>{allReportsColumns(report).map(rowComponent)}</Table.Row>;
  };

  return (
    <TableCollection
      rows={reports}
      columns={getColumnsForAllReports()}
      rowComponent={getAllReportRowComponent}
      wrapperComponent={Table}
      filterBox={{
        label: '',
        show: true,
        itemToStringKeys: ['name', 'modified', 'creator'],
        exampleModifiers: ['name', 'modified', 'creator'],
        maxWidth: '1250',
        wrapper: FilterBoxWrapper,
      }}
    />
  );
};
