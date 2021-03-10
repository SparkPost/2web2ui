import React from 'react';
import { Button, Panel, Modal } from 'src/components/matchbox';
import { connect } from 'react-redux';
import { domainRegex } from 'src/helpers/regex';
import { PanelLoading } from 'src/components';
import ButtonWrapper from 'src/components/buttonWrapper';
import { deleteMonitor } from 'src/actions/blocklist';
import { showAlert } from 'src/actions/globalAlert';

export const RemoveFromWatchlistModal = ({
  closeModal,
  deleteMonitor,
  isPending,
  monitorToDelete,
  showAlert,
}) => {
  const confirmAction = () => {
    deleteMonitor(monitorToDelete).then(() => {
      showAlert({
        type: 'success',
        message: `Stopped Monitoring ${monitorToDelete}.`,
      });
      closeModal();
    });
  };
  const renderContent = () => {
    if (!monitorToDelete) {
      return null;
    }
    return (
      <>
        <Panel.LEGACY.Section>
          <p>
            {`Removing ${
              monitorToDelete.match(domainRegex) ? 'domain' : 'IP'
            } ${monitorToDelete} from your watchlist means you won't get notified of changes, but don't
          worry you can always add it again later.`}
          </p>
        </Panel.LEGACY.Section>

        <Panel.LEGACY.Section>
          <ButtonWrapper>
            <Button variant="destructive" disabled={isPending} onClick={confirmAction}>
              Remove from Watchlist
            </Button>

            <Button variant="monochrome-secondary" onClick={closeModal}>
              Cancel
            </Button>
          </ButtonWrapper>
        </Panel.LEGACY.Section>
      </>
    );
  };

  return (
    <Modal.LEGACY
      open={Boolean(monitorToDelete)}
      onClose={closeModal}
      showCloseButton={true}
      title="Remove from Watchlist"
    >
      {isPending ? (
        <PanelLoading minHeight="175px" />
      ) : (
        <Panel.LEGACY title="Remove from Watchlist">{renderContent()}</Panel.LEGACY>
      )}
    </Modal.LEGACY>
  );
};

const mapStateToProps = state => ({
  isPending: state.blocklist.deleteMonitorPending || state.blocklist.monitorsPending,
});
export default connect(mapStateToProps, { deleteMonitor, showAlert })(RemoveFromWatchlistModal);
