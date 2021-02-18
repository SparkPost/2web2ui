import React from 'react';
import { FORMATS } from 'src/constants';
import { getDates } from 'src/helpers/signals';
import DatePicker from 'src/components/datePicker/DatePicker';
import withSignalOptions from '../../containers/withSignalOptions';
import { minDays } from 'src/helpers/validation';
import { Label } from 'src/components/matchbox';
import moment from 'moment';

const OPTIONS = ['7days', '14days', '30days', '90days', 'custom'];

export function DateFilter({
  signalOptions,
  changeSignalOptions,
  left,
  now = new Date(),
  label = null,
}) {
  // Constructs dates from relative range or custom dates
  function handleChange(updates) {
    changeSignalOptions(getDates({ ...updates, now }));
  }

  return (
    <>
      {label && <Label label={label} />}
      <DatePicker
        now={moment(now)
          .subtract(1, 'day')
          .toDate()}
        from={signalOptions.from}
        to={signalOptions.to}
        relativeDateOptions={OPTIONS}
        relativeRange={signalOptions.relativeRange}
        onChange={handleChange}
        dateFieldFormat={FORMATS.DATE_FNS.DATE}
        datePickerProps={{
          disabledDays: {
            after: moment(now)
              .subtract(1, 'day')
              .toDate(),
            before: moment(now)
              .subtract(91, 'day')
              .toDate(),
          },
          fromMonth: moment(now)
            .subtract(91, 'day')
            .toDate(),
        }}
        hideManualEntry
        left={left}
        validate={minDays(7)}
      />
    </>
  );
}

export default withSignalOptions(DateFilter);
