import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestApp from 'src/__testHelpers__/TestApp';
import { GettingStartedGuide } from '../GettingStartedGuide';
import { GUIDE_IDS } from 'src/constants';

const defaultProps = {
  onboarding: { isGuideAtBottom: false },
  history: {
    push: jest.fn(),
  },
  listApiKeys: jest.fn(),
  setAccountOption: jest.fn(),
  listSendingDomains: jest.fn(),
  isAdmin: true,
  canManageKeys: true,
  canManageSendingDomains: true,
  canManageUsers: true,
};

describe('GettingStartedGuide full', () => {
  const hibanaOnSubject = (props, renderFn = render) =>
    renderFn(
      <TestApp isHibanaEnabled={true}>
        <GettingStartedGuide {...defaultProps} {...props} />
      </TestApp>,
    );

  it('should navigate to /domains/create Add Sending Domain is clicked - hibana', () => {
    const { queryByText } = hibanaOnSubject({ onboarding: { active_step: "Let's Code" } });
    userEvent.click(queryByText('Add Sending Domain'));
    expect(defaultProps.history.push).toHaveBeenCalledWith(`/domains/create`);
  });

  const hibanaOffSubject = (props, renderFn = render) =>
    renderFn(
      <TestApp>
        <GettingStartedGuide {...defaultProps} {...props} />
      </TestApp>,
    );

  it('should render ShowMeSparkpostStep inside "Start Sending with SparkPost" Expandable and this Expandable is open by default', () => {
    const { queryByText, queryAllByTestId } = hibanaOffSubject({
      onboarding: { active_step: 'Show Me SparkPost' },
    });

    const expandables = queryAllByTestId('expandable-toggle');
    expect(expandables[0]).toHaveAttribute('aria-expanded', 'true');
    expect(expandables.length).toEqual(2);
    expect(queryByText('SparkPost Analytics')).toBeInTheDocument();
    expect(queryByText('Start Sending with SparkPost')).toBeInTheDocument();
    expect(queryByText('Send a Test Email')).toBeInTheDocument(); // ShowMeSparkpostStep
    expect(queryByText('Send a test email using our starter template.')).toBeInTheDocument(); // ShowMeSparkpostStep
  });

  it('should render LetsCodeStep inside SparkPost Analytics Expandable', () => {
    const { queryByText, queryAllByTestId } = hibanaOffSubject({
      onboarding: { active_step: "Let's Code" },
    });
    const expandables = queryAllByTestId('expandable-toggle');
    expect(expandables[1]).toHaveAttribute('aria-expanded', 'false');
    expect(expandables.length).toEqual(2);
    expect(queryByText('SparkPost Analytics')).toBeInTheDocument();
    expect(queryByText('Start Sending with SparkPost')).toBeInTheDocument();
    expect(
      queryByText("You'll need to add a sending domain in order to start sending emails."),
    ).toBeInTheDocument();
  });

  it('should not render the "Start Sending with SparkPost" Expandable when user does not have grants to manageKeys or manageSendingDomains', () => {
    const { queryByText, queryAllByTestId } = hibanaOffSubject({
      canManageKeys: false,
      canManageSendingDomains: false,
      onboarding: { active_step: "Let's Code" },
    });
    const expandables = queryAllByTestId('expandable-toggle');
    expect(expandables.length).toEqual(1);
    expect(queryByText('SparkPost Analytics')).toBeInTheDocument();
    expect(queryByText('Start Sending with SparkPost')).not.toBeInTheDocument();
  });

  it('should navigate to templates page when Send a Test Email button is clicked', () => {
    const { queryByText } = hibanaOffSubject({ onboarding: { active_step: 'Show Me SparkPost' } });
    userEvent.click(queryByText('Send Test Email'));
    expect(defaultProps.history.push).toHaveBeenCalledWith(
      `/templates?appcue=${GUIDE_IDS.SEND_TEST_EMAIL}`,
    );
  });

  it('should navigate to summary report when Explore Analytics button is clicked', () => {
    const { getAllByText } = hibanaOffSubject({ onboarding: { active_step: 'Show Me SparkPost' } });
    userEvent.click(getAllByText('Explore Analytics')[1]);

    expect(defaultProps.history.push).toHaveBeenCalledWith(`/reports/summary`, {
      triggerGuide: true,
    });
  });

  it('should navigate to events page when Check Out Events button is clicked', () => {
    const { getAllByText } = hibanaOffSubject({ onboarding: { active_step: 'Show Me SparkPost' } });
    userEvent.click(getAllByText('Check Out Events')[1]);

    expect(defaultProps.history.push).toHaveBeenCalledWith(`/reports/message-events`, {
      triggerGuide: true,
    });
  });

  it('should navigate to users page when Invite a Collaborator is clicked', () => {
    const { queryByText } = hibanaOffSubject({ onboarding: { active_step: 'Show Me SparkPost' } });
    userEvent.click(queryByText('Invite a Collaborator'));
    expect(defaultProps.history.push).toHaveBeenCalledWith(`/account/users`);
    expect(defaultProps.setAccountOption).toHaveBeenCalledWith('onboarding', {
      invite_collaborator_completed: true,
    });
  });

  it('should have an external link to developer docs', () => {
    const { queryByText } = hibanaOffSubject({ onboarding: { active_step: "Let's Code" } });
    userEvent.click(queryByText('View Developer Docs'));
    expect(defaultProps.setAccountOption).toHaveBeenCalledWith('onboarding', {
      view_developer_docs_completed: true,
    });
  });

  it("should route to API key page from Let's Code list", () => {
    const { queryByText } = hibanaOffSubject({
      onboarding: { active_step: "Let's Code" },
      hasApiKeysForSending: true,
    });
    userEvent.click(queryByText('Generate API Key'));
    expect(defaultProps.history.push).toHaveBeenCalledWith('/account/api-keys');
  });

  it('should navigate to sending domains page when Add Sending Domain is clicked', () => {
    const { queryByText } = hibanaOffSubject({ onboarding: { active_step: "Let's Code" } });
    userEvent.click(queryByText('Add Sending Domain'));
    expect(defaultProps.history.push).toHaveBeenCalledWith(`/domains/create`);
  });
});
