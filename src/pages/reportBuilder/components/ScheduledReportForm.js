import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Telegram } from '@sparkpost/matchbox-icons';
import { tokens } from '@sparkpost/design-tokens-hibana';
import {
  Box,
  Button,
  Inline,
  LabelValue,
  Layout,
  Panel,
  Radio,
  Select,
  TextField,
} from 'src/components/matchbox';
import { Uppercase } from 'src/components/text';
import { testScheduledReport } from 'src/actions/reports';
import { showAlert } from 'src/actions/globalAlert';
import { AsyncActionModal, ButtonWrapper, RadioButtonGroup } from 'src/components';
import { hasAtLeastOneRecipient, recipientUserToString } from '../helpers/scheduledReports';
import { DAY_OF_WEEK_OPTIONS, WEEK_OPTIONS } from '../constants/scheduledReports';
import { ComboBoxTypeahead } from 'src/components/typeahead/ComboBoxTypeahead';
import { ComboBoxTypeaheadController } from 'src/components/reactHookFormControllers';
import { TimezoneTypeahead } from 'src/components/typeahead/TimezoneTypeahead';
import useModal from 'src/hooks/useModal';

export const ScheduledReportDetailsForm = ({
  formControls,
  isUpdatingScheduledReport,
  disabled,
  report,
  users,
}) => {
  const history = useHistory();
  const [testSendRecipients, setTestSendRecipients] = useState([]);
  const { testScheduledReportStatus } = useSelector(({ reports }) => reports);

  const { closeModal, isModalOpen, openModal } = useModal();
  const dispatch = useDispatch();

  const { control, errors, formState, register, setValue, setError } = formControls;
  const formValues = useWatch({ control, name: ['name', 'subject'] });

  const onSendTest = () => {
    const { name, subject } = formValues;
    if (!name || !subject) {
      if (!name) {
        setError('name', { message: 'Required' });
      }
      if (!subject) {
        setError('subject', { message: 'Required' });
      }
      closeModal();
      return dispatch(
        showAlert({
          type: 'error',
          message: `Please fill out "Scheduled Report Name" and "Email Subject" before sending test`,
        }),
      );
    }
    dispatch(
      testScheduledReport({
        reportId: report.id,
        name: name,
        recipients: testSendRecipients.map(({ username }) => username),
        subject: subject,
      }),
    ).then(() => {
      dispatch(
        showAlert({
          type: 'success',
          message: `Successfully sent test report`,
        }),
      );
      closeModal();
    });
  };
  const Typeahead = (
    <ComboBoxTypeaheadController
      disabled={disabled}
      error={errors.recipients && 'At least 1 recipient must be selected'}
      id="to-address"
      itemToString={recipientUserToString}
      label="Send To"
      name="recipients"
      results={users}
      setValue={setValue}
    />
  );

  return (
    <>
      <Layout>
        <Layout.Section annotated>
          <Layout.SectionTitle>Details</Layout.SectionTitle>
        </Layout.Section>
        <Layout.Section>
          <Panel>
            <Panel.Section>
              <TextField
                ref={register({ required: 'Required' })}
                disabled={disabled}
                label="Scheduled Report Name"
                name="name"
                helpText="Title for the scheduling of this report"
                id="scheduled-report-name"
                error={errors.name?.message}
              />
            </Panel.Section>
            <Panel.Section>
              <Inline space="800">
                <div>
                  <LabelValue>
                    <LabelValue.Label>Report</LabelValue.Label>
                    <LabelValue.Value>{report.name}</LabelValue.Value>
                  </LabelValue>
                </div>
                <div>
                  <LabelValue>
                    <LabelValue.Label>From Address</LabelValue.Label>
                    <LabelValue.Value>reports@sparkpost.com</LabelValue.Value>
                  </LabelValue>
                </div>
              </Inline>
            </Panel.Section>
            <Panel.Section>
              <TextField
                ref={register({ required: 'Required' })}
                disabled={disabled}
                label="Email Subject"
                name="subject"
                helpText="Text which will appear as subject line in report email"
                id="email-subject"
                error={errors.subject?.message}
              />
            </Panel.Section>
            <Panel.Section>
              <Panel.Action onClick={openModal} disabled={disabled}>
                Send Test
                <Button.Icon as={Telegram} />
              </Panel.Action>
              <Controller
                control={control}
                as={Typeahead}
                name="recipients"
                rules={{ validate: hasAtLeastOneRecipient }}
              />
            </Panel.Section>
            {isUpdatingScheduledReport && (
              <Panel.Section>
                <ButtonWrapper>
                  <Button type="submit" variant="primary" disabled={!formState.isDirty || disabled}>
                    Update Details
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => history.push(`/signals/analytics?report=${report.id}`)}
                    disabled={disabled}
                  >
                    Cancel
                  </Button>
                </ButtonWrapper>
              </Panel.Section>
            )}
          </Panel>
        </Layout.Section>
      </Layout>
      <AsyncActionModal
        disabled={testSendRecipients.length < 1}
        open={isModalOpen}
        actionVerb="Send Test"
        isPending={testScheduledReportStatus === 'loading'}
        onAction={onSendTest}
        onCancel={closeModal}
        title="Send Test Report Email"
      >
        <Box height="160px">
          <ComboBoxTypeahead
            id="test-send"
            itemToString={recipientUserToString}
            label="Send To"
            onChange={setTestSendRecipients}
            results={users}
            value={testSendRecipients}
            maxNumberOfResults={10}
          />
        </Box>
      </AsyncActionModal>
    </>
  );
};

