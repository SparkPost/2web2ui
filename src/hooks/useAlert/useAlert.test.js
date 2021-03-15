import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalAlertWrapper } from 'src/components';
import { TestApp } from 'src/__testHelpers__';
import useAlert from './useAlert';

// Mock transitions to avoid timing issues caused by animation
jest.mock('react-transition-group/TransitionGroup', () => {
  const TransitionGroup = jest.fn(props => <div>{props.children}</div>);

  return TransitionGroup;
});

function Demo() {
  const { showAlert, clearAlert } = useAlert();

  return (
    <div>
      <button onClick={() => showAlert({ type: 'success', message: 'This is an alert' })}>
        Show Alert
      </button>

      <button onClick={() => clearAlert('alert_1')}>Clear Alert</button>
    </div>
  );
}

describe('useAlert', () => {
  it('renders alerts using the "showAlert" method and then clears them using the "clearAlert" method', () => {
    render(
      <TestApp>
        <Demo />
        <GlobalAlertWrapper />
      </TestApp>,
    );

    const showAlertButton = screen.getByRole('button', { name: 'Show Alert' });
    const clearAlertButton = screen.getByRole('button', { name: 'Clear Alert' });

    userEvent.click(showAlertButton);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This is an alert');

    userEvent.click(clearAlertButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
