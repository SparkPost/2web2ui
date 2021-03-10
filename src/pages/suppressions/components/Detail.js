import React, { Component } from 'react';

import { Box, Panel, Modal } from 'src/components/matchbox';
import { LabelledValue, CopyField } from 'src/components';
import { formatDateTime } from 'src/helpers/date';
import { formatSubaccountDisplay } from '../helpers';

export default class Detail extends Component {
  renderContents = () => {
    const { suppression, subaccounts: allSubaccounts, hasSubaccounts } = this.props;

    return (
      <div>
        <Box paddingY="300">
          <LabelledValue key="recipient" label="Recipient" value={suppression.recipient} />
          <LabelledValue
            key="type"
            label="Type"
            value={suppression.type === 'transactional' ? 'Transactional' : 'Non-transactional'}
          />
          <LabelledValue key="source" label="Source" value={suppression.source} />
          <LabelledValue
            key="updated"
            label="Updated"
            value={formatDateTime(suppression.updated)}
          />
          {hasSubaccounts && (
            <LabelledValue
              key="subaccount"
              label="Subaccount"
              value={formatSubaccountDisplay(suppression.subaccount_id, allSubaccounts)}
            />
          )}
          <LabelledValue
            key="created"
            label="Created"
            value={formatDateTime(suppression.created)}
          />
          <LabelledValue key="description" label="Description" value={suppression.description} />
          <LabelledValue
            key="raw json"
            label="Raw JSON"
            value={
              <CopyField id="suppression-detail-copy-field" value={JSON.stringify(suppression)} />
            }
          />
        </Box>
      </div>
    );
  };

  render() {
    const { open, onCancel, suppression } = this.props;

    return (
      <Modal.LEGACY open={open} showCloseButton onClose={onCancel} title="Suppression Details">
        <Panel.LEGACY title="Suppression Details" sectioned>
          {suppression && this.renderContents()}
        </Panel.LEGACY>
      </Modal.LEGACY>
    );
  }
}
