import React from 'react';
import { TableCollection, Subaccount } from 'src/components';
import { Box, Radio, Table, Tag, Tooltip } from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { shrinkToFit } from 'src/helpers/string';
import { PRESET_REPORT_CONFIGS } from 'src/pages/reportBuilder/constants';

const FilterBoxWrapper = props => (
  <Box borderBottom="400" padding="400">
    {props}
  </Box>
);
const SHRINK_LENGTH = 50;
export const MyReportsTabWithSelectableRows = ({ reports, currentUser, register }) => {
  const myReports = reports.filter(({ creator }) => creator === currentUser);
  const getMyReportColumns = () => {
    return [
      { label: 'Name', sortKey: 'name', maxWidth: '250' },
      { label: 'Last Modification', sortKey: 'modified' },
    ];
  };
  const TableWrapper = ({ children }) => {
    return (
      <Radio.Group label="reportList" labelHidden>
        <Table>{children}</Table>
      </Radio.Group>
    );
  };
  const myReportsRows = report => {
    const { name, modified, id } = report;
    return [
      <Radio value={id} id={id} key={id} ref={register} name="reportId" label={name} />,
      <div>{formatDateTime(modified)}</div>,
    ];
  };
  return (
    <TableCollection
      rows={myReports}
      columns={getMyReportColumns()}
      getRowData={myReportsRows}
      wrapperComponent={TableWrapper}
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

export const AllReportsTabWithSelectableRows = ({ reports, register }) => {
  const getColumnsForAllReports = () => {
    return [
      { label: 'Name', sortKey: 'name' },
      { label: 'Last Modification', width: '25%', sortKey: 'modified' },
      { label: 'Created By', sortKey: 'creator' },
      {},
    ];
  };

  const TableWrapper = ({ children }) => {
    return (
      <Radio.Group label="reportList" labelHidden>
        <Table>{children}</Table>
      </Radio.Group>
    );
  };

  const allReportsRows = report => {
    const { name, modified, creator, subaccount_id, id } = report;
    return [
      <Radio
        value={id}
        id={id}
        key={id}
        ref={register}
        label={
          <Tooltip id={id} dark content={name}>
            {/* can't find a better way to do this and stop making the Modal scroll horizontally when the reports have huge names*/}
            {/* label text is not getting wrapped vertically for Radio */}
            {shrinkToFit(name, SHRINK_LENGTH)}
          </Tooltip>
        }
        name="reportId"
        maxWidth="200"
      />,
      <div>{modified ? formatDateTime(modified) : ''}</div>,
      <div>{creator}</div>,
      <>
        {subaccount_id !== undefined ? (
          <Tag>
            <Subaccount id={subaccount_id} master={subaccount_id === 0} shrinkLength={12} />
          </Tag>
        ) : null}
      </>,
    ];
  };
  return (
    <TableCollection
      rows={[...reports, ...PRESET_REPORT_CONFIGS]}
      columns={getColumnsForAllReports()}
      getRowData={allReportsRows}
      wrapperComponent={TableWrapper}
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
