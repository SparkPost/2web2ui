import { snapshotActionCases } from 'src/__testHelpers__/snapshotActionHelpers';
import {
  clearSnippet,
  createSnippet,
  getSnippet,
  getSnippets,
  deleteSnippet,
  updateSnippet,
} from '../snippets';

jest.mock('src/actions/helpers/sparkpostApiRequest');

describe('Snippet Actions', () => {
  snapshotActionCases('.clearSnippet', [
    {
      name: 'by default',
      actionCreator: clearSnippet,
    },
  ]);

  snapshotActionCases('.createSnippet', [
    {
      name: 'when assigned to primary account',
      actionCreator: () =>
        createSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          text: 'Testing...',
        }),
    },
    {
      name: 'when shared with all subaccounts',
      actionCreator: () =>
        createSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          sharedWithSubaccounts: true,
          text: 'Testing...',
        }),
    },
    {
      name: 'with a subaccount',
      actionCreator: () =>
        createSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          subaccountId: 'example-subaccount',
          text: 'Testing...',
        }),
    },
    {
      name: 'with html and text content',
      actionCreator: () =>
        createSnippet({
          html: '<p>Testing...</p>',
          id: 'test-snippet',
          name: 'Test Snippet',
          text: 'Testing...',
        }),
    },
    {
      name: 'with amp_html',
      actionCreator: () =>
        createSnippet({
          amp_html: '<p>AMP Testing...</p>',
        }),
    },
  ]);

  snapshotActionCases('.getSnippet', [
    {
      name: 'with id',
      actionCreator: () => getSnippet({ id: 123 }),
    },
    {
      name: 'with id and subaccount',
      actionCreator: () => getSnippet({ id: 123, subaccountId: 456 }),
    },
  ]);

  snapshotActionCases('.getSnippets', [
    {
      name: 'when assigned to primary account',
      actionCreator: getSnippets,
    },
  ]);

  snapshotActionCases('.deleteSnippet', [
    {
      name: 'when assigned to primary account',
      actionCreator: () =>
        deleteSnippet({
          id: 'test-snippet',
        }),
    },
    {
      name: 'when assigned to subaccount',
      actionCreator: () =>
        deleteSnippet({
          id: 'test-snippet',
          subaccountId: 101,
        }),
    },
  ]);

  snapshotActionCases('.updateSnippet', [
    {
      name: 'when assigned to primary account',
      actionCreator: () =>
        updateSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          text: 'Testing...',
        }),
    },
    {
      name: 'when shared with all subaccounts',
      actionCreator: () =>
        updateSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          sharedWithSubaccounts: true,
          text: 'Testing...',
        }),
    },
    {
      name: 'with a subaccount',
      actionCreator: () =>
        updateSnippet({
          id: 'test-snippet',
          name: 'Test Snippet',
          subaccountId: 'example-subaccount',
          text: 'Testing...',
        }),
    },
    {
      name: 'with html and text content',
      actionCreator: () =>
        updateSnippet({
          html: '<p>Testing...</p>',
          id: 'test-snippet',
          name: 'Test Snippet',
          text: 'Testing...',
        }),
    },
    {
      name: 'with amp_html',
      actionCreator: () =>
        updateSnippet({
          amp_html: '<p>AMP Testing...</p>',
        }),
    },
  ]);
});
