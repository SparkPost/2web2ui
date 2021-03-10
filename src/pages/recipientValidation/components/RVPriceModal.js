import React from 'react';
import { RecipientValidationPriceTable } from 'src/components';
import { Panel, Modal } from 'src/components/matchbox';
import OGStyles from './RVPriceModal.module.scss';
import hibanaStyles from './RVPriceModalHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

export default function RVPriceModal({ isOpen, handleOpen }) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return (
    <Modal.LEGACY
      open={isOpen}
      onClose={() => handleOpen(false)}
      showCloseButton
      title="Recipient Validation Price Modal"
    >
      <Panel.LEGACY title="How was this calculated?">
        <Panel.LEGACY.Section>
          <RecipientValidationPriceTable
            cellProps={{
              className: styles.rvModalCell,
            }}
          />
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
    </Modal.LEGACY>
  );
}
