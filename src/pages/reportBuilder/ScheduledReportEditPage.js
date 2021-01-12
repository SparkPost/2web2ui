import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
  deleteScheduledReport,
  getReport,
  updateScheduledReport,
  getScheduledReport,
} from 'src/actions/reports';
import { showAlert } from 'src/actions/globalAlert';
import { Button, Layout, Page, Panel } from 'src/components/matchbox';
import { Loading } from 'src/components/loading';
import { DeleteModal } from 'src/components/modals';
import { useModal } from 'src/hooks';

import { selectUsers } from 'src/selectors/users';
import { listUsers } from 'src/actions/users';
import { formatFormValues, getDefaultValuesMemoized } from './helpers/scheduledReports';
import ScheduledEditFormWrapper from './components/ScheduledEditFormWrapper';
import { PageLink } from 'src/components/links';
import RedirectAndAlert from 'src/components/globalAlert/RedirectAndAlert';

export default function ScheduledReportEditPage() {
  const { reportId, scheduleId } = useParams();
  const history = useHistory();
  const users = useSelector(state => selectUsers(state));
  const usersLoading = useSelector(state => state.users.loading);
  const isPendingUpdate = useSelector(
    ({ reports }) => reports.updateScheduledReportStatus === 'loading',
  );
  const hasError = useSelector(
    ({ reports }) => reports.getScheduledReportStatus === 'error' || reports.errorGetReport,
  );
  const errorMessage = useSelector(
    ({ reports }) => (reports.errorGetScheduledReport || reports.errorGetReport)?.message,
  );
  const {
    deleteSchedulePending,
    getScheduledReportStatus,
    report,
    loading,
    scheduledReport = {},
  } = useSelector(state => state.reports);
  const dispatch = useDispatch();
  const { closeModal, openModal, isModalOpen } = useModal();

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getReport(reportId));
    dispatch(getScheduledReport(reportId, scheduleId));
  }, [dispatch, reportId, scheduleId]);

  const defaultValues = useMemo(() => getDefaultValuesMemoized(scheduledReport, users), [
    scheduledReport,
    users,
    //A new users array is created whenever the state changes AKA submitting, need to memoize it
  ]);

  const onSubmit = values => {
    const formattedValues = formatFormValues({
      ...defaultValues,
      ...values,
    });
    dispatch(updateScheduledReport({ reportId, scheduleId, data: formattedValues })).then(() => {
      dispatch(
        showAlert({
          type: 'success',
          message: `Successfully updated ${formattedValues.name} for report: ${report.name}`,
        }),
      );
      history.push(`/signals/analytics?report=${reportId}`);
    });
  };

  const handleDelete = () => {
    dispatch(deleteScheduledReport(reportId, scheduleId)).then(() => {
      dispatch(
        showAlert({
          type: 'success',
          message: `Successfully deleted ${scheduledReport.name}`,
        }),
      );
      history.push(`/signals/analytics?report=${reportId}`);
    });
  };

  if (loading || getScheduledReportStatus === 'loading' || usersLoading) {
    return <Loading />;
  }

  if (hasError) {
    return (
      <RedirectAndAlert
        to={`/signals/analytics?report=${report.id}`}
        alert={{ type: 'error', message: errorMessage }}
      />
    );
  }
  return (
    <>
      <Page
        title="Schedule Report"
        breadcrumbAction={{
          content: 'Analytics Report',
          to: `/signals/analytics?report=${report.id}`,
          Component: PageLink,
        }}
      >
        {/*See comments in component on why a wrapper is needed*/}
        <ScheduledEditFormWrapper
          defaultValues={defaultValues}
          disabled={isPendingUpdate}
          onSubmit={onSubmit}
          report={report}
          users={users}
        />
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Delete Scheduled Report</Layout.SectionTitle>
          </Layout.Section>
          <Layout.Section>
            <Panel accent="red">
              <Panel.Section>
                <p>
                  Make sure you absolutely want to delete this item before proceeding. This action
                  cannot be undone.
                </p>
              </Panel.Section>
              <Panel.Section>
                <Button variant="destructive" onClick={openModal}>
                  Delete Item
                </Button>
              </Panel.Section>
            </Panel>
          </Layout.Section>
        </Layout>
      </Page>
      <DeleteModal
        title="Are you sure you want to delete this scheduled report?"
        open={isModalOpen}
        content={
          <p>
            Are you sure you want to permanently remove {scheduledReport?.name}? This cannot be
            undone.
          </p>
        }
        isPending={deleteSchedulePending}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
    </>
  );
}
