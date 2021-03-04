import React, { useReducer, useEffect, useCallback } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Grid, TextField } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { formatToTimezone, parseDateTimeTz } from 'src/helpers/date';
import {
  getValidDateRange,
  getRollupPrecision,
  getMomentPrecisionByDate,
} from 'src/helpers/metrics';
import styles from './ManualEntryFormV2.module.scss';

const DATE_PLACEHOLDER = '1970-01-20';
const TIME_PLACEHOLDER = '12:00am';
const DEBOUNCE = 500;

const initialState = {
  toDate: '',
  toTime: '',
  fromDate: '',
  fromTime: '',
};

const actionTypes = {
  fieldChange: 'FIELD_CHANGE',
  syncProps: 'SYNC',
};

const TIME_FORMAT = "h:mmaaaaa'm'";
const DATE_FORMAT = 'yyyy-MM-dd';

export function ManualEntryForm(props) {
  const [state, dispatch] = useReducer((state, { type, payload }) => {
    switch (type) {
      case actionTypes.syncProps: {
        const { to, from, timezone } = payload;
        return {
          ...state,
          toDate: formatToTimezone(to, DATE_FORMAT, timezone),
          toTime: formatToTimezone(to, TIME_FORMAT, timezone),
          fromDate: formatToTimezone(from, DATE_FORMAT, timezone),
          fromTime: formatToTimezone(from, TIME_FORMAT, timezone),
        };
      }
      case actionTypes.fieldChange: {
        return { ...state, ...payload };
      }
      default:
        return state;
    }
  }, initialState);

  const getPrecision = getRollupPrecision;

  const syncPropsToState = useCallback(({ to, from, timezone }) => {
    dispatch({
      type: actionTypes.syncProps,
      payload: { to, from, timezone },
    });
  }, []);

  useEffect(() => {
    syncPropsToState({ to: props.to, from: props.from, timezone: props.timezone });
  }, [syncPropsToState, props.to, props.from, props.timezone]);

  const handleFieldChange = e => {
    dispatch({ type: actionTypes.fieldChange, payload: { [e.target.id]: e.target.value } });
    debounceChanges();
  };

  const debounceChanges = useCallback(
    _.debounce(() => {
      validate();
    }, DEBOUNCE),
    [],
  );

  const handleEnter = e => {
    if (e.key === 'Enter') {
      validate(e, true);
    }
  };

  const handleBlur = e => {
    validate(e, true);
  };

  function validate(e, shouldReset) {
    // allow for prop-level override of "now" (DI, etc.)
    const { now, roundToPrecision, preventFuture, defaultPrecision, timezone } = props;

    const from = parseDateTimeTz({ timezone, date: state.fromDate, time: state.fromTime });
    const to = parseDateTimeTz({ timezone, date: state.toDate, time: state.toTime });

    try {
      const precision = getPrecision({ from, to, precision: defaultPrecision });
      const { to: roundedTo, from: roundedFrom } = getValidDateRange({
        from,
        to,
        now,
        roundToPrecision,
        preventFuture,
        precision,
      });
      return props.selectDates(
        { to: roundedTo.toDate(), from: roundedFrom.toDate(), precision },
        () => {
          if (e && e.key === 'Enter') {
            props.onEnter(e);
          }
        },
      );
    } catch (e) {
      if (shouldReset) {
        syncPropsToState(props); // Resets fields if dates are not valid
      }
    }
  }

  const { toDate, toTime, fromDate, fromTime } = state;
  const { roundToPrecision, selectedPrecision, timezone } = props;

  let precisionLabel = null;
  let precisionLabelValue;
  let shouldDisableTime;

  const from = parseDateTimeTz({ timezone, date: state.fromDate, time: state.fromTime });
  const to = parseDateTimeTz({ timezone, date: state.toDate, time: state.toTime });

  if (roundToPrecision) {
    try {
      // allow for prop-level override of "now" (DI, etc.)
      const { now = moment() } = props;
      const { from: validatedFrom, to: validatedTo } = getValidDateRange({
        from,
        to,
        now,
        roundToPrecision,
        precision: selectedPrecision,
      });

      precisionLabelValue = getPrecision({ from: validatedFrom, to: validatedTo });
      shouldDisableTime = selectedPrecision
        ? ['day', 'week', 'month'].includes(selectedPrecision)
        : getMomentPrecisionByDate(validatedFrom, validatedTo) === 'days';
    } catch (e) {
      precisionLabelValue = '';
    }

    precisionLabel = !selectedPrecision && (
      <div data-id="precision-label" className={styles.PrecisionLabel}>
        Precision: {_.startCase(_.words(precisionLabelValue).join(' '))}
      </div>
    );
  }

  return (
    <Form onKeyDown={handleEnter} className={styles.DateFields} id="datepicker-manualentryv2-form">
      <Grid middle="xs">
        <Grid.Column>
          <TextField
            data-id="fromDate"
            id="fromDate"
            label="From Date"
            labelHidden
            placeholder={DATE_PLACEHOLDER}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            value={fromDate}
          />
        </Grid.Column>
        <Grid.Column>
          <TextField
            data-id="fromTime"
            id="fromTime"
            label="From Time"
            labelHidden
            placeholder={TIME_PLACEHOLDER}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            value={fromTime}
            disabled={shouldDisableTime}
          />
        </Grid.Column>
        <Grid.Column>
          <TextField
            data-id="toDate"
            id="toDate"
            label="To Date"
            labelHidden
            placeholder={DATE_PLACEHOLDER}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            value={toDate}
          />
        </Grid.Column>
        <Grid.Column>
          <TextField
            data-id="toTime"
            id="toTime"
            label="To Time"
            labelHidden
            placeholder={TIME_PLACEHOLDER}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            value={toTime}
            disabled={shouldDisableTime}
          />
        </Grid.Column>
      </Grid>
      {precisionLabel}
    </Form>
  );
}

export default ManualEntryForm;
