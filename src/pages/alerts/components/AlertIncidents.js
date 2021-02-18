import React from 'react';
import { TableCollection, Empty } from 'src/components';
import { Panel, Tag } from 'src/components/matchbox';
import { FORMATS } from 'src/constants';
import { formatDateTime } from 'src/helpers/date';
import { METRICS, FILTERS_FRIENDLY_NAMES, SOURCE_FRIENDLY_NAMES } from '../constants/formConstants';
import { MAILBOX_PROVIDERS } from 'src/constants';
import { getEvaluatorOptions } from '../helpers/alertForm';
import { roundToPlaces } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';
import styles from './AlertIncidents.module.scss';

const AlertIncidents = ({ incidents = [], alert, subaccountIdToString }) => {
  const { metric, threshold_evaluator = {} } = alert;
  const { source } = threshold_evaluator;
  const { suffix } = getEvaluatorOptions(metric, source);

  const columns = [
    { label: 'Triggered', sortKey: 'first_fired', key: 'alert_incident_header_triggered' },
    { label: 'Resolved', sortKey: 'last_fired', key: 'alert_incident_header_status' },
    { label: 'For', key: 'alert_incident_header_filters' },
    {
      label: metric === 'health_score' ? SOURCE_FRIENDLY_NAMES[source] : METRICS[metric],
      sortKey: 'triggered_value',
      className: styles.rightAlign,
      align: 'right',
      key: 'alert_incident_header_label',
    },
  ];

  const getRowData = ({ first_fired, last_fired, status, triggered_value, filters }) => {
    const renderTags = () => {
      const filterTags = _.map(filters, (value, key) => {
        const finalValue = value === 'NULL' ? null : value;
        const getTagValue = value => {
          switch (key) {
            case 'subaccount_id':
              return subaccountIdToString(value);
            case 'mailbox_provider':
              return MAILBOX_PROVIDERS[value];
            default:
              return value;
          }
        };

        return (
          finalValue && (
            <span key={key}>
              <strong className={styles.BoldInline}>{FILTERS_FRIENDLY_NAMES[key]}</strong>
              &nbsp;
              <Tag>{getTagValue(finalValue)}</Tag>
            </span>
          )
        );
      });

      const joinTags = filterTags.reduce((acc, tag) => {
        if (!acc) {
          return [tag];
        }
        if (!tag) {
          return acc;
        }
        return [...acc, <span key="join_and"> and </span>, tag];
      }, null);

      return joinTags;
    };

    return [
      <div key="alert_incident_date">
        {formatDateTime(first_fired, FORMATS.MOMENT.LONG_DATETIME_ALT)}
      </div>,
      <div key="alert_incident_status">
        {status === 'Open' ? (
          <Tag color="yellow">Active</Tag>
        ) : (
          formatDateTime(moment(last_fired).add(45, 'minutes'), FORMATS.MOMENT.LONG_DATETIME_ALT)
        )}
      </div>,
      <div key="alert_incident_filters" className={styles.IncidentFilters}>
        {renderTags()}
      </div>,
      <div key="alert_incident_value" className={styles.rightAlign}>
        {roundToPlaces(triggered_value, 1)}
        {suffix}
      </div>,
    ];
  };

  return (
    <>
      {incidents.length <= 0 ? (
        <Panel.LEGACY>
          <Empty message="No incidents" />
        </Panel.LEGACY>
      ) : (
        <TableCollection
          rows={incidents}
          columns={columns}
          getRowData={getRowData}
          pagination
          defaultSortColumn="first_fired"
          defaultSortDirection="desc"
        />
      )}
    </>
  );
};

export default AlertIncidents;
