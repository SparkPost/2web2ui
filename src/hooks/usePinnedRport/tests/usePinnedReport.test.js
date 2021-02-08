import React from 'react';
import { render } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import usePinnedReport from '../usePinnedReport';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(() => jest.fn()),
}));

describe('usePinnedReport', () => {
  const MockComponent = ({ onboarding, reports }) => {
    const { pinnedReport } = usePinnedReport(onboarding, reports);
    const { from, to, ...rest } = pinnedReport.options;
    return (
      <>
        {pinnedReport.name}
        {JSON.stringify(rest)}
        {pinnedReport.linkToReportBuilder}
      </>
    );
  };

  test('sets pinnedReport object to default summary report when no matching report is found', () => {
    useSelector.mockImplementation(selector =>
      selector({
        reports: { list: [] },
        subaccounts: [],
        currentUser: { options: { ui: { pinned_report_id: 'fake-id' } } },
      }),
    );
    const { container } = render(<MockComponent />);
    expect(container).toMatchSnapshot();
  });
  test('sets pinnedReport object to pinned report when a matching report is found', () => {
    useSelector.mockImplementation(selector =>
      selector({
        reports: {
          list: [
            {
              query_string:
                'from=2020-09-18T15%3A00%3A00Z&to=2020-09-25T15%3A08%3A36Z&range=7days&timezone=America%2FNew_York&precision=hour&filters=Campaign%3ABlack%20Friday&metrics=count_targeted&metrics=count_injected&metrics=count_sent&metrics=count_accepted&metrics=count_unique_confirmed_opened_approx&metrics=count_bounce&report=fake-id',
              creator: 'appteam',
              created: '2020-09-22T19:55:34.215Z',
              subaccount_id: 0,
              description: 'to be deleted',
              id: 'fake-id',
              is_editable: false,
              name: 'My new report',
              modified: '2020-10-08T19:39:53.830Z',
              current_user_can_edit: true,
            },
          ],
        },
        subaccounts: {
          list: [],
        },
        currentUser: { options: { ui: { pinned_report_id: 'fake-id' } } },
      }),
    );
    const { container } = render(<MockComponent />);
    expect(container).toMatchSnapshot();
  });

  test('sets pinnedReport link to reportbuilder only contains one report object', () => {
    useSelector.mockImplementation(selector =>
      selector({
        reports: {
          list: [
            {
              query_string:
                'from=2020-09-18T15%3A00%3A00Z&to=2020-09-25T15%3A08%3A36Z&range=7days&timezone=America%2FNew_York&precision=hour&filters=Campaign%3ABlack%20Friday&metrics=count_targeted&metrics=count_injected&metrics=count_sent&metrics=count_accepted&metrics=count_unique_confirmed_opened_approx&metrics=count_bounce',
              creator: 'appteam',
              created: '2020-09-22T19:55:34.215Z',
              subaccount_id: 0,
              description: 'to be deleted',
              id: 'fake-id',
              is_editable: false,
              name: 'My new report',
              modified: '2020-10-08T19:39:53.830Z',
              current_user_can_edit: true,
            },
          ],
        },
        subaccounts: {
          list: [],
        },
        currentUser: { options: { ui: { pinned_report_id: 'fake-id' } } },
      }),
    );
    const { container } = render(<MockComponent />);
    expect(container).toMatchSnapshot();
  });

  test('does not call get Reports if reports list is passed as a prop', () => {
    const reports = [
      {
        query_string:
          'from=2020-09-18T15%3A00%3A00Z&to=2020-09-25T15%3A08%3A36Z&range=7days&timezone=America%2FNew_York&precision=hour&filters=Campaign%3ABlack%20Friday&metrics=count_targeted&metrics=count_injected&metrics=count_sent&metrics=count_accepted&metrics=count_unique_confirmed_opened_approx&metrics=count_bounce',
        creator: 'appteam',
        created: '2020-09-22T19:55:34.215Z',
        subaccount_id: 0,
        description: 'to be deleted',
        id: 'fake-id',
        is_editable: false,
        name: 'My new report',
        modified: '2020-10-08T19:39:53.830Z',
        current_user_can_edit: true,
      },
    ];
    const mockDispatch = jest.fn();
    useDispatch.mockImplementation(() => mockDispatch);
    useSelector.mockImplementation(selector =>
      selector({
        reports: {
          list: [],
        },
        subaccounts: {
          list: [],
        },
        currentUser: { options: { ui: { pinned_report_id: 'fake-id' } } },
      }),
    );
    expect(mockDispatch).not.toHaveBeenCalled();
    const { container } = render(<MockComponent onboarding="done" reports={reports} />);
    expect(container).toHaveTextContent(
      'from=2020-09-18T15%3A00%3A00Z&to=2020-09-25T15%3A08%3A36Z&range=7days&timezone=America%2FNew_York&precision=hour&filters=Campaign%3ABlack%20Friday&metrics=count_targeted&metrics=count_injected&metrics=count_sent&metrics=count_accepted&metrics=count_unique_confirmed_opened_approx&metrics=count_bounce',
    );
  });
});
