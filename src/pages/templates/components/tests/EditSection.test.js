import React from 'react';
import { shallow } from 'enzyme';
import useEditorTabs from '../../hooks/useEditorTabs';
import EditSection from '../EditSection';

jest.mock('../../hooks/useEditorTabs');

describe('EditSection', () => {
  const subject = ({ tabState }) => {
    useEditorTabs.mockReturnValue(tabState);
    return shallow(<EditSection />);
  };

  it('renders tabs and section', () => {
    const wrapper = subject({ tabState: { currentTabIndex: 0 }});
    expect(wrapper).toMatchSnapshot();
  });

  it('sets tab on select', () => {
    const setTab = jest.fn();
    const wrapper = subject({ tabState: { currentTabIndex: 0, setTab }});

    wrapper.find('Tabs').simulate('select', 1);

    expect(setTab).toHaveBeenCalledWith(1);
  });
});
