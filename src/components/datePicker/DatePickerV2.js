/* eslint-disable max-lines */
import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DateUtils } from 'react-day-picker';
import { subMonths } from 'date-fns';
import {
  getStartOfDay,
  getEndOfDay,
  getRelativeDateOptions,
  getRelativeDates,
  getNextHour,
  isSameDate,
  formatToTimezone,
  getLocalTimezone,
} from 'src/helpers/date';
import { roundBoundaries, getRollupPrecision as getPrecision } from 'src/helpers/metrics';
import {
  ActionList,
  Box,
  Button,
  DatePicker as DateSelector,
  Error,
  Popover,
  TextField,
  WindowEvent,
} from 'src/components/matchbox';
import ButtonWrapper from 'src/components/buttonWrapper';
import ManualEntryForm from './ManualEntryFormV2';
import { FORMATS } from 'src/constants';
import styled from 'styled-components';
import { tokens } from '@sparkpost/design-tokens-hibana';
import OGDatePicker from './DatePicker';
import { useHibana } from 'src/context/HibanaContext';
import { CalendarToday } from '@sparkpost/matchbox-icons';

const ActionListWrapper = styled.div`
  width: 150px;
  border-right-color: ${tokens.color_gray_400};
  border-right-style: solid;
  border-right-width: ${tokens.borderWidth_100};
`;

const DateSelectorWrapper = styled.div`
  width: max-content;
  max-width: 38.5rem;
`;

const StyledError = styled.span`
  display: inline-block;
  vertical-align: middle;
  margin-left: ${tokens.spacing_200};
  line-height: ${tokens.lineHeight_200};
`;

const DATE_FORMAT = FORMATS.DATE_FNS.LONG_DATETIME;

const initialState = {
  isDatePickerOpen: false,
  isSelecting: false,
  relativeRange: 'custom',
  selected: {},
  validationError: null,
  selectedPrecision: undefined,
};

const actionTypes = {
  open: 'OPEN',
  close: 'CLOSE',
  error: 'SET_ERROR',
  sync: 'SYNC',
  dayClick: 'DAY_CLICK',
  dayHover: 'DAY_HOVER',
  selectRange: 'SELECT_RANGE',
  setFormDates: 'SET_FORM_DATES',
};

const datePickerReducer = (state, { type, payload }) => {
  switch (type) {
    case actionTypes.open: {
      return { ...state, isDatePickerOpen: true };
    }
    case actionTypes.close: {
      return { ...state, isDatePickerOpen: false, isSelecting: false, validationError: null };
    }
    case actionTypes.error: {
      const { validationError } = payload;
      return { ...state, validationError };
    }
    case actionTypes.sync:
    case actionTypes.dayClick:
    case actionTypes.dayHover:
    case actionTypes.selectRange:
    case actionTypes.setFormDates:
      return { ...state, ...payload };
    default: {
      return state;
    }
  }
};

