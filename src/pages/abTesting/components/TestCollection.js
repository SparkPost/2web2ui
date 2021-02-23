import React from 'react';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
// Components
import { PageLink } from 'src/components/links';
import { ScreenReaderOnly, Text } from 'src/components/matchbox';
import { TableCollection } from 'src/components';
import ActionPopover from 'src/components/actionPopover';
import StatusTag from './StatusTag';
import { formatDateTime } from 'src/helpers/date';
import OGStyles from '../ListPage.module.scss';
import HibanaStyles from '../ListPageHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

const filterBoxConfig = {
  show: true,
  itemToStringKeys: ['name', 'id', 'status', 'test_mode'],
  exampleModifiers: ['id', 'status', 'test_mode'],
};

export function TestCollection(props) {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const getDetailsLink = ({ id, version, subaccount_id }) =>
    `/ab-testing/${id}/${version}${setSubaccountQuery(subaccount_id)}`;

  const getColumns = () => {
    const columns = [
      { label: 'Name', sortKey: 'name' },
      { label: 'Status', sortKey: 'status' },
      { label: 'Template', sortKey: i => i.winning_template_id || i.default_template.template_id },
      { label: 'Last Modified', sortKey: 'updated_at' },
      { label: <ScreenReaderOnly>Actions</ScreenReaderOnly> },
    ];

    return columns;
  };

  const getRowData = ({
    id,
    version,
    subaccount_id,
    name,
    status,
    updated_at,
    default_template,
    winning_template_id,
  }) => {
    const actions = [
      {
        content: 'Edit Test',
        to: getDetailsLink({ id, version, subaccount_id }),
        as: PageLink,
        visible: status === 'scheduled' || status === 'draft',
        section: 1,
      },
      {
        content: 'View Test',
        to: getDetailsLink({ id, version, subaccount_id }),
        as: PageLink,
        visible: status === 'running' || status === 'cancelled' || status === 'completed',
        section: 1,
      },
      {
        content: 'Reschedule Test',
        to: {
          pathname: getDetailsLink({ id, version }),
          search: setSubaccountQuery(subaccount_id),
          state: {
            rescheduling: true,
          },
        },
        as: PageLink,
        visible: status === 'completed' || status === 'cancelled',
        section: 1,
      },
      {
        content: 'Cancel Test',
        visible: status === 'scheduled' || status === 'running',
        section: 2,
        onClick: () => props.toggleCancel(id, subaccount_id),
      },
      {
        content: 'Delete Test',
        section: 2,
        onClick: () => props.toggleDelete(id, subaccount_id),
      },
    ];

    const template = winning_template_id ? (
      <>
        <span className={styles.Winner}>Winner:</span> {winning_template_id}
      </>
    ) : (
      default_template.template_id
    );

    return [
      <>
        <p className={styles.Name}>
          <strong>
            <Text fontWeight="400">
              <PageLink to={getDetailsLink({ id, version, subaccount_id })}>{name}</PageLink>
            </Text>
          </strong>
        </p>
        <p className={styles.Id}>ID: {id}</p>
      </>,
      <StatusTag status={status} />,
      <p className={styles.Template}>{template}</p>,
      <p className={styles.LastUpdated}>{formatDateTime(updated_at)}</p>,
      <ActionPopover actions={actions} />,
    ];
  };

  const { abTests } = props;
  return (
    <TableCollection
      columns={getColumns()}
      rows={abTests}
      getRowData={getRowData}
      pagination={true}
      filterBox={filterBoxConfig}
      defaultSortColumn="updated_at"
      defaultSortDirection="desc"
    />
  );
}

export default TestCollection;
