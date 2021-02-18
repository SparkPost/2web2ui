import React from 'react';
import { FORMATS } from 'src/constants';
import { OGOnlyWrapper } from 'src/components/hibana';
import { ChevronRight } from '@sparkpost/matchbox-icons';
import { TableCollection, DisplayDate } from 'src/components';
import { PageLink } from 'src/components/links';
import { Button, Box, Grid, Panel, Table, Tag } from 'src/components/matchbox';
import styles from './IncidentsCollection.module.scss';
import DatePicker from 'src/components/datePicker/DatePickerV2';

const RELATIVE_DATE_OPTIONS = ['day', '7days', '30days', '90days', 'custom'];

const columns = [
  { label: 'Resource', sortKey: 'resource' },
  { label: 'Blocklist', sortKey: 'blocklist_name' },
  { label: 'Date Listed', sortKey: 'occurred_at' },
  { label: 'Date Resolved', sortKey: 'resolved_at' },
  { label: '' },
];

const ViewIncidentsButton = ({ to }) => {
  return (
    <PageLink as={Button} to={to} variant="minimal" size="small">
      <span>Incident Details</span>
      <ChevronRight />
    </PageLink>
  );
};

const getRowData = ({
  resource,
  id,
  blocklist_name,
  occurred_at_formatted,
  occurred_at_timestamp,
  resolved_at_timestamp,
  resolved_at_formatted,
}) => {
  return [
    <strong>{resource}</strong>,
    <strong>{blocklist_name}</strong>,

    <DisplayDate timestamp={occurred_at_timestamp} formattedDate={occurred_at_formatted} />,
    !resolved_at_formatted ? (
      <Tag color="red">Active</Tag>
    ) : (
      <DisplayDate timestamp={resolved_at_timestamp} formattedDate={resolved_at_formatted} />
    ),
    <ViewIncidentsButton to={`/signals/blocklist/incidents/${id}`} />,
  ];
};

const TableWrapper = props => (
  <>
    <div>
      <Table>{props.children}</Table>
    </div>
  </>
);

export const IncidentsCollection = props => {
  const { incidents, dateOptions, updateDateRange, search, updateTextField } = props;

  const renderHeader = ({ textFieldComponent }) => (
    <Grid>
      <OGOnlyWrapper as={Grid.Column} sm={12} lg={5}>
        <Box as={Grid.Column} xs={12} md={5}>
          <div className={styles.DatePicker}>
            <DatePicker
              {...dateOptions}
              label="Date Range"
              relativeDateOptions={RELATIVE_DATE_OPTIONS}
              onChange={updateDateRange}
              dateFieldFormat={FORMATS.DATE_FNS.DATE}
              hideManualEntry
            />
          </div>
        </Box>
      </OGOnlyWrapper>
      <OGOnlyWrapper as={Grid.Column} sm={12} lg={7}>
        <Box as={Grid.Column} xs={12} md={7}>
          {textFieldComponent}
        </Box>
      </OGOnlyWrapper>
    </Grid>
  );

  return (
    <TableCollection
      wrapperComponent={TableWrapper}
      columns={columns}
      rows={incidents}
      getRowData={getRowData}
      pagination={true}
      filterBox={{
        show: true,
        label: 'Filter Results',
        exampleModifiers: ['resource', 'blocklist_name', 'status'],
        initialValue: search,
        itemToStringKeys: ['resource', 'blocklist_name', 'status'],
        wrapper: props => <div className={styles.FilterBox}>{props}</div>,
        onBlur: value => updateTextField(value),
      }}
      defaultSortColumn="resolved_at"
      defaultSortDirection="desc"
      saveCsv={false}
    >
      {({ filterBox, collection, pagination }) => (
        <>
          <Panel.LEGACY>
            <Panel.LEGACY.Section>
              {renderHeader({ textFieldComponent: filterBox })}
            </Panel.LEGACY.Section>
            {collection}
          </Panel.LEGACY>
          {pagination}
        </>
      )}
    </TableCollection>
  );
};

export default IncidentsCollection;
