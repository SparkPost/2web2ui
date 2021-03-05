import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { subMonths } from 'date-fns';
import PrecisionSelector from './PrecisionSelector';
import { isForcedUTCRollupPrecision } from 'src/helpers/metrics';
import { Grid, Select, Tooltip } from 'src/components/matchbox';
import DatePicker from 'src/components/datePicker/DatePickerV2';
import { TimezoneTypeahead } from 'src/components/typeahead/TimezoneTypeahead';
import { getTimezoneOptions } from 'src/helpers/date';
import { METRICS_TIMEZONE_BLOCK_LIST } from 'src/constants';
import config from 'src/config';
import styles from '../ReportOptions.module.scss';

const { metricsRollupPrecisionMap } = config;
const RELATIVE_DATE_OPTIONS = ['hour', 'day', '7days', '30days', '90days', 'custom'];
const PRECISION_OPTIONS = metricsRollupPrecisionMap.map(({ value }) => ({
  value,
  label: _.startCase(_.words(value).join(' ')),
}));
const TIMEZONE_OPTIONS = getTimezoneOptions().filter(
  option => !METRICS_TIMEZONE_BLOCK_LIST.includes(option.value),
);

export const DateTimeSection = ({
  reportOptions,
  reportLoading,
  handleTimezoneSelect,
  refreshReportOptions,
}) => {
  const [shownPrecision, setShownPrecision] = useState('');
  const updateShownPrecision = useCallback(
    shownPrecision => {
      setShownPrecision(shownPrecision);
    },
    [setShownPrecision],
  );

  const isForcedUTC =
    reportOptions.precision && isForcedUTCRollupPrecision(reportOptions.precision);

  const isShownForcedUTC = shownPrecision && isForcedUTCRollupPrecision(shownPrecision);

  const timezoneDisabled = reportLoading || (isForcedUTC && shownPrecision === '');

  return (
    <Grid>
      <Grid.Column xs={12} md={6}>
        <DatePicker
          {...reportOptions}
          relativeDateOptions={RELATIVE_DATE_OPTIONS}
          disabled={reportLoading}
          onChange={refreshReportOptions}
          roundToPrecision={true}
          selectPrecision={true}
          label="Date Range"
          updateShownPrecision={updateShownPrecision}
          datePickerProps={{
            disabledDays: { after: new Date(), before: subMonths(new Date(), 6) },
          }}
        />
      </Grid.Column>
      <Grid.Column xs={6} md={4}>
        <div className={styles.TimezoneTooltipWrapper}>
          <Tooltip
            id="timezone-typahead-tooltip"
            disabled={!isShownForcedUTC && !timezoneDisabled}
            content="Day, week, and month precision only support UTC."
          >
            <TimezoneTypeahead
              options={TIMEZONE_OPTIONS}
              initialValue={reportOptions.timezone}
              onChange={handleTimezoneSelect}
              isForcedUTC={isForcedUTC}
              disabledAndUTCOnly={!!isShownForcedUTC}
              disabled={timezoneDisabled}
            />
          </Tooltip>
        </div>
      </Grid.Column>
      <Grid.Column xs={6} md={2}>
        {//We will show a fake selector that shows the temporary precision when the user
        //is selecting dates using the datepicker but has not confirmed the selection
        !shownPrecision ? (
          <PrecisionSelector
            from={reportOptions.from}
            to={reportOptions.to}
            selectedPrecision={reportOptions.precision}
            changeTime={refreshReportOptions}
            ready={reportOptions.isReady}
            disabled={reportLoading}
          />
        ) : (
          <Select
            label="Precision"
            id="precision-select"
            options={PRECISION_OPTIONS}
            value={shownPrecision}
            disabled={reportLoading}
            readOnly
          />
        )}
      </Grid.Column>
    </Grid>
  );
};

export default DateTimeSection;
