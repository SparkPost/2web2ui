import React from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from 'src/components/matchbox';
import { Loading } from 'src/components/loading/Loading';
import { Modal } from 'src/components/matchbox';
import styles from './ActionsModal.module.scss';

const ActionsModal = ({
  actions,
  content,
  hideCancelButton,
  isLoading,
  isOpen,
  isPending,
  onCancel,
  title,
}) => (
  <Modal.LEGACY open={isOpen} onClose={onCancel} title={title}>
    <Panel.LEGACY title={title}>
      {isLoading ? (
        <Panel.LEGACY.Section className={styles.Loading}>
          <Loading />
        </Panel.LEGACY.Section>
      ) : (
        <>
          <Panel.LEGACY.Section>{content}</Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <div className={styles.Buttons}>
              <div>
                {actions.map(({ content, ...action }, index) => (
                  <Button
                    {...action}
                    className={styles.ActionButton}
                    disabled={isPending}
                    key={index}
                    name="action-modal-button"
                  >
                    {content}
                  </Button>
                ))}
              </div>
              {!hideCancelButton && (
                <Button disabled={isPending} name="action-cancel-modal-button" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </Panel.LEGACY.Section>
        </>
      )}
    </Panel.LEGACY>
  </Modal.LEGACY>
);

ActionsModal.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
  content: PropTypes.node.isRequired,
  hideCancelButton: PropTypes.bool,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool,
  isPending: PropTypes.bool,
  onCancel: PropTypes.func,
  title: PropTypes.string,
};

export default ActionsModal;
