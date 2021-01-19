import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import TestApp from 'src/__testHelpers__/TestApp';
import { WatchlistAddPage } from '../WatchlistAddPage';

const ipOrSendingDomainText = 'IP or Sending Domain';
const saveText = 'Save';
const saveAndContinueText = 'Save and Add Another';

describe('WatchlistAddPage', () => {
  const mockwatchlistAdd = jest.fn(() => Promise.resolve());
  const mockShowAlert = jest.fn();
  const mockHistory = { push: jest.fn() };
  const subject = props => {
    const defaults = {
      watchlistAdd: mockwatchlistAdd,
      showAlert: mockShowAlert,
      history: mockHistory,
      submitPending: false,
      submitError: undefined,
    };
    return render(
      <TestApp>
        <WatchlistAddPage {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('displays the add IP or sending domain field', () => {
    const { queryByLabelText } = subject();
    expect(queryByLabelText(ipOrSendingDomainText)).toBeInTheDocument();
  });

  it('displays the Save button', () => {
    const { queryByText } = subject();
    expect(queryByText(saveText)).toBeInTheDocument();
  });

  it('displays the Save and Add Another button', () => {
    const { queryByText } = subject();
    expect(queryByText(saveAndContinueText)).toBeInTheDocument();
  });

  it('displays the Save button as disabled on load', () => {
    const { queryByRole } = subject();
    expect(queryByRole('button', { name: saveText })).toHaveProperty('disabled');
  });

  it('displays the Save and Add Another button as disabled on load', () => {
    const { queryByRole } = subject();
    expect(queryByRole('button', { name: saveAndContinueText })).toHaveProperty('disabled');
  });

  it.skip('submits the resource and redirects on save', () => {
    const resource = 'test';
    const promise = Promise.resolve({ resource });
    const watchlistAdd = jest.fn(() => promise);
    const { getByLabelText, getByText } = subject({ watchlistAdd });

    const input = getByLabelText(ipOrSendingDomainText);
    const save = getByText(saveText);
    fireEvent.change(input, { target: { value: resource } });
    expect(input.value).toBe(resource);
    fireEvent.click(save);

    expect(watchlistAdd).toBeCalledWith(resource);
    return promise.then(() => {
      expect(mockHistory.push).toBeCalledWith('/signals/blocklist/monitors');
      expect(mockShowAlert).toBeCalledWith({
        type: 'success',
        message: `Added ${resource} to Watchlist`,
      });
    });
  });

  it('submits the resource and resets input on save and continue', () => {
    const resource = 'test';
    const promise = Promise.resolve({ resource });
    const watchlistAdd = jest.fn(() => promise);
    const { getByLabelText, getByText } = subject({ watchlistAdd });

    const input = getByLabelText(ipOrSendingDomainText);
    const saveAndContinue = getByText(saveAndContinueText);
    fireEvent.change(input, { target: { value: resource } });
    fireEvent.click(saveAndContinue);

    expect(watchlistAdd).toBeCalledWith(resource);
    return promise.then(() => {
      expect(mockHistory.push).not.toBeCalledWith('/signals/blocklist/monitors');
      expect(mockShowAlert).toBeCalledWith({
        type: 'success',
        message: `Added ${resource} to Watchlist`,
      });
      expect(input.value).toBe('');
    });
  });

  it('validation error displays when prop is set', () => {
    const { queryByText } = subject({ submitError: { message: 'test validation error' } });
    expect(queryByText('test validation error')).toBeInTheDocument();
  });
});
