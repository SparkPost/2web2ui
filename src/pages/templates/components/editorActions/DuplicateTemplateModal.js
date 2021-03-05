import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PanelLoading } from 'src/components/loading';
import { Form } from 'src/components/form';
import { Button, Panel, TextField, Modal, Stack } from 'src/components/matchbox';

const ModalWrapper = props => {
  const { open, onClose, children } = props;

  return (
    <Modal.LEGACY open={open} onClose={onClose} showCloseButton={true}>
      {children}
    </Modal.LEGACY>
  );
};

const DuplicateTemplateModal = props => {
  const {
    open,
    onClose,
    template,
    contentToDuplicate, // Separated out from the template itself - this is the WIP content such that the template can be duplicated without first saving
    testDataToDuplicate,
    createTemplate,
    successCallback,
    showAlert,
    isLoading,
  } = props;
  const modalProps = { open, onClose };
  const initialDraftName = template && template.name ? `${template.name} (COPY)` : '';
  const initialDraftId = template && template.id ? `${template.id}-copy` : '';

  // State
  const [draftName, setDraftName] = useState(initialDraftName);
  const [draftId, setDraftId] = useState(initialDraftId);
  const [hasNameError, setNameError] = useState(false);
  const [hasIdError, setIdError] = useState(false);

  useEffect(() => {
    setDraftName(initialDraftName);
    setDraftId(initialDraftId);
  }, [initialDraftName, initialDraftId, template]);

  const handleSubmit = e => {
    e.preventDefault();

    if (draftName.length === 0) {
      setNameError(true);
    }

    if (draftId.length === 0) {
      setIdError(true);
    }

    if (draftName.length && draftId.length) {
      createTemplate({
        name: draftName,
        id: draftId,
        subaccount: template.subaccount_id,
        sharedWithSubaccounts: template.shared_with_subaccounts,
        content: contentToDuplicate,
        parsedTestData: testDataToDuplicate,
        options: template.options,
      }).then(() => {
        if (successCallback) {
          successCallback();
        } else {
          showAlert({
            type: 'success',
            message: 'Template duplicated.',
          });

          onClose();
        }
      });
    }
  };

  const handleNameChange = e => {
    setNameError(false);
    setDraftName(e.target.value);
  };

  const handleIdChange = e => {
    setIdError(false);
    setDraftId(e.target.value);
  };

  if (isLoading) {
    return (
      <ModalWrapper {...modalProps}>
        <PanelLoading minHeight="330px" />
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper {...modalProps}>
      <Panel.LEGACY title="Duplicate Template">
        <Form onSubmit={e => handleSubmit(e)} id="templates-duplicate-form">
          <Panel.LEGACY.Section>
            <Stack>
              <TextField
                id="template-name"
                name="templateName"
                label="Template Name"
                required // not working as I would expect...
                value={draftName}
                error={hasNameError ? 'Please enter a template name.' : undefined}
                onChange={handleNameChange}
                data-id="textfield-template-name"
              />

              <TextField
                id="template-id"
                name="templateId"
                label="Template ID"
                required // not working as I would expect...
                value={draftId}
                error={hasIdError ? 'Please enter a unique template ID.' : undefined}
                onChange={handleIdChange}
                data-id="textfield-template-id"
              />
            </Stack>
          </Panel.LEGACY.Section>

          <Panel.LEGACY.Section>
            <Button variant="primary" submit data-id="button-duplicate">
              Duplicate
            </Button>
          </Panel.LEGACY.Section>
        </Form>
      </Panel.LEGACY>
    </ModalWrapper>
  );
};

DuplicateTemplateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.object,
  createTemplate: PropTypes.func,
  successCallback: PropTypes.func,
};

export default DuplicateTemplateModal;
