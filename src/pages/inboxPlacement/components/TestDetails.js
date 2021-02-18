import React, { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import { Search } from '@sparkpost/matchbox-icons';
import { FORMATS } from 'src/constants';
import { OGOnlyWrapper } from 'src/components/hibana';
import { Grid, Panel, Select, Tag, TextField } from 'src/components/matchbox';
import { Bold } from 'src/components/text';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import FolderPlacementBarChart from './FolderPlacementBarChart';
import PlacementBreakdown from './PlacementBreakdown';
import TimeToReceiveSection from './TimeToReceiveSection';
import AuthenticationResults from './AuthenticationResults';
import { PLACEMENT_FILTER_TYPES, PLACEMENT_FILTER_LABELS } from '../constants/types';
import OGStyles from './TestDetails.module.scss';
import HibanaStyles from './TestDetailsHibana.module.scss';

const PLACEMENTS_TYPE_OPTIONS = Object.values(PLACEMENT_FILTER_TYPES).map(type => ({
  label: PLACEMENT_FILTER_LABELS[type],
  value: type,
}));

const TestDetails = ({
  details,
  placementsByProvider,
  placementsByRegion,
  placementsBySendingIp,
}) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const [breakdownType, setBreakdownType] = useState(PLACEMENTS_TYPE_OPTIONS[0].value);
  const [searchPlacements, setSearchPlacements] = useState('');

  const debouncedSetSearchPlacements = useCallback(
    _.debounce(placements => setSearchPlacements(placements), 300),
    [],
  );

  const onSearchChange = useCallback(e => debouncedSetSearchPlacements(e.target.value), [
    debouncedSetSearchPlacements,
  ]);

  const onFilterChange = useCallback(e => {
    setBreakdownType(e.target.value);
  }, []);

  const placements = details.placement || {};

  let breakdownData = [];
  let textFieldPlaceholder = '';
  switch (breakdownType) {
    case PLACEMENT_FILTER_TYPES.REGION:
      breakdownData = placementsByRegion;
      textFieldPlaceholder = PLACEMENT_FILTER_LABELS[breakdownType];
      break;
    case PLACEMENT_FILTER_TYPES.SENDING_IP:
      breakdownData = placementsBySendingIp;
      textFieldPlaceholder = PLACEMENT_FILTER_LABELS[breakdownType];
      break;
    default:
      breakdownData = placementsByProvider;
      textFieldPlaceholder = `${
        PLACEMENT_FILTER_LABELS[PLACEMENT_FILTER_TYPES.MAILBOX_PROVIDER]
      } or ${PLACEMENT_FILTER_LABELS[PLACEMENT_FILTER_TYPES.REGION]}`;
      break;
  }

  if (searchPlacements) {
    const searchRegex = new RegExp(_.escapeRegExp(searchPlacements), 'i');
    switch (breakdownType) {
      case PLACEMENT_FILTER_TYPES.REGION:
        breakdownData = breakdownData.filter(item => item.region.match(searchRegex));
        break;
      case PLACEMENT_FILTER_TYPES.SENDING_IP:
        breakdownData = breakdownData.filter(item => item.sending_ip.match(searchRegex));
        break;
      default:
        breakdownData = breakdownData.filter(
          item => item.region.match(searchRegex) || item.mailbox_provider.match(searchRegex),
        );
        break;
    }
  }

  return (
    <>
      <Panel.LEGACY>
        <Panel.LEGACY.Section>
          <Grid>
            <Grid.Column xs={12} sm={6} md={6}>
              <Bold>Subject Line</Bold>
              <div>{details.subject}</div>
            </Grid.Column>
            <Grid.Column xs={12} sm={6} md={6}>
              <Bold>From</Bold>
              <div>{details.from_address}</div>
            </Grid.Column>
          </Grid>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <Grid>
            <Grid.Column xs={12} sm={4} md={4}>
              <Bold>Started</Bold>
              <div>
                {details.start_time
                  ? format(parseISO(details.start_time), FORMATS.DATE_FNS.LONG_DATETIME)
                  : null}
              </div>
            </Grid.Column>
            <Grid.Column xs={12} sm={4} md={4}>
              <Bold>Finished</Bold>
              <div>
                {details.end_time ? (
                  format(parseISO(details.end_time), FORMATS.DATE_FNS.LONG_DATETIME)
                ) : (
                  <Tag className={styles.StatusTag}>{details.status}</Tag>
                )}
              </div>
            </Grid.Column>
          </Grid>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <Bold>Test Name</Bold>
          <p>{details.test_name || 'None'}</p>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
      <div className={styles.FolderAuthenticationPanels}>
        <Panel.LEGACY
          sectioned
          title="Folder Placement"
          className={styles.FolderAuthenticationPanel}
        >
          <FolderPlacementBarChart placements={placements} />
        </Panel.LEGACY>
        <Panel.LEGACY sectioned title="Authentication" className={styles.FolderAuthenticationPanel}>
          <AuthenticationResults data={details.authentication} />
        </Panel.LEGACY>
      </div>
      <Panel.LEGACY title="Placement Breakdown">
        <Panel.LEGACY.Section>
          <div className={styles.BreakdownFilters}>
            <Select
              id="select-placement-type"
              data-id="select-placement-type"
              label="Breakdown by"
              options={PLACEMENTS_TYPE_OPTIONS}
              onChange={onFilterChange}
            />
            <TextField
              id="textfield-placement-search"
              data-id="text-field-placement-search"
              label="Filter"
              prefix={<Search />}
              onChange={onSearchChange}
              placeholder={textFieldPlaceholder}
            />
          </div>
        </Panel.LEGACY.Section>
        <PlacementBreakdown
          data-id="placement-breakdown-table"
          type={breakdownType}
          data={breakdownData}
        />
      </Panel.LEGACY>
      <OGOnlyWrapper as="div" className={styles.ClearSection} />
      <Panel.LEGACY sectioned title="Time to Receive Mail">
        <TimeToReceiveSection data={details.time_to_receive} />
      </Panel.LEGACY>
    </>
  );
};

export default TestDetails;