const formatDateRange = ({ from, to, dateFormat = DATE_FORMAT, timezone }) => {
  if (!from || !to) {
    return 'Invalid Date Range';
  }

  const fromDate = formatToTimezone(from, dateFormat, timezone);
  const toDate = formatToTimezone(to, dateFormat, timezone);

  return `${fromDate} – ${toDate}`;
};
export function DatePicker(props) {
  const [state, dispatch] = useReducer(datePickerReducer, initialState);
  const { isSelecting, selected, isDatePickerOpen } = state;

  const syncTimeToState = useCallback(
    ({ from, to, precision, relativeRange }) => {
      if (from && to) {
        const selectedPrecision = props.selectPrecision && precision;
        dispatch({
          type: actionTypes.sync,
          payload: {
            selected: { from, to },
            selectedPrecision,
            relativeRange,
            isSelecting: false,
          },
        });
      }
    },
    [props.selectPrecision],
  );

  useEffect(() => {
    syncTimeToState({
      to: props.to,
      from: props.from,
      precision: props.precision,
      relativeRange: props.relativeRange,
    });
  }, [props.to, props.from, props.precision, props.relativeRange, syncTimeToState]);

  // Closes popover on escape, submits on enter
  const handleKeyDown = e => {
    if (!isDatePickerOpen) {
      return;
    }

    if (e.key === 'Escape') {
      cancelDatePicker();
    }

    if (!isSelecting && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const { updateShownPrecision } = props;
  useEffect(() => {
    if (updateShownPrecision) {
      if (isDatePickerOpen && props.precision !== state.selectedPrecision) {
        return updateShownPrecision(state.selectedPrecision);
      }
      return updateShownPrecision('');
    }
  }, [isDatePickerOpen, updateShownPrecision, state.selectedPrecision, props.precision]);

  const handleDayKeyDown = (day, modifiers, e) => {
    handleKeyDown(e);
    e.stopPropagation();
  };

  const cancelDatePicker = () => {
    syncTimeToState(props);
    dispatch({ type: actionTypes.close });
  };

  const showDatePicker = () => {
    dispatch({ type: actionTypes.open });
  };

  const handleDayClick = clicked => {
    const { validate, selectPrecision } = props;

    const dates = isSelecting
      ? selected
      : {
          from: fromFormatter(clicked),
          to: getEndOfDay(clicked, { preventFuture: props.preventFuture }),
        };

    const validationError = validate && validate(dates);

    if (isSelecting && validationError) {
      dispatch({ type: actionTypes.error, payload: { validationError } });
      return;
    }

    dispatch({
      type: actionTypes.dayClick,
      payload: {
        relativeRange: 'custom',
        selected: dates,
        beforeSelected: dates,
        isSelecting: !isSelecting,
        validationError: null,
        selectedPrecision:
          selectPrecision &&
          getPrecision({ from: dates.from, to: dates.to, precision: props.precision }),
      },
    });
  };

  const handleDayHover = hovered => {
    if (isSelecting) {
      const { from, to, precision } = getOrderedRange(hovered);
      dispatch({
        type: actionTypes.dayHover,
        payload: { selected: { from, to }, selectedPrecision: precision },
      });
    }
  };

  const getOrderedRange = newDate => {
    let { from, to } = state.beforeSelected;
    const { preventFuture, selectPrecision, precision: oldPrecision } = props;
    if (from.getTime() <= newDate.getTime()) {
      to = getEndOfDay(newDate, { preventFuture });
    } else {
      from = fromFormatter(newDate);
    }
    //Changes datepicker precision if the current set precision is not available
    const precision = getPrecision({
      from,
      to,
      precision: selectPrecision && oldPrecision,
    });
    if (props.roundToPrecision) {
      const rounded = roundBoundaries({ from, to, precision });
      from = rounded.from.toDate();
      to = rounded.to.toDate();
    }
    return { from, to, precision };
  };

  const handleSelectRange = value => {
    const { selectedPrecision: precision } = state;
    if (value !== 'custom') {
      /*
      First get the raw dates from the range.
      Then check the precision for the date range.
      Finally, use correct precision to round the date range.
       */
      const { from: fromRaw, to: toRaw } = getRelativeDates(value);
      const newPrecision = getPrecision({ from: moment(fromRaw), to: moment(toRaw), precision });
      const { from, to } = getRelativeDates(value, { precision: newPrecision });
      dispatch({
        type: actionTypes.selectRange,
        payload: {
          isSelecting: false,
          relativeRange: value,
          selectedPrecision: newPrecision,
          selected: { from, to },
        },
      });
    } else {
      dispatch({
        type: actionTypes.selectRange,
        payload: {
          relativeRange: value,
        },
      });
    }
  };

  const handleFormDates = ({ from, to, precision }, callback) => {
    const selectedPrecision = props.selectPrecision ? precision : undefined;

    dispatch({
      type: actionTypes.setFormDates,
      payload: { selected: { from, to }, selectedPrecision, relativeRange: 'custom' },
    });
    callback();
  };

  const handleSubmit = () => {
    const { validate } = props;
    const selectedDates = state.selected;
    const validationError = validate && validate(selectedDates);
    if (validationError) {
      dispatch({ type: actionTypes.error, payload: { validationError } });
      return;
    }

    dispatch({ type: actionTypes.close });
    props.onChange({
      ...selectedDates,
      relativeRange: state.relativeRange,
      precision:
        state.selectedPrecision ||
        getPrecision({ from: moment(selectedDates.from), to: moment(selectedDates.to) }),
    });
  };

  const handleTextUpdate = () => {
    if (props.onBlur) {
      props.onBlur();
    }
  };

  const fromFormatter = fromDate => {
    const isDateToday = isSameDate(getStartOfDay(fromDate), getStartOfDay(new Date()));
    const formatter = props.fromSelectsNextHour && isDateToday ? getNextHour : getStartOfDay;
    return formatter(fromDate);
  };

  const {
    selected: { from, to },
    validationError,
    selectedPrecision,
  } = state;

  // allow for prop-level override of "now" (DI, etc.)
  const {
    now = new Date(),
    relativeDateOptions = [],
    disabled,
    datePickerProps = {},
    textFieldProps = {},
    dateFieldFormat,
    roundToPrecision,
    preventFuture,
    // showPresets = true,
    error,
    left,
    hideManualEntry,
    precision,
    selectPrecision,
    id,
    label,
    timezone = getLocalTimezone(),
  } = props;

  const dateFormat = dateFieldFormat || DATE_FORMAT;

  const rangeOptions = getRelativeDateOptions(relativeDateOptions).map(({ label, value }) => {
    return {
      content: label,
      highlighted: state.relativeRange === value,
      is: 'button',
      onClick: () => handleSelectRange(value),
    };
  });

  const modifiers = {
    firstSelected: day => {
      return DateUtils.isSameDay(day, from);
    },
    lastSelected: day => DateUtils.isSameDay(day, to),
    inBetween: day => DateUtils.isDayBetween(day, from, to),
  };

  const DateField = (
    <TextField
      data-id={`date-field-${id}`}
      label={label}
      id={`date-field-${id}`}
      onClick={showDatePicker}
      prefix={<CalendarToday />}
      value={formatDateRange({ from, to, dateFormat, timezone })}
      readOnly
      onBlur={handleTextUpdate}
      error={error}
      disabled={disabled}
      type="text"
      {...textFieldProps}
    />
  );

  return (
    <Popover
      id={`popover-${id}`}
      as="div"
      trigger={DateField}
      onClose={cancelDatePicker}
      open={isDatePickerOpen}
      left={left}
    >
      <Box display="flex">
        <ActionListWrapper>
          <ActionList actions={rangeOptions} />
        </ActionListWrapper>
        <Box as={DateSelectorWrapper} padding="400">
          <DateSelector
            data-id="date-selector"
            modifiers={modifiers}
            fixedWeeks
            initialMonth={subMonths(now, 1)}
            toMonth={now}
            disabledDays={{ after: now }}
            onDayClick={handleDayClick}
            onDayMouseEnter={handleDayHover}
            onDayFocus={handleDayHover}
            onKeyDown={handleKeyDown}
            onDayKeyDown={handleDayKeyDown}
            selectedDays={state.selected}
            {...datePickerProps}
          />
          {!hideManualEntry && (
            <ManualEntryForm
              data-id="manual-entry-form"
              selectDates={handleFormDates}
              onEnter={handleKeyDown}
              to={to}
              from={from}
              timezone={timezone}
              roundToPrecision={roundToPrecision}
              preventFuture={preventFuture}
              selectedPrecision={selectedPrecision}
              defaultPrecision={selectPrecision && precision}
            />
          )}
        </Box>
      </Box>
      <Box padding="400" borderTop="400">
        <ButtonWrapper>
          <Button variant="primary" onClick={handleSubmit} data-id="date-picker-custom-apply">
            Apply
          </Button>

          <Button variant="secondary" onClick={cancelDatePicker}>
            Cancel
          </Button>
        </ButtonWrapper>
      </Box>
      {validationError && (
        <StyledError>
          <Error wrapper="span" error={validationError}></Error>
        </StyledError>
      )}
      <WindowEvent event="keydown" handler={handleKeyDown} />
    </Popover>
  );
}

export default props => {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  return isHibanaEnabled ? <DatePicker {...props} /> : <OGDatePicker {...props} />;
};

DatePicker.propTypes = {
  now: PropTypes.instanceOf(Date),
  from: PropTypes.instanceOf(Date),
  to: PropTypes.instanceOf(Date),
  relativeRange: PropTypes.string,
  relativeDateOptions: PropTypes.arrayOf(PropTypes.string),
  roundToPrecision: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  datePickerProps: PropTypes.object,
  dateFieldFormat: PropTypes.string,
  disabled: PropTypes.bool,
  showPresets: PropTypes.bool,
  hideManualEntry: PropTypes.bool,
  selectPrecision: PropTypes.bool,
  precision: PropTypes.string,
  id: PropTypes.string,
};

DatePicker.defaultProps = {
  preventFuture: true,
  roundToPrecision: false,
  id: 'date-picker',
};
