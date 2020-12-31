import React from 'react';
import { connect } from 'react-redux';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { PRESET_REPORT_CONFIGS } from '../../constants';
import TypeSelect from 'src/components/typeahead/TypeSelect';
import { Button, Column, Columns } from 'src/components/matchbox';
import { Bold, TranslatableText } from 'src/components/text';
import { AccessTime, Edit, FolderOpen, Save } from '@sparkpost/matchbox-icons';
import SaveReportModal from './SaveReportModal';
import { deleteReport, getReports } from 'src/actions/reports';
import useModal from 'src/hooks/useModal';
import ScheduledReportsModal from './ScheduledReportsModal';
import { ConfirmationModal, DeleteModal } from 'src/components';
import { showAlert } from 'src/actions/globalAlert';
import { selectCondition } from 'src/selectors/accessConditionState';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import ReportsListModal from '../ReportsListModal';

export const SavedReportsSection = props => {
  /* eslint-disable no-unused-vars */
  const {
    closeModal,
    isModalOpen,
    openModal,
    meta: { type, focusedReport = {}, previouslyPinnedReport = {} } = {},
  } = useModal();

  const reports = props.reports.map(report => ({ ...report, key: report.id }));
  const { actions } = useReportBuilderContext();
  const { refreshReportOptions } = actions;
  const { currentUser, handleReportChange, isScheduledReportsEnabled, selectedReport } = props;

  const onPinConfirm = () => {
    const { showAlert } = props;
    props.updateUserUIOptions({ pinned_report_id: focusedReport.id }).then(() => {
      closeModal();
      showAlert({
        type: 'success',
        message: `Successfully pinned ${focusedReport.name} to the Dashboard.`,
      });
    });
  };

  const onDelete = () => {
    const { deleteReport, getReports, showAlert } = props;
    deleteReport(focusedReport.id).then(() => {
      closeModal();
      showAlert({
        type: 'success',
        message: `Successfully deleted ${focusedReport.name}.`,
      });
      // Unsets the report if it's the report that's deleted.
      if (selectedReport && focusedReport.id === selectedReport.id) {
        refreshReportOptions({
          metrics: undefined,
          filters: [],
          relativeRange: undefined,
          precision: undefined,
          timezone: undefined,
        });
        handleReportChange(null);
      }
      getReports();
    });
  };

  const handlePin = (reportToPin, oldReportThatWasPinned) => {
    openModal({
      type: 'confirm-pin',
      focusedReport: reportToPin,
      previouslyPinnedReport: oldReportThatWasPinned,
    });
  };

  const openDeleteModal = reportToDelete => {
    openModal({ type: 'delete', focusedReport: reportToDelete });
  };

  const openEditModal = reportToEdit => {
    openModal({ type: 'edit', focusedReport: reportToEdit });
  };

  return (
    <>
      <Columns
        alignY="bottom" // pull buttons to bottom when side by side
        collapseBelow="md"
      >
        <Column>
          <TypeSelect
            disabled={props.status === 'loading'}
            label="Report"
            id="report-typeahead"
            itemToString={report => (report ? report.name : '')} // return empty string when nothing is selected
            onChange={handleReportChange}
            placeholder="Select a Report"
            renderItem={report => (
              <TypeSelect.Item
                label={report.name}
                itemToString={item => item.key}
                meta={report.creator || 'Default'}
              />
            )}
            results={[
              ...reports.filter(({ creator }) => creator === currentUser.username),
              ...reports.filter(({ creator }) => creator !== currentUser.username),
              ...PRESET_REPORT_CONFIGS,
            ]}
            selectedItem={selectedReport}
          />
        </Column>
        <Column width="content">
          <Button
            data-id="edit-report-details-button"
            variant="tertiary"
            onClick={() => {
              openModal({ type: 'edit', focusedReport: selectedReport });
            }}
            disabled={
              !selectedReport ||
              !selectedReport.current_user_can_edit ||
              selectedReport.type === 'preset'
            }
          >
            <TranslatableText>Edit Details</TranslatableText>
            <Button.Icon as={Edit} ml="100" />
          </Button>
          <Button
            data-id="save-report-changes-button"
            variant="tertiary"
            onClick={() => {
              openModal({ type: 'save', focusedReport: selectedReport });
            }}
            disabled={
              !selectedReport ||
              !selectedReport.current_user_can_edit ||
              selectedReport.type === 'preset'
            }
          >
            <TranslatableText>Save Changes</TranslatableText>
            <Button.Icon as={Save} ml="100" />
          </Button>
          {isScheduledReportsEnabled && selectedReport?.id && (
            <Button
              variant="tertiary"
              onClick={() => openModal({ type: 'scheduled', focusedReport: selectedReport })}
            >
              <TranslatableText>Schedule Report</TranslatableText>
              <Button.Icon as={AccessTime} ml="100" />
            </Button>
          )}
          <Button variant="tertiary" onClick={() => openModal({ type: 'view' })}>
            <TranslatableText>View All Reports</TranslatableText>
            <Button.Icon as={FolderOpen} ml="100" />
          </Button>
        </Column>
      </Columns>
      <SaveReportModal
        open={isModalOpen && type === 'edit'}
        report={focusedReport}
        setReport={handleReportChange}
        onCancel={closeModal}
      />
      <SaveReportModal
        open={isModalOpen && type === 'save'}
        saveQuery
        isOwner={currentUser.userName === focusedReport.creator}
        report={focusedReport}
        setReport={handleReportChange}
        onCancel={closeModal}
      />
      {isScheduledReportsEnabled && selectedReport?.id && (
        <ScheduledReportsModal
          open={isModalOpen && type === 'scheduled'}
          onClose={closeModal}
          handleReportChange={handleReportChange}
          report={focusedReport}
        />
      )}
      <ReportsListModal
        open={isModalOpen && type === 'view'}
        onClose={closeModal}
        handleDelete={openDeleteModal}
        handlePin={handlePin}
        handleEdit={openEditModal}
        handleReportChange={handleReportChange}
        reports={reports}
      />
      <ConfirmationModal
        title="Pin to Dashboard"
        confirmVerb="Pin to Dashboard"
        content={
          <>
            {previouslyPinnedReport &&
              previouslyPinnedReport.id &&
              focusedReport.id !== previouslyPinnedReport.id && (
                <p>
                  <TranslatableText>
                    <Bold>{focusedReport.name}</Bold>
                  </TranslatableText>
                  <TranslatableText>&nbsp;will now replace&nbsp;</TranslatableText>
                  <TranslatableText>
                    <Bold>{previouslyPinnedReport.name}</Bold>
                  </TranslatableText>
                  <TranslatableText>&nbsp;on the Dashboard.</TranslatableText>
                </p>
              )}
            {!previouslyPinnedReport.id && (
              <p>
                <TranslatableText>
                  <Bold>{focusedReport.name}</Bold>
                </TranslatableText>
                <TranslatableText>&nbsp;will be pinned to the Dashboard.&nbsp;</TranslatableText>
              </p>
            )}
          </>
        }
        open={isModalOpen && type === 'confirm-pin'}
        isPending={props.userOptionsPending}
        onCancel={closeModal}
        onConfirm={onPinConfirm}
      />
      <DeleteModal
        title="Are you sure you want to delete your saved report?"
        confirmVerb="Delete"
        content={
          <p>
            <TranslatableText>The report&nbsp;</TranslatableText>
            <TranslatableText>
              <Bold>"{focusedReport.name}"</Bold>
            </TranslatableText>
            <TranslatableText>
              &nbsp;will be permanently removed. This cannot be undone.
            </TranslatableText>
          </p>
        }
        open={isModalOpen && type === 'delete'}
        isPending={props.isDeletePending}
        onCancel={closeModal}
        onConfirm={onDelete}
      />
    </>
  );
};

const mapStateToProps = state => ({
  currentUser: state.currentUser,
  reports: state.reports.list,
  status: state.reports.status,
  isDeletePending: state.reports.deletePending,
  userOptionsPending: state.currentUser.userOptionsPending,
  isScheduledReportsEnabled: selectCondition(isAccountUiOptionSet('allow_scheduled_reports'))(
    state,
  ),
});

export default connect(mapStateToProps, {
  getReports,
  updateUserUIOptions,
  deleteReport,
  showAlert,
})(SavedReportsSection);
