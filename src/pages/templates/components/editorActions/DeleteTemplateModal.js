import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Panel, Modal } from 'src/components/matchbox';
import { ButtonWrapper } from 'src/components';
import { PanelLoading } from 'src/components/loading';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { RedirectAndAlert } from 'src/components/globalAlert';
import { routeNamespace } from '../../constants/routes';
import OGStyles from './DeleteTemplateModal.module.scss';
import hibanaStyles from './DeleteTemplateModalHibana.module.scss';

const DeleteTemplateModal = props => {
  const { open, onClose, template, deleteTemplate, isLoading, successCallback } = props;
  const [hasSuccessRedirect, setSuccessRedirect] = useState(false);
  const handleDelete = () => {
    deleteTemplate({ id: template.id, subaccountId: template.subaccount_id }).then(() => {
      if (successCallback) {
        successCallback();
      } else {
        setSuccessRedirect(true);
      }
    });
  };
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return (
    <>
      {hasSuccessRedirect && (
        <RedirectAndAlert
          to={`/${routeNamespace}`}
          alert={{
            type: 'success',
            message: 'Template deleted',
          }}
        />
      )}

      <Modal.LEGACY open={open} showCloseButton onClose={onClose} title="Delete Template">
        {isLoading ? (
          <PanelLoading minHeight="190px" />
        ) : (
          <Panel.LEGACY title="Are you sure you want to delete your template?">
            <Panel.LEGACY.Section>
              {/* The <span>s are used here to avoid the bare JSX string problem */}
              <p>
                <span>If so, the </span>
                <strong className={styles.WarningText}>published version and any drafts</strong>
                <span> will all be deleted.</span>
              </p>
            </Panel.LEGACY.Section>

            <Panel.LEGACY.Section>
              <ButtonWrapper>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete All Versions
                </Button>

                <Button variant="monochrome-secondary" onClick={onClose}>
                  Cancel
                </Button>
              </ButtonWrapper>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        )}
      </Modal.LEGACY>
    </>
  );
};

DeleteTemplateModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  template: PropTypes.object,
  deleteTemplate: PropTypes.func,
  isLoading: PropTypes.bool,
  successCallback: PropTypes.func,
};

export default DeleteTemplateModal;
