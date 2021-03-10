import React from 'react';
import { Panel, Modal } from 'src/components/matchbox';
import { LabelledValue } from 'src/components';
import ProviderForm from './ProviderForm';

export class ProviderSection extends React.Component {
  state = {
    isModalOpen: false,
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  render() {
    const { readOnly, provider } = this.props;

    return (
      <Panel.LEGACY.Section
        actions={[
          {
            color: 'orange',
            content: 'Provision SSO',
            disabled: readOnly,
            onClick: this.openModal,
          },
        ]}
      >
        <LabelledValue label="Identity Provider">
          <h6>{provider ? provider : 'Not provisioned'}</h6>
        </LabelledValue>
        <Modal.LEGACY
          open={this.state.isModalOpen}
          showCloseButton
          onClose={this.closeModal}
          title="Provision Single Sign-On"
        >
          <ProviderForm onCancel={this.closeModal} onSubmit={this.closeModal} />
        </Modal.LEGACY>
      </Panel.LEGACY.Section>
    );
  }
}

export default ProviderSection;
