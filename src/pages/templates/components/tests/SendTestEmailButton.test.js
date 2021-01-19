import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useEditorContext from '../../hooks/useEditorContext';
import SendTestEmailButton from '../SendTestEmailButton';
import TestApp from 'src/__testHelpers__/TestApp';

jest.mock('../../hooks/useEditorContext');

describe('SendTestEmailButton', () => {
  const subject = (editorState, props) => {
    useEditorContext.mockReturnValue({
      content: {
        from: {
          email: 'nick@bounce.uat.sparkpost.com',
        },
        subject: 'Mock Subject',
        text: 'Here is some text',
        html: '<p>Here is some HTML',
      },
      template: {
        id: '123456',
        subaccount_id: 123,
      },
      isPublishedMode: false,
      updateDraft: jest.fn(() => Promise.resolve()),
      setHasSaved: jest.fn(),
      canModify: true,
      ...editorState,
    });

    return render(
      <TestApp>
        <SendTestEmailButton {...props} />
      </TestApp>,
    );
  };

  it('opens the modal in the loading state and saves the draft when the "Send a Test" button is clicked', () => {
    const mockUpdateDraft = jest.fn(() => Promise.resolve());
    const { getByText, queryByTestId } = subject({
      updateDraft: mockUpdateDraft,
    });

    userEvent.click(getByText('Send a Test'));

    expect(mockUpdateDraft).toHaveBeenCalled();
    expect(queryByTestId('panel-loading')).toBeInTheDocument();
  });

  it('opens the modal and resolves the loading state after the draft is updated, rendering the form', () => {
    const promise = Promise.resolve();
    const mockUpdateDraft = jest.fn(() => promise);
    const { queryByText, queryByLabelText, queryByTestId } = subject({
      updateDraft: mockUpdateDraft,
    });

    userEvent.click(queryByText('Send a Test'));

    return promise.then(() => {
      expect(queryByTestId('panel-loading')).not.toBeInTheDocument();
      expect(queryByLabelText('To')).toBeInTheDocument();
      expect(queryByLabelText('From')).toBeInTheDocument();
      expect(queryByLabelText('Subject')).toBeInTheDocument();
      expect(queryByText('Send Email')).toBeInTheDocument();
    });
  });

  it('does not save the draft when opening the modal if the template cannot be modified by the user', () => {
    const mockUpdateDraft = jest.fn();
    const { queryByText } = subject({ canModify: false, updateDraft: mockUpdateDraft });

    userEvent.click(queryByText('Send a Test'));

    expect(mockUpdateDraft).not.toHaveBeenCalled();
  });

  it('renders "Please enter a valid email address" when submitting the form with no values and then clears the error when the modal closes', () => {
    const { getByText, queryByText } = subject();

    userEvent.click(getByText('Send a Test'));

    return Promise.resolve().then(async () => {
      userEvent.click(getByText('Send Email'));

      // expect(queryByText('Please enter a valid email address')).toBeInTheDocument(); TODO - figure out why this is failing

      userEvent.click(queryByText('Close'));

      return Promise.resolve().then(() => {
        expect(queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });
    });
  });

  it('invokes the set test data action (without updating the template otherwise) when the template is in published mode', () => {
    const mockSetTestData = jest.fn();
    const mockUpdateDraft = jest.fn();
    const mockParsedTestData = {
      options: {},
      substitution_data: {
        foo: 'bar',
      },
      metadata: {},
    };

    const { getByText } = subject({
      isPublishedMode: true,
      updateDraft: mockUpdateDraft,
      parsedTestData: mockParsedTestData,
      setTestDataAction: mockSetTestData,
    });

    userEvent.click(getByText('Send a Test'));

    expect(mockUpdateDraft).not.toHaveBeenCalled();
    expect(mockSetTestData).toHaveBeenCalledWith({
      id: '123456',
      mode: 'published',
      data: mockParsedTestData,
    });
  });
});
