import React from 'react';
import { shallow, mount } from 'enzyme';
import TestApp from 'src/__testHelpers__/TestApp';
import useEditorContext from '../../hooks/useEditorContext';
import InsertSnippetModal from '../InsertSnippetModal';

jest.mock('../../hooks/useEditorContext');
jest.mock('copy-to-clipboard');

describe('InsertSnippetModal', () => {
  const subject = ({ editorState, isShallow = true, props } = {}) => {
    useEditorContext.mockReturnValue({
      showAlert: jest.fn(),
      getSnippets: jest.fn(() => Promise.resolve()),
      areSnippetsLoading: false,
      snippets: undefined,
      ...editorState,
    });
    const mergedProps = {
      open: true,
      onClose: jest.fn(),
      ...props,
    };

    if (isShallow) {
      return shallow(<InsertSnippetModal {...mergedProps} />);
    }

    return mount(
      <TestApp>
        <InsertSnippetModal {...mergedProps} />
      </TestApp>,
    );
  };

  it('renders the "PanelLoading" while retrieving snippets is true', () => {
    const wrapper = subject({ editorState: { areSnippetsLoading: true } });

    expect(wrapper.find('PanelLoading')).toExist();
  });

  it('renders the "Find a Snippet", "Snippet Code" and "Copy Code"', () => {
    const wrapper = subject({ editorState: { snippets: [] } });

    expect(wrapper).toHaveTextContent('Find a Snippet');
    expect(wrapper).toHaveTextContent('Snippet Code');
    expect(wrapper).toHaveTextContent('Copy Code');
  });

  it('renders the "Typeahead" with help text when no snippets are returned', () => {
    const wrapper = subject({ editorState: { snippets: [] }, isShallow: false });

    expect(wrapper).toHaveTextContent('You have not created a snippet.');
    expect(wrapper).toHaveTextContent('Create your first snippet');

    wrapper.unmount();
  });

  it('renders the "Typeahead" without help text when snippets are available', () => {
    const wrapper = subject({
      editorState: {
        snippets: [
          {
            created_at: '2019-10-08T19:45:22.288Z',
            id: 'this-is-a-fake-snippet-1',
            name: 'Fake Snippet 1',
            shared_with_subaccounts: false,
          },
          {
            created_at: '2019-03-20T11:57:43.544Z',
            id: 'this-is-a-fake-snippet-2',
            name: 'Fake Snippet 2',
            shared_with_subaccounts: true,
          },
        ],
      },
      isShallow: false,
    });

    expect(wrapper).not.toHaveTextContent('You have not created a snippet.');
    expect(wrapper).not.toHaveTextContent('Create your first snippet');
  });

  it('sets the Typeahead results prop to "snippets" when they are available', () => {
    const mySnippets = [
      {
        created_at: '2019-10-08T19:45:22.288Z',
        id: 'this-is-a-fake-snippet-1',
        name: 'Fake Snippet 1',
        shared_with_subaccounts: false,
      },
      {
        created_at: '2019-03-20T11:57:43.544Z',
        id: 'this-is-a-fake-snippet-2',
        name: 'Fake Snippet 2',
        shared_with_subaccounts: true,
      },
    ];
    const wrapper = subject({ editorState: { snippets: mySnippets } });

    expect(wrapper.find('Typeahead').props().results).toEqual(mySnippets);
  });

  it('updates the "CopyField" value onChange of the "TypeAhead"', () => {
    const mySnippet = {
      created_at: '2019-03-20T11:57:43.544Z',
      id: 'this-is-a-fake-snippet-2',
      name: 'Fake Snippet 2',
      shared_with_subaccounts: true,
    };
    const wrapper = subject({
      editorState: {
        snippets: [mySnippet],
      },
    });

    expect(wrapper.find('CopyField').props().value).toEqual('{{ render_snippet( "example-id" ) }}');

    wrapper.find('Typeahead').simulate('change', mySnippet);

    // Test currently not working due to Enzyme limitation.
    // See: https://github.com/airbnb/enzyme/issues/2086
    // Could also be resolved by using `react-testing-library`,
    // though this first requires updating our React version:
    // https://testing-library.com/docs/react-testing-library/intro
    //expect(wrapper.find('CopyField').props().value).toEqual(`{{ render_snippet( "${mySnippet.id}" ) }}`);
  });

  it('invokes "onClose", "copy", and "showAlert" on Form submit', () => {
    const mockOnClose = jest.fn();
    const mockShowAlert = jest.fn();

    const wrapper = subject({
      editorState: {
        snippets: [],
        showAlert: mockShowAlert,
      },
      props: {
        onClose: mockOnClose,
      },
    });

    wrapper.find('Form').simulate('submit');

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'Snippet copied',
    });
  });

  it('invokes "onClose", "copy", and "showAlert" on "Copy Code" button click', () => {
    const mockOnClose = jest.fn();
    const mockShowAlert = jest.fn();

    const wrapper = subject({
      editorState: {
        snippets: [],
        showAlert: mockShowAlert,
      },
      props: {
        onClose: mockOnClose,
      },
    });

    wrapper.find('Button').simulate('click');

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'Snippet copied',
    });
  });
});
