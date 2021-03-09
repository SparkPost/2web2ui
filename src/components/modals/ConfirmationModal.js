import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Panel } from 'src/components/matchbox';
import { ButtonWrapper } from 'src/components';
import { PanelLoading } from 'src/components/loading';
import { useHibana } from 'src/context/HibanaContext';

export default function ConfirmationModal(props) {
  const {
    open,
    title,
    isPending,
    children = null,
    confirming,
    content = children,
    onConfirm,
    confirmVariant = 'primary',
    cancelVariant = 'secondary',
    onCancel,
    confirmVerb = 'Confirm',
    cancelVerb = 'Cancel',
    showCloseButton,
  } = props;

  const renderContent = () => {
    return (
      <>
        <Panel.LEGACY.Section>{content}</Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <ButtonWrapper>
            <Button
              variant={confirmVariant}
              disabled={confirming}
              name="confirmation-modal-confirm-button"
              onClick={onConfirm}
            >
              {confirmVerb}
            </Button>
            <Button variant={cancelVariant} onClick={onCancel}>
              {cancelVerb}
            </Button>
          </ButtonWrapper>
        </Panel.LEGACY.Section>
      </>
    );
  };

  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  return (
    <Modal.LEGACY
      open={open}
      onClose={onCancel}
      showCloseButton={isHibanaEnabled || showCloseButton}
      title={title}
    >
      {isPending ? (
        <PanelLoading minHeight="200px" title={title} />
      ) : (
        <Panel.LEGACY title={title}>{renderContent()}</Panel.LEGACY>
      )}
    </Modal.LEGACY>
  );
}

ConfirmationModal.propTypes = {
  confirming: PropTypes.bool,
  open: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmVerb: PropTypes.string,
  cancelVerb: PropTypes.string,
  showCloseButton: PropTypes.bool,
};
