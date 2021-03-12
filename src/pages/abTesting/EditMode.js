import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { Form } from 'src/components/tracking/form';
import { showAlert } from 'src/actions/globalAlert';
import {
  updateDraft,
  getAbTest,
  updateAbTest,
  scheduleAbTest,
  rescheduleAbTest,
} from 'src/actions/abTesting';
import { listTemplates } from 'src/actions/templates';
import { selectEditInitialValues } from 'src/selectors/abTesting';
import { formatFormValues } from 'src/helpers/abTesting';

import { Box, Page, Panel, Stack } from 'src/components/matchbox';
import Section from './components/Section';
import StatusPanel from './components/StatusPanel';
import { StatusFields, SettingsFields, VariantsFields } from './components/fields';
import { StatusContent, SettingsContent, VariantsContent } from './components/content';
import { setSubaccountQuery } from 'src/helpers/subaccounts';

const FORM_NAME = 'abTestEdit';

export class EditMode extends Component {
  componentDidMount() {
    // Get templates here for the typeaheads
    // Ensures the list is always up to date
    this.props.listTemplates();
    if (this.props.subaccounts.length === 0) {
      this.props.listSubaccounts();
    }
  }

  handleSaveAsDraft = values => {
    const { updateDraft, showAlert, subaccountId, getAbTest } = this.props;
    const { id, version } = this.props.test;

    return updateDraft({ data: formatFormValues(values), id, subaccountId }).then(() => {
      getAbTest({ id, subaccountId, version });
      showAlert({ type: 'success', message: 'A/B Test Draft Updated' });
    });
  };

  handleSchedule = values => {
    const { scheduleAbTest, showAlert, subaccountId, getAbTest } = this.props;
    const { id, version } = this.props.test;

    return scheduleAbTest({ data: formatFormValues(values), id, subaccountId }).then(() => {
      getAbTest({ id, subaccountId, version });
      showAlert({ type: 'success', message: 'A/B Test Draft Scheduled' });
    });
  };

  handleUpdateScheduled = values => {
    const { updateAbTest, showAlert, subaccountId, getAbTest } = this.props;
    const { id, version } = this.props.test;

    return updateAbTest({ data: formatFormValues(values), id, subaccountId }).then(() => {
      getAbTest({ id, subaccountId, version });
      showAlert({ type: 'success', message: 'A/B Test Updated' });
    });
  };

  handleReschedule = values => {
    const { id, version } = this.props.test;
    const { subaccountId, rescheduleAbTest, history, showAlert } = this.props;

    return rescheduleAbTest({ data: formatFormValues(values), id, subaccountId }).then(() => {
      showAlert({ type: 'success', message: 'A/B Test Rescheduled' });
      history.push(`/ab-testing/${id}/${version + 1}${setSubaccountQuery(subaccountId)}`);
    });
  };

  getPrimaryAction = () => {
    const { test, rescheduling, rescheduleLoading } = this.props;

    if (rescheduling) {
      return {
        content: 'Finalize and Reschedule Test',
        type: 'submit',
        disabled: rescheduleLoading,
      };
    }

    if (test.status === 'draft') {
      return {
        content: 'Finalize and Schedule Test',
        type: 'submit',
      };
    }

    return {
      content: 'Update Test',
      type: 'submit',
    };
  };

  getSubmitAction = () => {
    const { test, rescheduling } = this.props;

    if (rescheduling) {
      return this.handleReschedule;
    }

    if (test.status === 'draft') {
      return this.handleSchedule;
    }

    return this.handleUpdateScheduled;
  };

  getSecondaryActions = () => {
    const { test, deleteAction, cancelAction, handleSubmit } = this.props;
    return [
      {
        content: 'Save as Draft',
        visible: test.status === 'draft',
        onClick: handleSubmit(this.handleSaveAsDraft),
      },
      cancelAction,
      deleteAction,
    ];
  };

  render() {
    const {
      breadcrumbAction,
      test,
      rescheduling,
      formValues,
      submitting,
      subaccountName,
      subaccountId,
    } = this.props;

    return (
      <Form id="abtest-edit-form" onSubmit={this.props.handleSubmit(this.getSubmitAction())}>
        <Page
          title={test.name}
          breadcrumbAction={breadcrumbAction}
          primaryAction={this.getPrimaryAction()}
          secondaryActions={this.getSecondaryActions()}
        >
          <Stack>
            <Section title="Basic Information">
              <Section.Left>
                <StatusContent test={test} rescheduling={rescheduling} />
              </Section.Left>
              <Section.Right>
                <Box as={Panel.LEGACY} marginTop="400">
                  <StatusPanel
                    test={test}
                    subaccountId={subaccountId}
                    subaccountName={subaccountName}
                  />
                  <StatusFields disabled={submitting} />
                </Box>
              </Section.Right>
            </Section>

            <Section title="Settings">
              <Section.Left>
                <SettingsContent test={test} />
              </Section.Left>
              <Section.Right>
                <Box as={Panel.LEGACY} marginTop="400">
                  <SettingsFields formValues={formValues} disabled={submitting} />
                </Box>
              </Section.Right>
            </Section>

            <Section title="Variants">
              <Section.Left>
                <VariantsContent />
              </Section.Left>
              <Section.Right>
                <VariantsFields
                  formValues={formValues}
                  disabled={submitting}
                  subaccountId={subaccountId}
                />
              </Section.Right>
            </Section>
          </Stack>
        </Page>
      </Form>
    );
  }
}

EditMode.defaultProps = {
  formValues: {},
};

EditMode.propTypes = {
  test: PropTypes.shape({
    // Completed and cancelled are only allowed here during the reschedule phase
    status: PropTypes.oneOf(['draft', 'scheduled', 'cancelled', 'completed']),
  }),
};

const mapStateToProps = (state, props) => ({
  formValues: getFormValues(FORM_NAME)(state),
  initialValues: selectEditInitialValues(state, props),
  subaccounts: state.subaccounts.list,
  rescheduleLoading: state.abTesting.rescheduleLoading,
});

const formOptions = {
  form: FORM_NAME,
  enableReinitialize: true,
};

export default withRouter(
  connect(mapStateToProps, {
    listSubaccounts,
    listTemplates,
    updateDraft,
    getAbTest,
    updateAbTest,
    scheduleAbTest,
    rescheduleAbTest,
    showAlert,
  })(reduxForm(formOptions)(EditMode)),
);
