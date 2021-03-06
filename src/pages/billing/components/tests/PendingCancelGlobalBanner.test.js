import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingCancelGlobalBanner } from '../PendingCancelGlobalBanner';
import TestApp from 'src/__testHelpers__/TestApp';

describe('PendingCancelGlobalBanner', () => {
  const mockFunctions = {
    renewAccount: jest.fn(() => Promise.resolve()),
    showAlert: jest.fn(),
    hideGlobalBanner: jest.fn(),
    fetchAccount: jest.fn(),
  };

  const subject = (props = {}) =>
    render(
      <TestApp>
        <PendingCancelGlobalBanner
          account={{ pending_cancellation: { effective_date: '2019-09-07T08:00:00.000Z' } }}
          {...mockFunctions}
          {...props}
        />
      </TestApp>,
    );

  it('should call renewAccount, showAlert, and fetchAccount on renewAccount', async () => {
    const { queryByText } = subject();
    await userEvent.click(queryByText("Don't Cancel"));
    expect(mockFunctions.renewAccount).toHaveBeenCalled();
    expect(mockFunctions.showAlert).toHaveBeenCalled();
    expect(mockFunctions.fetchAccount).toHaveBeenCalled();
  });

  it('should call hideGlobalBanner on clicking close', async () => {
    const { queryByText } = subject();

    await userEvent.click(queryByText('Close'));

    expect(mockFunctions.hideGlobalBanner).toHaveBeenCalled();
  });
});
