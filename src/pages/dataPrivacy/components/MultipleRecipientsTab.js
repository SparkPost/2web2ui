import React from 'react';
import _ from 'lodash';
import Papa from 'papaparse';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { RadioGroup, ButtonWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { DownloadLink } from 'src/components/links';
import { Button, Panel, Modal, Stack } from 'src/components/matchbox';
import { FileFieldWrapper } from 'src/components/reduxFormWrappers';
import SubaccountSection from 'src/components/subaccountSection';
import { required } from 'src/helpers/validation';
import { submitRTBFRequest, submitOptOutRequest, resetDataPrivacy } from 'src/actions/dataPrivacy';
import { showAlert } from 'src/actions/globalAlert';
import { download } from 'src/helpers/downloading';
import { hasSubaccounts } from 'src/selectors/subaccounts';
import { REQUEST_TYPES, SUBACCOUNT_ITEMS, SUBACCOUNT_OPTIONS } from '../constants';
import exampleRecipientListPath from './example-recipients.csv';

export function MultipleRecipientsTab({
  submitRTBFRequest,
  submitOptOutRequest,
  showAlert,
  reset,
  handleSubmit,
  hasSubaccounts,
  submitting,
  dataPrivacyRequestError,
  resetDataPrivacy,
  pristine,
}) {
  // Adapted minimally from parseRecipientList() in webui/src/app/recipients/recipients-controller.js

  const parseRecipientListCsv = React.useCallback(file => {
    const resultMap = (result, resolve, reject) => {
      if (!result.data.length) {
        reject('File contains no data');
      }
      resolve(result.data.map(stringArr => stringArr[0]));
    };

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: result => resultMap(result, resolve, reject),
        error: () => reject(['Unable to read your file']),
      });
    });
  }, []);

  const onSubmit = values => {
    const subaccountId = !Boolean(values.assignTo)
      ? null
      : values.assignTo === 'subaccount'
      ? values.subaccount.id
      : SUBACCOUNT_ITEMS[values.assignTo];
    const include_subaccounts = values.assignTo === 'shared';
    const submitRequest = values.requestType === 'rtbf' ? submitRTBFRequest : submitOptOutRequest;

    return parseRecipientListCsv(values.file)
      .then(results => {
        submitRequest(
          {
            recipients: results,
            subaccountId: subaccountId,
            include_subaccounts: include_subaccounts,
          },
          { showErrorAlert: false },
        )
          .then(() => {
            showAlert({ type: 'success', message: `Request Saved` });
            reset();
          })
          .catch(({ message }) => {
            if (message !== 'invalid email address') {
              showAlert({ type: 'error', message });
            }
          });
      })
      .catch(err => {
        throw new SubmissionError({ file: err });
      });
  };

  const downloadErrorCSV = () => {
    const errors = _.get(dataPrivacyRequestError, 'response.data.errors');
    const csvData = Papa.unparse(errors);
    const now = Math.floor(Date.now() / 1000);
    download({
      name: `sparkpost-dataprivacy-${now}.csv`,
      url: new Blob([csvData], { type: 'text/csv' }),
    });
    resetDataPrivacy();
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} id="dataprivacy-multiple-recipient-form">
        <Panel.LEGACY.Section>
          <Stack>
            <Field
              component={RadioGroup}
              name="requestType"
              label="Select Compliance Type"
              options={REQUEST_TYPES}
              disabled={submitting}
              validate={[required]}
            />
            <Field
              type="file"
              label="Upload List"
              fileType="csv"
              helpText={
                <DownloadLink href={exampleRecipientListPath}>Download a CSV Template</DownloadLink>
              }
              component={FileFieldWrapper}
              disabled={submitting}
              name="file"
              validate={[required]}
            />

            {hasSubaccounts && (
              <SubaccountSection
                newTemplate={true}
                disabled={submitting}
                validate={[required]}
                createOptions={SUBACCOUNT_OPTIONS}
              />
            )}
          </Stack>
        </Panel.LEGACY.Section>

        <Panel.LEGACY.Section>
          <ButtonWrapper>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>

            <Button variant="secondary" onClick={reset} disabled={pristine || submitting}>
              Clear
            </Button>
          </ButtonWrapper>
        </Panel.LEGACY.Section>
      </Form>

      <Modal.LEGACY
        open={Boolean(dataPrivacyRequestError)}
        showCloseButton
        onClose={resetDataPrivacy}
        title="Data Privacy Multiple Recipient Upload Error"
      >
        <Panel.LEGACY title="Upload Error">
          <Panel.LEGACY.Section>
            <p>
              We couldn’t process some of the addresses in your list. Download a list of the errors,
              update your list, and please upload again.
            </p>
          </Panel.LEGACY.Section>

          <Panel.LEGACY.Section>
            <Button onClick={downloadErrorCSV} variant="primary">
              Download List
            </Button>
          </Panel.LEGACY.Section>
        </Panel.LEGACY>
      </Modal.LEGACY>
    </>
  );
}

const formOptions = {
  form: 'DATA_PRIVACY_MULTIPLE_RECIPIENTS',
  enableReinitialize: true,
};

const mapStateToProps = state => {
  const {
    dataPrivacy: { dataPrivacyRequestError },
  } = state;

  return {
    dataPrivacyRequestError,
    hasSubaccounts: hasSubaccounts(state),
    initialValues: {
      assignTo: 'master',
    },
  };
};

export default connect(mapStateToProps, {
  submitRTBFRequest,
  submitOptOutRequest,
  showAlert,
  resetDataPrivacy,
})(reduxForm(formOptions)(MultipleRecipientsTab));
