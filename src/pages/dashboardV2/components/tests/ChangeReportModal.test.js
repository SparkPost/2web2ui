import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChangeReportModal } from '../ChangeReportModal';
import TestApp from 'src/__testHelpers__/TestApp';

describe('ChangeReportModal', () => {
  const defaults = {
    currentUser: 'Sparky McSparkFace',
    open: true,
    reports: [
      {
        id: '0',
        creator: 'Sparky McSparkFace',
        name: 'My Saved Report',
        modified: '2020-09-02T13:00:00.000Z',
        current_user_can_edit: true,
      },
      {
        id: '1',
        creator: 'Not Me',
        name: 'Someone Elses Report',
        modified: '2020-10-02T13:00:00.000Z',
        current_user_can_edit: false,
      },
    ],
  };

  const subject = props => {
    render(
      <TestApp isHibanaEnabled={true}>
        <ChangeReportModal {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('renders modal correctly', () => {
    subject();
    const testFirstTab = texts => {
      texts.forEach(text => {
        expect(screen.getByText(text)).toBeVisible();
      });
    };
    const testSecondTab = texts => {
      texts.forEach(text => {
        expect(screen.getByText(text)).toBeVisible();
      });
    };

    expect(screen.getByText('My Reports')).toBeVisible();
    expect(screen.getByText('All Reports')).toBeVisible();
    testFirstTab(['Name', 'Last Modification', 'My Saved Report', /Sep [123] 2020/]);
    expect(screen.queryByText('Someone Elses Report')).not.toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(1);

    screen.getByText('All Reports').click();
    expect(screen.getAllByRole('radio')).toHaveLength(8); //2 saved reports + 6 preset reports;
    testSecondTab(['Name', 'Last Modification', /Sep [123] 2020/]);
    expect(screen.getByText('Created By')).toBeVisible();
    expect(screen.getByText('Sparky McSparkFace')).toBeVisible();

    expect(screen.getByRole('button', { name: 'Change Report' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('Shows the preset reports in the All Reports tab', () => {
    const testTabContent = textArray => {
      textArray.forEach(text => {
        expect(screen.getAllByText(text)).toHaveLength(2); //Value+Tooltip
      });
    };
    subject();
    expect(screen.queryByText('Summary Report')).not.toBeInTheDocument();
    screen.getByText('All Reports').click();
    testTabContent([
      'Summary Report',
      'Bounce Report',
      'Engagement Report',
      'Delayed Report',
      'Rejections Report',
      'Accepted Report',
    ]);
  });
});
