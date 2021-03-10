import React from 'react';
import { Button, Modal, Panel, Stack, Text } from 'src/components/matchbox';
import { ButtonWrapper, CopyField, LabelledValue, ShortKeyCode } from 'src/components';
import useModal from 'src/hooks/useModal';
import Heading from 'src/components/text/Heading';

export default function SCIMTokenSection(props) {
  const {
    scimTokenList,
    newScimToken,
    generateScimToken,
    listScimToken,
    deleteScimToken,
    error,
    showAlert,
    generateScimTokenPending,
    deleteScimTokenPending,
    scimTokenListLoading,
    resetScimTokenErrors,
  } = props;
  const { closeModal, isModalOpen, openModal, meta: { name } = {} } = useModal();
  const getActions =
    scimTokenList.length > 0
      ? [
          {
            content: 'Delete Token',
            onClick: () => {
              resetScimTokenErrors();
              openModal({ name: 'Delete Token' });
            },
            color: 'orange',
          },
          {
            content: 'Generate SCIM Token',
            onClick: () => {
              resetScimTokenErrors();
              openModal({ name: 'Override Token' });
            },
            color: 'orange',
          },
        ]
      : [
          {
            content: 'Generate SCIM Token',
            onClick: () => {
              resetScimTokenErrors();
              handleGenerateToken();
            },
            color: 'orange',
          },
        ];
  const handleGenerateToken = () => {
    if (scimTokenList.length > 0) {
      deleteScimToken({ id: scimTokenList[0].id }).then(() => {
        generateScimToken().then(() => {
          listScimToken().then(() => {
            closeModal();
            openModal({ name: 'Generate SCIM Token' });
          });
        });
      });
    } else {
      generateScimToken().then(() => {
        listScimToken().then(() => {
          openModal({ name: 'Generate SCIM Token' });
        });
      });
    }
  };
  const handleDeleteToken = () => {
    deleteScimToken({ id: scimTokenList[0].id }).then(() => {
      listScimToken().then(() => {
        closeModal();
        showAlert({ type: 'success', message: 'SCIM token deleted' });
      });
    });
  };

  const renderModalByName = name => {
    switch (name) {
      case 'Override Token':
        return (
          <Panel.LEGACY title="Generate SCIM Token">
            <Panel.LEGACY.Section>
              <Stack>
                <p>
                  <Text as="span" fontWeight="medium">
                    Override Your Current Token?
                  </Text>
                </p>
                <p>
                  Creating a new token will
                  <Text as="span" fontWeight="medium">
                    <strong> override the existing token.</strong>
                  </Text>
                </p>
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>
              <ButtonWrapper>
                <Button
                  variant="primary"
                  loading={
                    generateScimTokenPending || deleteScimTokenPending || scimTokenListLoading
                  }
                  onClick={() => {
                    handleGenerateToken();
                  }}
                >
                  Generate New Token
                </Button>
                <Button variant="secondary" onClick={() => closeModal()}>
                  Cancel
                </Button>
              </ButtonWrapper>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        );
      case 'Delete Token':
        return (
          <Panel.LEGACY title="Delete SCIM Token">
            <Panel.LEGACY.Section>
              <Stack>
                <p>
                  <Text as="span">
                    The token will be immediately and permanently removed. This cannot be undone.
                  </Text>
                </p>
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>
              <ButtonWrapper>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteToken();
                  }}
                  loading={deleteScimTokenPending || scimTokenListLoading}
                >
                  Delete SCIM Token
                </Button>
                <Button variant="monochrome-secondary" onClick={() => closeModal()}>
                  Cancel
                </Button>
              </ButtonWrapper>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        );

      default:
      case 'Generate SCIM Token':
        return (
          <Panel.LEGACY title="Generate SCIM Token">
            <Panel.LEGACY.Section>
              <Stack>
                <p>Copy this token!</p>
                <p>
                  Make sure to copy your SCIM token now.{' '}
                  <Text as="span" fontWeight="medium">
                    <strong>You won't be able to see it again!</strong>
                  </Text>
                </p>
                <CopyField value={newScimToken} />
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>
              <Button variant="primary" onClick={() => closeModal()}>
                Continue
              </Button>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        );
    }
  };
  return (
    <Panel.LEGACY.Section title="SCIM Token" actions={getActions}>
      <LabelledValue label="SCIM Token">
        <Heading as="h6">
          {scimTokenList.length > 0 ? (
            <ShortKeyCode shortKey={scimTokenList[0].short_key} />
          ) : (
            'No token generated'
          )}
        </Heading>
      </LabelledValue>
      {!error && (
        <Modal.LEGACY open={isModalOpen} onClose={() => closeModal()} showCloseButton title={name}>
          {isModalOpen && renderModalByName(name)}
        </Modal.LEGACY>
      )}
    </Panel.LEGACY.Section>
  );
}
