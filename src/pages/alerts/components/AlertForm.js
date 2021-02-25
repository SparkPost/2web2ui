import _ from 'lodash';
import React from 'react';
import { Field } from 'redux-form';
// Components
import { Box, Grid, Error, Button, Expandable, Panel, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { TextFieldWrapper, SelectWrapper } from 'src/components';
import FilterFields from './fields/FilterFields';
import EvaluatorFields from './fields/EvaluatorFields';
import SubaccountField from './fields/SubaccountsField';
import { getFormSpec } from '../helpers/alertForm';
import {
  METRICS,
  REALTIME_FILTERS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_DATA,
} from '../constants/formConstants';
import styles from './AlertForm.module.scss';
import withAlertForm from './AlertForm.container';
// Helpers & Validation
import { maxLength, required } from 'src/helpers/validation';
import { useHibana } from 'src/context/HibanaContext';

const metricOptions = [
  { value: '', label: 'Select Metric', disabled: true },
  ...Object.keys(METRICS).map(key => ({ label: METRICS[key], value: key })),
];

export const AlertForm = props => {
  const {
    change,
    featureFlaggedAlerts,
    handleSubmit,
    hasSubaccounts,
    formErrors,
    formMeta,
    initialValues,
    isNewAlert,
    isDuplicate,
    metric,
    pristine,
    submitting,
  } = props;

  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  const resetFormValues = event => {
    const formSpec = getFormSpec(event.target.value);
    const { defaultFieldValues, defaultRecommendedValue } = formSpec;
    REALTIME_FILTERS.forEach(filter => {
      change(filter, []);
    });
    change('single_filter', { filter_type: 'none', filter_values: [] });
    defaultFieldValues.forEach(({ fieldName, fieldValue }) => {
      change(fieldName, fieldValue);
    });

    if (defaultRecommendedValue && isNewAlert && !isDuplicate) {
      change('value', defaultRecommendedValue);
    }
  };

  const renderNotificationChannels = () => {
    const notificationChannels = NOTIFICATION_CHANNELS.map(channel => (
      <Expandable
        icon={NOTIFICATION_CHANNEL_DATA[channel].icon}
        title={_.upperFirst(channel)}
        id={channel}
        subtitle={NOTIFICATION_CHANNEL_DATA[channel].subtitle}
        key={channel}
        my="300"
      >
        <Field
          name={channel}
          component={TextFieldWrapper}
          disabled={submitting}
          {...NOTIFICATION_CHANNEL_DATA[channel].fieldProps}
        />
      </Expandable>
    ));
    return <Stack space="100">{notificationChannels}</Stack>;
  };

  const isNotificationChannelsEmpty = (formMeta, formErrors) =>
    NOTIFICATION_CHANNELS.some(
      channel =>
        formMeta[channel] &&
        formMeta[channel].touched &&
        formErrors[channel] === 'At least one notification channel must not be empty',
    );

  const renderAlertForm = () => {
    const submitText = submitting ? 'Submitting...' : isNewAlert ? 'Create Alert' : 'Update Alert';
    const isSubmitDisabled = (pristine && !isDuplicate) || submitting; //Allows user to create the same alert if if's a duplicate
    const formSpec = getFormSpec(metric);
    const channelsError = isNotificationChannelsEmpty(formMeta, formErrors);

    const visibleMetricOptions = metricOptions.filter(option => {
      // show all metrics when feature flag is not defined
      if (!featureFlaggedAlerts.hasOwnProperty(option.value)) {
        return true;
      }

      // hide metric on create form when flag is disabled
      if (isNewAlert && !isDuplicate && !featureFlaggedAlerts[option.value]) {
        return false;
      }

      // hide metric on edit and duplicate forms when metric is a flagged metric or flag is disabled
      if (
        (!isNewAlert || isDuplicate) &&
        initialValues.metric !== option.value &&
        !featureFlaggedAlerts[option.value]
      ) {
        return false;
      }

      return true;
    });

    const columnProps = isHibanaEnabled ? { sm: 12 } : { sm: 12, md: 11, lg: 9 };
    return (
      <Form onSubmit={handleSubmit} id={isNewAlert ? 'alert-create-form' : 'alert-update-form'}>
        <Panel.LEGACY>
          <Grid>
            <Grid.Column {...columnProps}>
              <Panel.LEGACY.Section>
                <label htmlFor="name">Alert Name</label>
                <Field
                  name="name"
                  component={TextFieldWrapper}
                  disabled={submitting}
                  validate={[required, maxLength(50)]}
                />
                <Box marginTop="300" />
                <div className={styles.MetricSelector}>
                  <label>Alert Metric</label>
                  <Field
                    name="metric"
                    component={SelectWrapper}
                    options={visibleMetricOptions}
                    onChange={resetFormValues}
                    validate={required}
                    disabled={submitting || !isNewAlert}
                  />
                </div>
                {metric !== '' && !formSpec.hideEvaluator && (
                  <div className={styles.Evaluator}>
                    <EvaluatorFields
                      key={metric}
                      disabled={submitting}
                      shouldUpdateRecommendation={isNewAlert && !isDuplicate}
                      isNewAlert={isNewAlert}
                    />
                  </div>
                )}
                {formSpec.hasFilters && (
                  <div className={styles.Filters} data-id="alert-filters">
                    <Stack space="500">
                      <label>
                        <h4>
                          Filtered by{' '}
                          <small className={styles.OptionalText}>
                            Add up to 10 filters to your alert.
                          </small>
                        </h4>
                      </label>
                      {!formSpec.hideSubaccountFilter && hasSubaccounts && (
                        <SubaccountField disabled={submitting} />
                      )}
                      <FilterFields disabled={submitting} />
                    </Stack>
                  </div>
                )}
                <div className={styles.Notifications}>
                  <label> Notify Me</label>
                  {channelsError && (
                    <Error
                      wrapper="div"
                      error="At least one notification channel must be not empty"
                    />
                  )}
                  {renderNotificationChannels()}
                </div>
                <Button
                  submit
                  variant="primary"
                  disabled={isSubmitDisabled}
                  className={styles.SubmitButton}
                >
                  {submitText}
                </Button>
              </Panel.LEGACY.Section>
            </Grid.Column>
          </Grid>
        </Panel.LEGACY>
      </Form>
    );
  };

  return <>{renderAlertForm()}</>;
};

AlertForm.defaultProps = { metric: '' };

export default withAlertForm(AlertForm);
