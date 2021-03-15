import React from 'react';
import { Modal, Panel } from 'src/components/matchbox';
import { useModal } from 'src/hooks';
import { render, fireEvent } from '@testing-library/react';
import * as segmentHelpers from 'src/helpers/segment';
jest.mock('src/helpers/segment');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ location: '' }),
}));

describe('segment track is called with correct arguements', () => {
  const MockComponent = ({ legacy = true }) => {
    const { closeModal, openModal, isModalOpen = false } = useModal();

    if (!legacy) {
      return (
        <>
          <button onClick={openModal}>Open Modal</button>

          <Modal open={isModalOpen} onClose={closeModal}>
            <Modal.Header showCloseButton={false}>TEST NEW MODAL</Modal.Header>
            <Modal.Content>New Content</Modal.Content>
          </Modal>
        </>
      );
    }
    return (
      <>
        <button onClick={openModal}>Open Modal</button>

        <Modal.LEGACY open={isModalOpen} onClose={closeModal} title="TEST MODAL">
          <Panel.LEGACY title="TEST MODAL"> content</Panel.LEGACY>
        </Modal.LEGACY>
      </>
    );
  };
  it('for Legacy Modal', () => {
    const { queryByText } = render(<MockComponent />);

    fireEvent.click(queryByText('Open Modal'));

    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith('Modal Opened', {
      title: 'TEST MODAL',
    });
  });
  it('for Modal', () => {
    const { queryByText } = render(<MockComponent legacy={false} />);

    fireEvent.click(queryByText('Open Modal'));

    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith('Modal Opened', {
      title: 'TEST NEW MODAL',
    });
  });
});