export const ScheduledReportTimingForm = ({
  formControls,
  isUpdatingScheduledReport,
  disabled,
  report,
}) => {
  const history = useHistory();

  const { control, errors, formState, register, setValue } = formControls;

  const {
    period: periodFormValue,
    timezone: timezoneFormValue,
    timing: timingFormValue,
  } = useWatch({ control, name: ['period', 'timezone', 'timing'] });

  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle>Send Timing</Layout.SectionTitle>
      </Layout.Section>
      <Layout.Section>
        <Panel>
          <Panel.Section>
            <Radio.Group label="Send Report">
              <Radio
                id="daily"
                disabled={disabled}
                ref={register}
                label="Daily"
                value="daily"
                name="timing"
              />
              <Radio
                id="weekly"
                disabled={disabled}
                ref={register}
                label="Weekly"
                value="weekly"
                name="timing"
              />
              <Radio
                id="monthly"
                disabled={disabled}
                ref={register}
                label="Monthly"
                value="monthly"
                name="timing"
              />
            </Radio.Group>
          </Panel.Section>
          <Panel.Section>
            <Inline alignY="top">
              <Select
                id="week"
                ref={register}
                label="Week"
                name="week"
                options={WEEK_OPTIONS}
                disabled={timingFormValue === 'weekly' || timingFormValue === 'daily' || disabled}
              />
              <Select
                id="day"
                ref={register}
                label="Day"
                name="day"
                options={DAY_OF_WEEK_OPTIONS}
                disabled={timingFormValue === 'daily' || disabled}
              />
              <TextField
                disabled={disabled}
                ref={register({
                  required: 'Required',
                  pattern: {
                    value: /^(1[0-2]|0?[1-9]):[0-5][0-9]$/,
                    message: 'Invalid time format, should be hh:mm 12 hour format',
                  },
                })}
                label="Time"
                name="time"
                id="time"
                error={errors.time?.message}
                maxWidth="12rem"
                placeholder="hh:mm"
                connectRight={
                  <RadioButtonGroup id="period" label="Grouping Type">
                    <RadioButtonGroup.Button
                      id="am"
                      disabled={disabled}
                      name="period"
                      checked={periodFormValue === 'AM'}
                      onChange={() => setValue('period', 'AM', { shouldDirty: true })}
                      ref={register}
                      value="AM"
                    >
                      <Uppercase>AM</Uppercase>
                    </RadioButtonGroup.Button>
                    <RadioButtonGroup.Button
                      id="pm"
                      disabled={disabled}
                      name="period"
                      checked={periodFormValue === 'PM'}
                      onChange={() => setValue('period', 'PM', { shouldDirty: true })}
                      ref={register}
                      value="PM"
                    >
                      <Uppercase>PM</Uppercase>
                    </RadioButtonGroup.Button>
                  </RadioButtonGroup>
                }
              />
              <Box minWidth={tokens.sizing_1000}>
                <input type="hidden" ref={register} name="timezone" />
                <TimezoneTypeahead
                  disabled={disabled}
                  initialValue={timezoneFormValue}
                  onChange={({ value }) => setValue('timezone', value, { shouldDirty: true })}
                />
              </Box>
            </Inline>
          </Panel.Section>
          {isUpdatingScheduledReport && (
            <Panel.Section>
              <ButtonWrapper>
                <Button type="submit" variant="primary" disabled={!formState.isDirty || disabled}>
                  Update Timing
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => history.push(`/signals/analytics?report=${report.id}`)}
                  disabled={disabled}
                >
                  Cancel
                </Button>
              </ButtonWrapper>
            </Panel.Section>
          )}
        </Panel>
        {!isUpdatingScheduledReport && (
          <ButtonWrapper>
            <Button type="submit" variant="primary" disabled={!formState.isValid || disabled}>
              Schedule Report
            </Button>
            <Button
              variant="secondary"
              onClick={() => history.push(`/signals/analytics?report=${report.id}`)}
              disabled={disabled}
            >
              Cancel
            </Button>
          </ButtonWrapper>
        )}
      </Layout.Section>
    </Layout>
  );
};
