import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import { Button, Modal, Tabs } from 'src/components/matchbox';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { showAlert } from 'src/actions/globalAlert';
import {
  MyReportsTabWithSelectableRows,
  AllReportsTabWithSelectableRows,
} from './ChangeReportModalTabs';
export function ChangeReportModal({ reports, open, onClose, currentUser }) {
  const dispatch = useDispatch();

  const [tabIndex, setTabIndex] = useState(0);

  const { control, register, setValue, handleSubmit } = useForm();

  const handleTabChange = index => {
    setTabIndex(index);
    setValue('reportId', null);
  };

  const closeModal = () => {
    setValue('reportId', null);
    onClose();
  };

  const onSubmit = val => {
    if (val.reportId) {
      dispatch(updateUserUIOptions({ pinned_report_id: val.reportId })).then(() => {
        dispatch(
          showAlert({
            type: 'success',
            message: 'Pinned Report updated',
          }),
        );
      });

      closeModal();
    }
  };

  const TABS = [
    <MyReportsTabWithSelectableRows
      reports={reports}
      currentUser={currentUser}
      onSubmit={onSubmit}
      register={register}
    />,
    <AllReportsTabWithSelectableRows reports={reports} onSubmit={onSubmit} register={register} />,
  ];

  return (
    <Modal open={open} onClose={closeModal} showCloseButton maxWidth="1300">
      <Modal.Header>Change Report</Modal.Header>
      <Modal.Content p="0">
        <form onSubmit={handleSubmit(onSubmit)} id="reportsmodalForm">
          <Tabs
            tabs={[
              { content: 'My Reports', onClick: () => handleTabChange(0) },
              { content: 'All Reports', onClick: () => handleTabChange(1) },
            ]}
            fitted
            selected={tabIndex}
          />

          {TABS[tabIndex]}
        </form>
      </Modal.Content>
      <ModalFooter onClose={closeModal} control={control} />
    </Modal>
  );
}

function ModalFooter({ onClose, control }) {
  const submitDisbaled = useWatch({
    control,
    name: 'reportId',
  });
  return (
    <Modal.Footer>
      <Button
        variant="primary"
        loadingLabel="Loading"
        type="submit"
        form="reportsmodalForm"
        disabled={!submitDisbaled}
      >
        Change Report
      </Button>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
    </Modal.Footer>
  );
}
ModalFooter.displayName = 'Modal.Footer';

const mapStateToProps = state => {
  return {
    currentUser: state.currentUser.username,
  };
};
export default connect(mapStateToProps)(ChangeReportModal);
