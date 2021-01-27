import React from 'react';
import { shallow } from 'enzyme';
import cases from 'jest-in-case';
import Loading from 'src/components/loading';
import SubaccountSection from 'src/components/subaccountSection';
import CreatePage from '../CreatePage';

describe('CreatePage', () => {
  const subject = props => shallow(<CreatePage handleSubmit={fn => fn} {...props} />);

  it('renders form', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders form with subaccount assignment', () => {
    const wrapper = subject({ hasSubaccounts: true });
    expect(wrapper.find(SubaccountSection).exists()).toEqual(true);
  });

  it('renders form to duplicate snippet', () => {
    const getSnippet = jest.fn();
    const wrapper = subject({
      getSnippet,
      snippetToDuplicate: {
        id: 'duplicate-snippet',
        subaccountId: '123',
      },
    });

    expect(getSnippet).toHaveBeenCalledWith({ id: 'duplicate-snippet', subaccountId: '123' });
    expect(wrapper.prop('title')).toEqual('Duplicate Snippet');
  });

  it('renders spinner when loading snippet to duplicate', () => {
    const wrapper = subject({ loading: true });
    expect(wrapper.find(Loading).exists()).toEqual(true);
  });

  it('clears loaded snippet on unmount', () => {
    const clearSnippet = jest.fn();
    const wrapper = subject({ clearSnippet });

    wrapper.instance().componentWillUnmount();

    expect(clearSnippet).toHaveBeenCalled();
  });

  it('redirects to edit page after create suceeds', async () => {
    const createSnippet = jest.fn(() => Promise.resolve());
    const historyPush = jest.fn();
    const wrapper = subject({ createSnippet, history: { push: historyPush } });

    await wrapper.prop('primaryAction').onClick({ id: 'test-snippet', subaccount: { id: 123 } });

    expect(createSnippet).toHaveBeenCalled();
    expect(historyPush).toHaveBeenCalledWith('/snippets/edit/test-snippet?subaccount=123');
  });

  describe('.submitSnippet', () => {
    cases(
      'succeeds',
      ({ name, ...values }) => {
        const createSnippet = jest.fn(() => Promise.resolve());
        const historyPush = jest.fn();
        const wrapper = subject({ createSnippet, history: { push: historyPush } });

        wrapper.prop('primaryAction').onClick({
          ...values,
          id: 'example-snippet',
          name: 'Example Snippet',
        });

        expect(createSnippet).toMatchSnapshot();
      },
      {
        'with content': {
          content: {
            html: '<p>testing...</p>',
            text: 'testing...',
            amp_html: '<span>amped</span>',
          },
        },
        'with primary account assignment': {
          assignTo: 'master',
          content: {},
        },
        'with shared subaccounts assignment': {
          assignTo: 'shared',
          content: {},
        },
        'with a subaccount assignment': {
          assignTo: 'subaccount',
          subaccount: {
            id: 'example-subaccount',
          },
          content: {},
        },
      },
    );
  });
});
