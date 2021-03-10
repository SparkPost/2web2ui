import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { ArrowForward } from '@sparkpost/matchbox-icons';
import { Grid, TextField } from 'src/components/matchbox';
import { Form } from 'src/components/tracking/form';
import { formatInputDate, formatInputTime, parseDatetime } from 'src/helpers/date';
import {
  getValidDateRange,
  getPrecision as getRawPrecision,
  getRollupPrecision,
  getMomentPrecisionByDate,
} from 'src/helpers/metrics';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import OGStyles from './ManualEntryForm.module.scss';
import hibanaStyles from './ManualEntryFormHibana.module.scss';
import { TranslatableText } from 'src/components/text';

const DATE_PLACEHOLDER = '1970-01-20';
const TIME_PLACEHOLDER = '12:00am';
/*
  used in Inboxplacement
 */
export class ManualEntryFormClassComponent extends Component {
  DEBOUNCE = 500;

  state = {
    toDate: '',
    toTime: '',
    fromDate: '',
    fromTime: '',
  };

  //default precision should only be set for the datepicker for metrics rollup
  getPrecision = this.props.defaultPrecision ? getRollupPrecision : getRawPrecision;

  componentDidMount() {
    const { to, from } = this.props;
    this.syncPropsToState({ to, from });
  }

  componentWillReceiveProps(nextProps) {
    this.syncPropsToState(nextProps);
  }

  syncPropsToState({ to, from }) {
    this.setState({
      toDate: formatInputDate(to),
      toTime: formatInputTime(to),
      fromDate: formatInputDate(from),
      fromTime: formatInputTime(from),
    });
  }

  handleFieldChange = e => {
    this.setState({ [e.target.id]: e.target.value });
    this.debounceChanges();
  };

  debounceChanges = _.debounce(() => {
    this.validate();
  }, this.DEBOUNCE);

  handleEnter = e => {
    if (e.key === 'Enter') {
      this.validate(e, true);
    }
  };

  handleBlur = e => {
    this.validate(e, true);
  };

  validate = (e, shouldReset) => {
    const from = parseDatetime(this.state.fromDate, this.state.fromTime);
    const to = parseDatetime(this.state.toDate, this.state.toTime);
    // allow for prop-level override of "now" (DI, etc.)
    const { now, roundToPrecision, preventFuture, defaultPrecision } = this.props;
    try {
      const precision = this.getPrecision({ from, to, precision: defaultPrecision });
      const { to: roundedTo, from: roundedFrom } = getValidDateRange({
        from,
        to,
        now,
        roundToPrecision,
        preventFuture,
        precision,
      });
      return this.props.selectDates(
        { to: roundedTo.toDate(), from: roundedFrom.toDate(), precision },
        () => {
          if (e && e.key === 'Enter') {
            this.props.onEnter(e);
          }
        },
      );
    } catch (e) {
      if (shouldReset) {
        this.syncPropsToState(this.props); // Resets fields if dates are not valid
      }
    }
  };

  render() {
    const { toDate, toTime, fromDate, fromTime } = this.state;
    const { roundToPrecision, selectedPrecision, styles } = this.props;

    let precisionLabel = null;
    let precisionLabelValue;
    let shouldDisableTime;
    const from = parseDatetime(fromDate, fromTime);
    const to = parseDatetime(toDate, toTime);

    if (roundToPrecision) {
      try {
        // allow for prop-level override of "now" (DI, etc.)
        const { now = moment() } = this.props;
        const { from: validatedFrom, to: validatedTo } = getValidDateRange({
          from,
          to,
          now,
          roundToPrecision,
          precision: selectedPrecision,
        });

        precisionLabelValue = this.getPrecision({
          from: validatedFrom,
          to: validatedTo,
          precision: selectedPrecision,
        });
        shouldDisableTime = selectedPrecision
          ? ['day', 'week', 'month'].includes(selectedPrecision)
          : getMomentPrecisionByDate(validatedFrom, validatedTo) === 'days';
      } catch (e) {
        precisionLabelValue = '';
      }

      precisionLabel = !selectedPrecision && (
        <div className={styles.PrecisionLabel}>
          <TranslatableText>Precision: </TranslatableText>
          {_.startCase(_.words(precisionLabelValue).join(' '))}
        </div>
      );
    }

    return (
      <Form
        onKeyDown={this.handleEnter}
        className={styles.DateFields}
        id="datepicker-manualentry-form"
      >
        <Grid middle="xs">
          <Grid.Column>
            <TextField
              id="fromDate"
              label="From Date"
              labelHidden
              placeholder={DATE_PLACEHOLDER}
              onChange={this.handleFieldChange}
              onBlur={this.handleBlur}
              value={fromDate}
            />
          </Grid.Column>
          <Grid.Column>
            <TextField
              id="fromTime"
              label="From Time"
              labelHidden
              placeholder={TIME_PLACEHOLDER}
              onChange={this.handleFieldChange}
              onBlur={this.handleBlur}
              value={fromTime}
              disabled={shouldDisableTime}
            />
          </Grid.Column>
          <Grid.Column xs={1}>
            <div className={styles.ArrowWrapper}>
              <ArrowForward />
            </div>
          </Grid.Column>
          <Grid.Column>
            <TextField
              id="toDate"
              label="To Date"
              labelHidden
              placeholder={DATE_PLACEHOLDER}
              onChange={this.handleFieldChange}
              onBlur={this.handleBlur}
              value={toDate}
            />
          </Grid.Column>
          <Grid.Column>
            <TextField
              id="toTime"
              label="To Time"
              labelHidden
              placeholder={TIME_PLACEHOLDER}
              onChange={this.handleFieldChange}
              onBlur={this.handleBlur}
              value={toTime}
              disabled={shouldDisableTime}
            />
          </Grid.Column>
        </Grid>
        {precisionLabel}
      </Form>
    );
  }
}

export default function ManualEntryForm(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return <ManualEntryFormClassComponent styles={styles} {...props} />;
}
