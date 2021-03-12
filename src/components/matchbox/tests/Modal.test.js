import React from 'react';
import { shallow } from 'enzyme';
import { useHibana } from 'src/context/HibanaContext';
import Modal from '../Modal';
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
});
