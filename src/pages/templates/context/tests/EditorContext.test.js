import React from 'react';
import { mount, shallow } from 'enzyme';
import { useParams } from 'react-router-dom';
import usePageFilters from 'src/hooks/usePageFilters';
import { EditorContextProvider } from '../EditorContext';

jest.mock('src/hooks/usePageFilters');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('EditorContext', () => {
  describe('EditorContextProvider', () => {
    const subject = ({ render = shallow, value = {}, routerParams = {} } = {}) => {
      usePageFilters.mockReturnValue({
        filters: {
          subaccount: '123',
        },
      });
      useParams.mockReturnValue({
        id: 'test-template',
        ...routerParams,
      });

      return render(
        <EditorContextProvider
          value={{
            getDraft: () => {},
            getPublished: () => {},
            listDomains: () => {},
            listSubaccounts: () => {},
            ...value,
          }}
        >
          <div>Hello</div>
        </EditorContextProvider>,
      );
    };

    it('renders children wrapped by a context provider', () => {
      expect(subject()).toMatchSnapshot();
    });

    it('sets provider value from props', () => {
      const value = { test: 'example' };
      const wrapper = subject({ value });

      expect(wrapper).toHaveProp('value', expect.objectContaining(value));
    });

    it('calls getDraft, listDomains, and listSubaccounts on mount', () => {
      const getDraft = jest.fn();
      const getPublished = jest.fn();
      const listDomains = jest.fn();
      const listSubaccounts = jest.fn();

      subject({
        render: mount, // for useEffect
        value: {
          getDraft,
          getPublished,
          listDomains,
          listSubaccounts,
        },
      });

      expect(getDraft).toHaveBeenCalledWith('test-template', '123');
      expect(getPublished).not.toHaveBeenCalled();
      expect(listDomains).toHaveBeenCalled();
      expect(listSubaccounts).toHaveBeenCalled();
    });

    it('calls getPublished when the route param version is "published"', () => {
      const getDraft = jest.fn();
      const getPublished = jest.fn();
      const listDomains = jest.fn();
      const listSubaccounts = jest.fn();

      subject({
        render: mount,
        value: {
          getDraft,
          getPublished,
          listDomains,
          listSubaccounts,
        },
        routerParams: {
          version: 'published',
        },
      });

      expect(getPublished).toHaveBeenCalledWith('test-template', '123');
    });
  });
});
