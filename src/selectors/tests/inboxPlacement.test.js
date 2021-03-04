import {
  selectReferenceSeed,
  selectTestDetailsPageError,
  selectTestDetailsPageLoading,
  selectSinglePlacementResult,
  selectTrends,
} from '../inboxPlacement';
import moment from 'moment';

describe('Selectors: Inbox Placement', () => {
  describe('selectReferenceSeed', () => {
    let state;
    beforeEach(() => {
      state = {
        inboxPlacement: {
          seeds: ['foo@bar.com', 'abc@xyz.com', 'refSeed@seed.sparkpost.com'],
        },
      };
    });

    it('returns first reference seed', () => {
      expect(selectReferenceSeed(state)).toEqual('refSeed@seed.sparkpost.com');
    });

    it('returns first undefined if no reference seed found', () => {
      state.inboxPlacement.seeds.pop();
      expect(selectReferenceSeed(state)).toBe(undefined);
    });
  });

  describe('selectTestDetailsPageError', () => {
    let state;
    beforeEach(() => {
      state = {
        inboxPlacement: {
          getTestError: false,
          getByProviderError: false,
          getByRegionError: false,
          getTestContentError: false,
        },
      };
    });

    it('returns false when there are no errors', () => {
      expect(selectTestDetailsPageError(state)).toBe(false);
    });

    it('returns true when there is one error', () => {
      state.inboxPlacement.getTestError = true;
      expect(selectTestDetailsPageError(state)).toBe(true);
    });

    it('returns true when there is more than one error', () => {
      state.inboxPlacement.getTestError = true;
      state.inboxPlacement.getByProviderError = true;
      state.inboxPlacement.getByRegionError = true;
      state.inboxPlacement.getTestContentError = true;
      expect(selectTestDetailsPageError(state)).toBe(true);
    });
  });

  describe('selectTestDetailsPageLoading', () => {
    let state;
    beforeEach(() => {
      state = {
        inboxPlacement: {
          getTestPending: false,
          getByProviderPending: false,
          getByRegionPending: false,
          getTestContentPending: false,
        },
      };
    });

    it('returns false when there is nothing pending', () => {
      expect(selectTestDetailsPageLoading(state)).toBe(false);
    });

    it('returns true when there is one item pending', () => {
      state.inboxPlacement.getTestPending = true;
      expect(selectTestDetailsPageLoading(state)).toBe(true);
    });

    it('returns true when there is more than one item pending', () => {
      state.inboxPlacement.getTestPending = true;
      state.inboxPlacement.getByProviderPending = true;
      state.inboxPlacement.getByRegionPending = true;
      state.inboxPlacement.getTestContentPending = true;
      expect(selectTestDetailsPageLoading(state)).toBe(true);
    });
  });

  describe('selectSinglePlacementResult', () => {
    let state;
    beforeEach(() => {
      state = {
        inboxPlacement: {
          placementsByProvider: [{ id: 0, mailbox_provider: 'gmail', region: 'north america' }],
          placementsByRegion: [{ id: 0, region: 'europe' }],
          placementsBySendingIp: [{ id: 0, sending_ip: '101.101' }],
        },
      };
    });

    it('returns mailbox provider', () => {
      const props = { match: { params: { filterType: 'mailbox-provider', filterName: 'gmail' } } };
      expect(selectSinglePlacementResult(state, props)).toEqual(
        state.inboxPlacement.placementsByProvider[0],
      );
    });

    it('returns region', () => {
      const props = { match: { params: { filterType: 'region', filterName: 'europe' } } };
      expect(selectSinglePlacementResult(state, props)).toEqual(
        state.inboxPlacement.placementsByRegion[0],
      );
    });

    it('returns sending ip', () => {
      const props = { match: { params: { filterType: 'sending-ip', filterName: '101.101' } } };
      expect(selectSinglePlacementResult(state, props)).toEqual(
        state.inboxPlacement.placementsBySendingIp[0],
      );
    });
  });

  describe('selectTrends', () => {
    const date = moment(new Date('2019-11-11T12:00:00Z'));
    Date.now = jest.fn(() => date);

    it('returns empty array if there is no trends data', () => {
      const state = {
        inboxPlacement: {
          trends: [],
        },
      };
      expect(selectTrends(state)).toEqual([]);
    });

    it('returns trends array filled out with missing dates', () => {
      const state = {
        inboxPlacement: {
          trends: [
            {
              date: '2019-11-11',
              folders: {
                inbox_pct: 0.8,
                spam_pct: 0.25,
                missing_pct: 0.05,
              },
              total_messages: 10,
            },
          ],
        },
      };
      const props = {
        filters: { dateRange: { from: '2019-10-12', to: '2019-11-12' } },
      };
      const expectedNormalized = {
        date: '2019-11-11',
        inbox: 0.8,
        spam: 0.25,
        missing: 0.05,
        totalMessages: 10,
      };
      const expectedFill = {
        date: '2019-10-12',
        inbox: null,
        spam: null,
        missing: null,
        totalMessages: null,
      };
      const result = selectTrends(state, props);
      expect(result).toHaveLength(31);
      expect(result[30]).toEqual(expectedNormalized);
      expect(result[0]).toEqual(expectedFill);
    });
  });
});
