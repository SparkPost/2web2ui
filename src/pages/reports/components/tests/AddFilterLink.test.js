import React from 'react';
import { AddFilterLink } from '../AddFilterLink';
import { shallow } from 'enzyme';

describe('Add Filter Link', () => {
  const filters = ['Campaign: shiny new filter'];
  const baseProps = {
    newFilter: { id: 0, type: 'Subaccount', value: 'Primary Account (ID 0)' },
    reportType: 'summary',
    content: 'primary account',
    addFilters: jest.fn(),
    currentSearchOptions: {
      filters,
      metrics: ['count_something'],
    },
  };

  function subject(props) {
    return shallow(<AddFilterLink {...baseProps} {...props} />);
  }

  it('should render correctly for the summary report and include metrics in the link', () => {
    const wrapper = subject();
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly for other reports and should not include metrics in the link', () => {
    const wrapper = subject({ reportType: 'bounce', currentSearchOptions: { filters } });
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle click correctly', () => {
    const wrapper = subject();
    wrapper.find('PageLink').simulate('mouseUp', {});
    wrapper.find('PageLink').simulate('click');

    expect(baseProps.addFilters).toHaveBeenCalledWith([
      { id: 0, type: 'Subaccount', value: 'Primary Account (ID 0)' },
    ]);
  });

  it('should handle click while holding down meta(cmd) key correctly', () => {
    const wrapper = subject();
    wrapper.find('PageLink').simulate('mouseUp', { metaKey: true });
    wrapper.find('PageLink').simulate('click');
    expect(baseProps.addFilters).not.toHaveBeenCalled();
  });

  it('should handle click while holding down control key correctly', () => {
    const wrapper = subject();
    wrapper.find('PageLink').simulate('mouseUp', { ctrlKey: true });
    wrapper.find('PageLink').simulate('click');
    expect(baseProps.addFilters).not.toHaveBeenCalled();
  });
});
