import { mount, shallow } from 'enzyme';
import React from 'react';
import { RedirectAndAlert } from 'src/components/globalAlert';
import TestApp from 'src/__testHelpers__/TestApp';
import { TestDetailsPage } from '../TestDetailsPage';

describe('Page: Single Inbox Placement Test', () => {
  const subject = props => {
    const defaults = {
      getInboxPlacementTest: jest.fn(),
      getInboxPlacementByProvider: jest.fn(),
      getInboxPlacementByRegion: jest.fn(),
      getInboxPlacementBySendingIp: jest.fn(),
      getInboxPlacementTestContent: jest.fn(),
      tabIndex: 0,
      id: 0,
      loading: false,
      error: false,
      history: {
        replace: jest.fn(),
      },
    };

    return shallow(<TestDetailsPage {...defaults} {...props} />);
  };

  it('renders page correctly with defaults', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('calls getInboxPlacementTest on load', () => {
    const getInboxPlacementTest = jest.fn().mockReturnValue({});
    const getInboxPlacementByProvider = jest.fn().mockReturnValue({});
    const getInboxPlacementByRegion = jest.fn().mockReturnValue({});
    const getInboxPlacementBySendingIp = jest.fn().mockReturnValue({});
    const getInboxPlacementTestContent = jest.fn().mockReturnValue({});

    mount(
      <TestApp>
        <TestDetailsPage
          details={{}}
          content={{}}
          getInboxPlacementTest={getInboxPlacementTest}
          getInboxPlacementByProvider={getInboxPlacementByProvider}
          getInboxPlacementByRegion={getInboxPlacementByRegion}
          getInboxPlacementBySendingIp={getInboxPlacementBySendingIp}
          getInboxPlacementTestContent={getInboxPlacementTestContent}
          id={101}
          tabIndex={1} //not working nicely with tabIndex=0; TestDetails component
          history={{ replace: jest.fn() }}
        />
      </TestApp>,
    );

    expect(getInboxPlacementTest).toHaveBeenCalled();
    expect(getInboxPlacementByProvider).toHaveBeenCalled();
    expect(getInboxPlacementByRegion).toHaveBeenCalled();
    expect(getInboxPlacementBySendingIp).toHaveBeenCalled();
    expect(getInboxPlacementTestContent).toHaveBeenCalled();
  });

  it('renders loading', () => {
    const wrapper = subject({ loading: true });
    expect(wrapper.find('Loading')).toExist();
    expect(wrapper.find('Page')).not.toExist();
  });

  it('handles errors', () => {
    const wrapper = subject();
    wrapper.setProps({
      error: {
        message: 'You dun goofed',
      },
    });
    expect(wrapper.find(RedirectAndAlert)).toMatchSnapshot();
    expect(wrapper.find('Page')).not.toExist();
  });

  it('renders details when tab is set to details', () => {
    const wrapper = subject();
    expect(wrapper.find('TestDetails')).toExist();
    expect(wrapper.find('TestContent')).not.toExist();
  });

  it('renders content when tab is set to content', () => {
    const wrapper = subject({ tabIndex: 1 });
    expect(wrapper.find('TestContent')).toExist();
    expect(wrapper.find('TestDetails')).not.toExist();
  });

  it('updates URL when tabs change', () => {
    const mockHistory = { replace: jest.fn() };
    const wrapper = mount(
      <TestApp>
        <TestDetailsPage
          tabIndex={1}
          details={{}}
          content={{}}
          history={mockHistory}
          getInboxPlacementTest={jest.fn()}
          getInboxPlacementByProvider={jest.fn()}
          getInboxPlacementByRegion={jest.fn()}
          getInboxPlacementBySendingIp={jest.fn()}
          getInboxPlacementTestContent={jest.fn()}
        />
      </TestApp>,
    );
    wrapper
      .find('Tab')
      .last()
      .simulate('click');
    expect(mockHistory.replace).toHaveBeenCalled();
  });
});
