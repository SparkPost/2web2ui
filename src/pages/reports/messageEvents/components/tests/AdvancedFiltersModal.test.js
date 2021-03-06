import React from 'react';
import { shallow } from 'enzyme';
import { AdvancedFiltersModal } from '../AdvancedFiltersModal';
import { Modal } from 'src/components/matchbox';
import { getEmptyFilters } from 'src/helpers/messageEvents';
import { EVENTS_SEARCH_FILTERS } from 'src/constants';

describe('Component: AdvancedFiltersModal', () => {
  let wrapper;
  const props = {
    updateMessageEventsSearchOptions: jest.fn(),
    getDocumentation: jest.fn(),
  };

  beforeEach(() => {
    wrapper = shallow(<AdvancedFiltersModal {...props} />);
  });

  it('should render initially and sync to state correctly', () => {
    expect(wrapper).toMatchSnapshot();
    expect(props.getDocumentation).toHaveBeenCalled();
  });

  it('should open modal', () => {
    wrapper
      .find('Button')
      .at(0)
      .simulate('click');

    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(true);
  });

  it('should update event search options when handleApply is called', () => {
    wrapper.setState({ modalOpen: true });
    wrapper.instance().handleApply({
      searchQuery: [{ key: 'campaigns', value: 'foo' }],
      click: true,
      bounce: false,
    });
    const params = {
      ...getEmptyFilters(EVENTS_SEARCH_FILTERS),
      campaigns: ['foo'],
      events: ['click'],
    };
    expect(props.updateMessageEventsSearchOptions).toHaveBeenCalledWith(params);
  });

  it('should remove empty filters when trying to apply filters', () => {
    wrapper.setState({ modalOpen: true });
    wrapper.instance().handleApply({
      searchQuery: [{}, { key: 'campaigns', value: 'foo' }],
      click: true,
      bounce: false,
    });
    const params = {
      ...getEmptyFilters(EVENTS_SEARCH_FILTERS),
      campaigns: ['foo'],
      events: ['click'],
    };
    expect(props.updateMessageEventsSearchOptions).toHaveBeenCalledWith(params);
  });

  it('should close the modal when handleApply is called', () => {
    wrapper.setState({ modalOpen: true });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(true);
    wrapper.instance().handleApply({ searchQuery: [] });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(false);
  });

  it('should close the modal when pressing the escape key; when modal is open', () => {
    wrapper.setState({ modalOpen: true });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(true);
    wrapper.instance().handleKeyDown({ key: 'Escape' });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(false);
  });

  it('should keep the modal closed when pressing the escape key; when modal is closed', () => {
    wrapper.setState({ modalOpen: false });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(false);
    wrapper.instance().handleKeyDown({ key: 'Escape' });
    expect(wrapper.find(Modal.LEGACY).props().open).toEqual(false);
  });
});
