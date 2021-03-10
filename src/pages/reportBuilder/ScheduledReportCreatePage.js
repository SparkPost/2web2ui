import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Page } from 'src/components/matchbox';
import {
  ScheduledReportDetailsForm,
  ScheduledReportTimingForm,
} from './components/ScheduledReportForm';
import { Form } from 'src/components/tracking/form';
import { Loading } from 'src/components/loading';
import { PageLink } from 'src/components/links';
import RedirectAndAlert from 'src/components/globalAlert/RedirectAndAlert';
import { getReport, createScheduledReport } from 'src/actions/reports';
import { showAlert } from 'src/actions/globalAlert';
import { selectUsers } from 'src/selectors/users';
import { listUsers } from 'src/actions/users';
import { getLocalTimezone } from 'src/helpers/date';
import { formatFormValues, segmentDataTransform } from './helpers/scheduledReports';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

export default function ScheduledReportCreatePage() {
  const { reportId } = useParams();
  const history = useHistory();
  const { report, loading } = useSelector(state => state.reports);
  const users = useSelector(state => selectUsers(state));
  const usersLoading = useSelector(state => state.users.loading);
  const isPendingCreate = useSelector(
    ({ reports }) => reports.saveScheduledReportStatus === 'loading',
  );
  const hasError = useSelector(({ reports }) => reports.errorGetReport);
  const errorMessage = useSelector(({ reports }) => reports.errorGetReport?.message);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getReport(reportId));
  }, [dispatch, reportId]);

  const { ...formControls } = useForm({
    defaultValues: {
      timing: 'daily',
      recipients: [],
      period: 'AM',
      timezone: getLocalTimezone(),
    },
    mode: 'onBlur',
  });

  const onSubmit = values => {
    const formattedValues = formatFormValues(values);
    dispatch(createScheduledReport(reportId, formattedValues)).then(() => {
      segmentTrack(
        SEGMENT_EVENTS.SCHEDULED_REPORT_CREATED,
        segmentDataTransform(formattedValues, report.query_string),
      );
      dispatch(
        showAlert({
          type: 'success',
          message: `Successfully scheduled ${values.name} for report: ${report.name}`,
        }),
      );
      history.push(`/signals/analytics?report=${reportId}`);
    });
  };

  if (hasError) {
    return (
      <RedirectAndAlert
        to={`/signals/analytics?report=${report.id}`}
        alert={{ type: 'error', message: errorMessage }}
      />
    );
  }

  if (loading || usersLoading) {
    return <Loading />;
  }

  return (
    <Page
      title="Schedule Report"
      breadcrumbAction={{
        content: 'Analytics Report',
        to: `/signals/analytics?report=${reportId}`,
        Component: PageLink,
      }}
    >
      <Form onSubmit={formControls.handleSubmit(onSubmit)} id="scheduledReportForm">
        <ScheduledReportDetailsForm
          formControls={formControls}
          disabled={isPendingCreate || formControls.formState.isSubmitting}
          report={report}
          users={users}
        />
        <ScheduledReportTimingForm
          formControls={formControls}
          disabled={isPendingCreate}
          report={report}
        />
      </Form>
    </Page>
  );
}
