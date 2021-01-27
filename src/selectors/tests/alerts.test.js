import * as alertsSelectors from '../alerts';
import cases from 'jest-in-case';

describe('Alerts Selectors: ', () => {
  let alerts;
  let formattedAlerts;

  beforeEach(() => {
    const list = [
      {
        id: 'id-1',
        muted: true,
        name: 'my alert 1',
        metric: 'monthly_sending_limit',
        last_triggered: null,
      },
      {
        id: 'id-2',
        muted: false,
        name: 'my alert 2',
        metric: 'monthly_sending_limit',
        last_triggered: '2019-06-05T14:48:00.000Z',
      },
      {
        id: 'id-3',
        muted: true,
        name: 'my alert 3',
        metric: 'health_score',
        last_triggered: '2019-06-15T14:48:00.000Z',
      },
    ];

    formattedAlerts = [
      {
        ...list[0],
        last_triggered_formatted: null,
        last_triggered_timestamp: 0,
      },
      {
        ...list[1],
        last_triggered_formatted: 'Jun 5 2019, 10:48am',
        last_triggered_timestamp: 1559746080000,
      },
      {
        ...list[2],
        last_triggered_formatted: 'Jun 15 2019, 10:48am',
        last_triggered_timestamp: 1560610080000,
      },
    ];

    alerts = { list };
  });

  it('selectAlertsList returns formatted alerts data', () => {
    expect(alertsSelectors.selectAlertsList({ alerts })).toEqual(formattedAlerts);
  });

  it('selectRecentlyTriggeredAlerts returns triggered alerts in order descending ', () => {
    expect(alertsSelectors.selectRecentlyTriggeredAlerts({ alerts })).toEqual([formattedAlerts[1]]);
  });

  describe('getInitialValues', () => {
    const formData = {
      name: 'foo',
      metric: 'health_score',
      subaccounts: [-1],
      sending_ip: [],
      mailbox_provider: [],
      sending_domain: [],
      single_filter: { filter_type: 'none', filter_values: [] },
      emails: 'sparky@sparkpost.com, test@foo.com',
      slack: '',
      webhook: '',
      source: 'raw',
      operator: 'lt',
      value: 80,
      muted: false,
    };

    const apiData = {
      name: 'foo',
      metric: 'health_score',
      subaccounts: [-1],
      filters: [],
      channels: { emails: ['sparky@sparkpost.com', 'test@foo.com'] },
      threshold_evaluator: {
        source: 'raw',
        operator: 'lt',
        value: 80,
      },
      muted: false,
    };

    const testCases = {
      'primary and all subaccounts': {
        formData: { ...formData },
        apiData: { ...apiData },
      },
      'any subaccount': {
        formData: { ...formData, subaccounts: [-2] },
        apiData: { ...apiData, subaccounts: undefined, any_subaccount: true },
      },
      'select subaccounts': {
        formData: { ...formData, subaccounts: [0, 1] },
        apiData: { ...apiData, subaccounts: [0, 1] },
      },
      'single filter': {
        formData: {
          ...formData,
          single_filter: { filter_type: 'mailbox_provider', filter_values: ['a'] },
        },
        apiData: {
          ...apiData,
          filters: [{ filter_type: 'mailbox_provider', filter_values: ['a'] }],
        },
      },
      'single filter with no facet selected': {
        formData: { ...formData, single_filter: { filter_type: 'none', filter_values: [] } },
        apiData: { ...apiData },
      },
      'only sending Ip': {
        formData: { ...formData, metric: 'block_bounce_rate', sending_ip: ['a', 'b'] },
        apiData: {
          ...apiData,
          metric: 'block_bounce_rate',
          filters: [{ filter_type: 'sending_ip', filter_values: ['a', 'b'] }],
        },
      },
      'sending Ip, mailbox provider, and sending domain': {
        formData: {
          ...formData,
          metric: 'block_bounce_rate',
          sending_ip: ['a'],
          mailbox_provider: ['b'],
          sending_domain: ['c'],
        },
        apiData: {
          ...apiData,
          metric: 'block_bounce_rate',
          filters: [
            { filter_type: 'sending_ip', filter_values: ['a'] },
            { filter_type: 'mailbox_provider', filter_values: ['b'] },
            { filter_type: 'sending_domain', filter_values: ['c'] },
          ],
        },
      },
      'with slack and webhook channels': {
        formData: { ...formData, slack: 'target1', webhook: 'target2' },
        apiData: {
          ...apiData,
          channels: {
            emails: ['sparky@sparkpost.com', 'test@foo.com'],
            slack: { target: 'target1' },
            webhook: { target: 'target2' },
          },
        },
      },
      'with blocklists and filters': {
        apiData: {
          ...apiData,
          metric: 'blocklist',
          filters: [
            { filter_type: 'blocklist_resource', filter_values: ['any'] },
            { filter_type: 'blocklist_provider', filter_values: ['a', 'b', 'c'] },
          ],
        },
        formData: {
          ...formData,
          metric: 'blocklist',
          blocklist_resource: [],
          blocklist_provider: ['a', 'b', 'c'],
        },
      },
    };

    cases(
      'should correctly transform the data for',
      ({ formData, apiData }) => {
        expect(
          alertsSelectors.selectAlertFormValues(
            { alerts: { alert: apiData } },
            { isDuplicate: false },
          ),
        ).toEqual(formData);
      },
      testCases,
    );

    it('append (Duplicate) for duplicate alerts', () => {
      const inputAlert = { ...apiData, name: 'OG alert' };
      const expected = { ...formData, name: 'OG alert Copy' };
      expect(
        alertsSelectors.selectAlertFormValues(
          { alerts: { alert: inputAlert } },
          { isDuplicate: true },
        ),
      ).toEqual(expected);
    });
  });

  it('returns feature flagged metrics', () => {
    const state = {
      account: {
        options: {
          blocklist_monitors: true,
          ui: {
            allow_injection_alerts: true,
          },
        },
      },
    };

    expect(alertsSelectors.selectFeatureFlaggedAlerts(state)).toEqual({
      blocklist: true,
      injection_count: true,
    });
  });
});
