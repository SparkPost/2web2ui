import React from 'react';
import Panel from '../Panel';
import { shallow } from 'enzyme';
import { useHibana } from 'src/context/HibanaContext';
jest.mock('src/context/HibanaContext');

function mockHibanaIsEnabled() {
  return useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: true }]);
}

function mockHibanaIsDisabled() {
  return useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: false }]);
}

describe('Panel Matchbox component wrapper: ', () => {
  describe('Panel', () => {
    const subject = () => shallow(<Panel />);

    it('renders when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper.find('Panel')).toExist();
    });

    it('throws an error when Hibana is not enabled', () => {
      mockHibanaIsDisabled();

      expect(subject).toThrowError();
    });
  });

  describe('Panel.Section', () => {
    const subject = () => shallow(<Panel.Section />);

    it('renders when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.Section');
    });

    it('throws an error when Hibana is not enabled', () => {
      mockHibanaIsDisabled();

      expect(subject).toThrowError();
    });
  });

  describe('Panel.Action', () => {
    const subject = () => shallow(<Panel.Action />);

    it('renders when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.Action');
    });

    it('throws an error when Hibana is not enabled', () => {
      mockHibanaIsDisabled();

      expect(subject).toThrowError();
    });
  });

  describe('Panel.LEGACY', () => {
    const subject = () => shallow(<Panel.LEGACY />);

    it('renders the OG version of Panel.LEGACY when Hibana is not enabled', () => {
      mockHibanaIsDisabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel');
    });

    it('renders the Hibana version of Panel.LEGACY when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.LEGACY');
    });
  });

  describe('Panel.LEGACY.Section', () => {
    const subject = () => shallow(<Panel.LEGACY.Section />);

    it('renders the OG version of Panel.LEGACY.Section when Hibana is not enabled', () => {
      mockHibanaIsDisabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.Section');
    });

    it('renders the Hibana version of Panel.LEGACY.Section when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.LEGACY.Section');
    });
  });

  describe('Panel.LEGACY.Footer', () => {
    const subject = () => shallow(<Panel.LEGACY.Footer />);

    it('renders the OG version of Panel.LEGACY.Footer when Hibana is not enabled', () => {
      mockHibanaIsDisabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.Footer');
    });

    it('renders the Hibana version of Panel.LEGACY.Footer when Hibana is enabled', () => {
      mockHibanaIsEnabled();
      const wrapper = subject();

      expect(wrapper).toHaveDisplayName('Panel.LEGACY.Footer');
    });
  });

  describe('Panel.Headline', () => {
    const subject = props => shallow(<Panel.Headline {...props} />);

    it('renders with passed in children', () => {
      mockHibanaIsEnabled();
      const wrapper = subject({ children: 'Hello!' });

      expect(wrapper).toHaveTextContent('Hello!');
    });

    it('throws an error when Hibana is not enabled', () => {
      mockHibanaIsDisabled();

      expect(subject).toThrowError();
    });
  });

  describe('Panel.HeadlineIcon', () => {
    const subject = props => shallow(<Panel.HeadlineIcon {...props} />);

    it('renders with the "as" prop', () => {
      useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: true }]);
      const MyIcon = () => <div>I am pretending to be an icon.</div>;
      const wrapper = subject({ as: MyIcon });

      expect(wrapper.find('Box')).toHaveProp('as', MyIcon);
    });

    it('throws an error when Hibana is not enabled', () => {
      mockHibanaIsDisabled();

      expect(subject).toThrowError();
    });
  });
});
