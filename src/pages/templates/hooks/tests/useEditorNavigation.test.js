import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { useParams } from 'react-router-dom';
import useEditorNavigation from '../useEditorNavigation';
import usePageFilters from 'src/hooks/usePageFilters';

jest.mock('src/hooks/usePageFilters');

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('useEditorNavigation', () => {
  const useTestWrapper = ({ routerState } = {}) => {
    usePageFilters.mockReturnValue({ filters: routerState.requestParams });
    useParams.mockReturnValue({
      id: routerState.requestParams.id,
      version: routerState.requestParams.version,
      navKey: routerState.requestParams.navKey,
    });
    const TestComponent = () => <div hooked={useEditorNavigation()} />;
    return mount(<TestComponent />);
  };
  const useHook = wrapper =>
    wrapper
      .update()
      .children()
      .prop('hooked');

  it('returns first link by default', () => {
    const wrapper = useTestWrapper({
      routerState: {
        requestParams: { id: 'test-template' },
      },
    });

    expect(useHook(wrapper)).toEqual(
      expect.objectContaining({ currentNavigationIndex: 0, currentNavigationKey: 'content' }),
    );
  });

  it('returns matched link', () => {
    const wrapper = useTestWrapper({
      routerState: {
        requestParams: {
          id: 'test-template',
          navKey: 'settings',
        },
      },
    });

    expect(useHook(wrapper)).toEqual(
      expect.objectContaining({ currentNavigationIndex: 1, currentNavigationKey: 'settings' }),
    );
  });

  describe('redirections', () => {
    afterEach(() => {
      mockHistoryPush.mockReset();
    });

    const subject = wrapper => {
      act(() => {
        useHook(wrapper).setNavigation('settings');
      });
    };
    const routeState = (overrides = {}) => ({
      routerState: {
        requestParams: { id: 'test-template', ...overrides },
      },
    });

    it('redirects when link is clicked (draft)', () => {
      subject(useTestWrapper(routeState()));
      expect(mockHistoryPush).toHaveBeenCalledWith('/templates/edit/test-template/draft/settings');
    });

    it('redirects with subaccount id (draft)', () => {
      subject(useTestWrapper(routeState({ subaccount: 102 })));
      expect(mockHistoryPush).toHaveBeenCalledWith(
        '/templates/edit/test-template/draft/settings?subaccount=102',
      );
    });

    it('redirects when link is clicked (published)', () => {
      subject(useTestWrapper(routeState({ version: 'published' })));
      expect(mockHistoryPush).toHaveBeenCalledWith(
        '/templates/edit/test-template/published/settings',
      );
    });

    it('redirects with subaccount id (published)', () => {
      subject(useTestWrapper(routeState({ version: 'published', subaccount: 102 })));
      expect(mockHistoryPush).toHaveBeenCalledWith(
        '/templates/edit/test-template/published/settings?subaccount=102',
      );
    });
  });
});
