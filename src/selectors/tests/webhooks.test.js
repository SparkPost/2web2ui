import {
  selectWebhookBatches,
  selectInitialSubaccountValue,
  getSelectedEvents,
  selectWebhooks,
} from '../webhooks';

describe('Webhooks selectors', () => {
  const state = {
    webhooks: {
      batches: [
        {
          response_code: 100,
          ts: '2018-01-24 00:00:00.000',
          other: 'field',
        },
        {
          response_code: 201,
          ts: '2018-01-21 00:00:00.000',
          key: 'value',
        },
      ],
    },
    subaccounts: {
      list: [
        { name: 'sub 1', id: 101 },
        { name: 'sub 2', id: 501 },
      ],
    },
  };

  test('selectWebhookBatches should add formatted_time and status to batches store', () => {
    expect(selectWebhookBatches(state)).toMatchSnapshot();
  });

  test('selectWebhooks should have webhooks with subaccount_name if subaccount_id present', () => {
    expect(selectWebhooks(state)).toMatchSnapshot();
  });

  describe('selectInitialSubaccountValue', () => {
    const subaccounts = [
      { name: 'sub 1', id: 101 },
      { name: 'sub 2', id: 501 },
    ];

    it('should get initial subaccount object', () => {
      const location = { search: '?subaccount=501' };
      const result = selectInitialSubaccountValue(
        { ...state, subaccounts: { list: subaccounts } },
        { location },
      );
      expect(result).toMatchSnapshot();
    });

    it('should overwrite primary-only webhooks', () => {
      const location = { search: '?subaccount=0' };
      const result = selectInitialSubaccountValue(
        { ...state, subaccounts: { list: subaccounts } },
        { location },
      );
      expect(result).toEqual('Primary account only');
    });

    it('should overwrite primary-and-all-subaccount webhooks', () => {
      const location = { search: null };
      const result = selectInitialSubaccountValue(
        { ...state, subaccounts: { list: subaccounts } },
        { location },
      );
      expect(result).toEqual('Primary and all subaccounts');
    });
  });

  test('getSelectedEvents should convert the events array to a hash', () => {
    expect(
      getSelectedEvents({
        webhooks: { webhook: { events: ['one', 'two', 'five'] } },
      }),
    ).toEqual({
      one: true,
      two: true,
      five: true,
    });
  });
});
