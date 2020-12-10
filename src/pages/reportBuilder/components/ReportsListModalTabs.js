import React from 'react';
import { MoreHoriz } from '@sparkpost/matchbox-icons';
import { TableCollection, Subaccount } from 'src/components';
import {
  ActionList,
  Box,
  Button,
  Popover,
  ScreenReaderOnly,
  Table,
  Tag,
} from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { ButtonLink, PageLink } from 'src/components/links';

const allReportsColumns = [
  { label: 'Name', sortKey: 'name' },
  { label: 'Last Modification', width: '25%', sortKey: 'modified' },
  { label: 'Created By', sortKey: 'creator' },
  {},
  {},
];

const myReportsColumns = [
  { label: 'Name', sortKey: 'name' },
  { label: 'Last Modification', sortKey: 'modified' },
  {},
];

const FilterBoxWrapper = props => (
  <Box borderBottom="400" padding="400">
    {props}
  </Box>
);

const Actions = ({ id, handleDelete, handleEdit, reportType, report, ...rest }) => {
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
        <ActionList.Action content="Delete" onClick={() => handleDelete(report)} />
        {rest.isScheduledReportsEnabled && (
          <ActionList.Action
            content="Schedule"
            to={`/signals/schedule/${report.id}`}
            as={PageLink}
          />
        )}
        <ActionList.Action content="Edit" onClick={() => handleEdit(report)} />
      </ActionList>
    </Popover>
  );
};

export const MyReportsTab = ({
  reports,
  currentUser,
  handleReportChangeAndClose,
  isScheduledReportsEnabled,
  handleDelete,
  handleEdit,
}) => {
  const myReports = reports.filter(({ creator }) => creator === currentUser);

  const myReportsRows = report => {
    const { name, modified, isLast } = report;

    return [
      <ButtonLink
        onClick={() => {
          handleReportChangeAndClose(report);
        }}
      >
        {name}
      </ButtonLink>,
      <div>{formatDateTime(modified)}</div>,
      <Actions
        isScheduledReportsEnabled={isScheduledReportsEnabled}
        id={`popover-myreports-${report.id}`}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        report={report}
        isLast={isLast}
      />,
    ];
  };
  return (
    <TableCollection
      rows={myReports}
      columns={myReportsColumns}
      getRowData={myReportsRows}
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
  isScheduledReportsEnabled,
  handleDelete,
  handleEdit,
}) => {
  const getColumnsForAllReports = () => {
    return allReportsColumns;
  };

  const allReportsRows = report => {
    const { name, modified, creator, subaccount_id, current_user_can_edit, isLast } = report;
    //conditionally render the actionlist
    const action = current_user_can_edit ? (
      <Actions
        isScheduledReportsEnabled={isScheduledReportsEnabled}
        id={`popover-allreports-${report.id}`}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        report={report}
        isLast={isLast}
      />
    ) : (
      ''
    );

    return [
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
      action,
    ];
  };
  return (
    <TableCollection
      rows={reports}
      columns={getColumnsForAllReports()}
      getRowData={allReportsRows}
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