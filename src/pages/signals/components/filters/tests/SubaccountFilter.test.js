import React from 'react';
import { shallow } from 'enzyme';
import { SubaccountFilterClassComponent as SubaccountFilter } from '../SubaccountFilter';
import SubaccountTypeahead from 'src/components/typeahead/SubaccountTypeahead';
import styles from '../SubaccountFilter.module.scss';

describe('SubaccountFilter Component', () => {
  const subject = (props = {}) =>
    shallow(
      <SubaccountFilter styles={styles} hasSubaccounts={true} signalOptions={{}} {...props} />,
    );

  const openPopover = wrapper => {
    shallow(wrapper.find('Popover').prop('trigger'))
      .find('Button')
      .simulate('click');
  };

  const openSearch = wrapper => {
    wrapper.find('SubaccountOption[nested=true]').simulate('open');
  };

  it('renders closed popover', () => {
    const wrapper = subject();

    expect(wrapper.find('Popover').prop('open')).toEqual(false);
  });

  it('renders nothing', () => {
    const wrapper = subject({ hasSubaccounts: false });
    expect(wrapper.html()).toBeNull();
  });

  it('renders with subaccount', () => {
    const props = {
      signalOptions: {
        subaccount: { id: 123, name: 'Test Subaccount' },
      },
    };
    const wrapper = subject(props);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders open popover with options', () => {
    const wrapper = subject();
    openPopover(wrapper);
    expect(wrapper.find('Popover')).toMatchSnapshot();
  });

  it('renders open popover with subaccount search', () => {
    const wrapper = subject();

    openPopover(wrapper);
    openSearch(wrapper);

    expect(
      wrapper
        .find('.PopoverContent')
        .at(0)
        .prop('className'),
    ).toMatchSnapshot();
  });

  it('renders open popover with options after back button is clicked', () => {
    const wrapper = subject();

    openPopover(wrapper);
    openSearch(wrapper);

    wrapper.find('UnstyledLink').simulate('click');

    expect(
      wrapper
        .find('.PopoverContent')
        .at(1)
        .prop('className'),
    ).toMatchSnapshot();
  });

  it('calls changeSignalOptions when option is clicked', () => {
    const changeSignalOptions = jest.fn();
    const wrapper = subject({ changeSignalOptions });

    wrapper.setState({ isOpen: true });

    const optionWrapper = wrapper.find('SubaccountOption').first();
    const value = optionWrapper.prop('value');

    optionWrapper.simulate('change', value);

    expect(changeSignalOptions).toHaveBeenCalledWith({ subaccount: value });
  });

  it('calls changeSignalOptions when subaccount is selected', () => {
    const changeSignalOptions = jest.fn();
    const wrapper = subject({ changeSignalOptions });
    const value = {
      id: 123,
      name: 'Test Example',
    };

    wrapper.setState({ isOpen: true, isSearchOpen: true });
    wrapper.find(SubaccountTypeahead).simulate('change', value);

    expect(changeSignalOptions).toHaveBeenCalledWith({ subaccount: value });
  });

  it('calls changeSignalOptions with default option when subaccount is cleared', () => {
    const changeSignalOptions = jest.fn();
    const wrapper = subject({ changeSignalOptions });

    wrapper.setState({ isOpen: true, isSearchOpen: true });
    wrapper.find(SubaccountTypeahead).simulate('change', null);

    expect(changeSignalOptions).toHaveBeenCalledWith({
      subaccount: { id: undefined, name: 'Primary & All Subaccounts' },
    });
  });

  describe('events', () => {
    let stateSpy;
    let wrapper;
    let windowEvent;

    const ref = node => ({
      contains: str => Boolean(str.includes(node)),
    });

    beforeEach(() => {
      wrapper = subject();
      wrapper.instance().contentRef = ref('content');
      wrapper.instance().triggerRef = ref('trigger');
      stateSpy = jest.spyOn(wrapper.instance(), 'setState');
      windowEvent = wrapper.find('WindowEvent');
    });

    it('handles click inside', () => {
      windowEvent.at(0).prop('handler')({ target: 'content' });
      windowEvent.at(0).prop('handler')({ target: 'trigger' });
      expect(stateSpy).not.toHaveBeenCalled();
    });

    it('handles click outside', () => {
      windowEvent.at(0).prop('handler')({ target: 'nope' });
      expect(stateSpy).toHaveBeenCalledWith({ isOpen: false, isSearchOpen: false });
    });

    it('handles escape', () => {
      windowEvent.at(1).prop('handler')({ key: 'Escape' });
      expect(stateSpy).toHaveBeenCalledWith({ isOpen: false, isSearchOpen: false });
    });
  });
});
