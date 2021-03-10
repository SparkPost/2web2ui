import React from 'react';
import { shallow } from 'enzyme';
import { useHibana } from 'src/context/HibanaContext';
import Modal from '../Modal';
import Panel from '../Panel';
import { useModal } from 'src/hooks';
import { render, fireEvent } from '@testing-library/react';
import * as segmentHelpers from 'src/helpers/segment';
jest.mock('src/helpers/segment');
jest.mock('src/context/HibanaContext');

function mockHibanaIsEnabled() {
  return useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: true }]);
}

describe('Modal and Modal.LEGACY', () => {
  describe('Modal', () => {
    const subject = () => shallow(<Modal />);

    it('renders with Hibana enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toExist();
    });
  });

  describe('Modal.Header', () => {
    const subject = () => shallow(<Modal.Header />);

    it('renders with Hibana enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toExist();
    });
  });

  describe('Modal.Content', () => {
    const subject = () => shallow(<Modal.Content />);

    it('renders with Hibana enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toExist();
    });
  });

  describe('Modal.Footer', () => {
    const subject = () => shallow(<Modal.Footer />);

    it('renders with Hibana enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toExist();
    });
  });

  describe('Modal.LEGACY', () => {
    const subject = () => shallow(<Modal.LEGACY />);

    it('should render the Hibana version of the Modal when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).not.toHaveDisplayName('OGModal');
    });
  });

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
});
