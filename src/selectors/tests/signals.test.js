import moment from 'moment';
import * as selectors from '../signals';

describe('Selectors: signals', () => {
  let state;
  const props = {
    match: {
      params: {
        facet: 'sending_domain',
        facetId: 'test.com',
      },
    },
    location: {
      state: {
        date: '2018-02-01',
      },
      search: '?subaccount=101',
    },
    now: moment('2018-01-03'),
  };

  beforeEach(() => {
    state = {
      signalOptions: {
        to: '2018-01-04',
        from: '2017-12-27',
      },
      signals: {
        spamHits: {
          totalCount: 2,
          data: [
            {
              sending_domain: 'test.com',
              current_trap_hits: 35,
              current_relative_trap_hits: 0.001,
              WoW: 0,
              history: [
                {
                  dt: '2018-01-01',
                  injections: 182400,
                  relative_trap_hits: 0.0025, // bad
                  trap_hits: 456,
                  trap_hits_parked: 300,
                  trap_hits_recycled: 100,
                  trap_hits_typo: 56,
                },
                {
                  dt: '2018-01-03',
                  injections: 35000,
                  relative_trap_hits: 0.001, // good
                  trap_hits: 35,
                  trap_hits_parked: 20,
                  trap_hits_recycled: 15,
                  trap_hits_typo: 0,
                },
              ],
            },
            {
              sending_domain: 'null.test.com',
              current_trap_hits: null,
              current_relative_trap_hits: null,
              WoW: null,
              history: [
                {
                  dt: '2018-01-01',
                  injections: 282400,
                  relative_trap_hits: 0.003, // bad
                  trap_hits: 856,
                  trap_hits_parked: 56,
                  trap_hits_recycled: 600,
                  trap_hits_typo: 200,
                },
                {
                  dt: '2018-01-02',
                  injections: 50000,
                  relative_trap_hits: 0.001, // good
                  trap_hits: 50,
                  trap_hits_parked: 30,
                  trap_hits_recycled: 15,
                  trap_hits_typo: 5,
                },
              ],
            },
          ],
          loading: false,
          error: null,
        },
        engagementRecency: {
          totalCount: 1,
          data: [
            {
              sending_domain: 'test.com',
              current_c_14d: 10,
              current_c_total: 50,
              WoW: 0.1,
              history: [
                {
                  c_total: 25,
                  c_new: 5,
                  c_uneng: 5,
                  c_14d: 5,
                  c_365d: 5,
                  dt: '2018-01-01',
                },
                {
                  c_total: 50,
                  c_new: 10,
                  c_uneng: 10,
                  c_14d: 10,
                  c_365d: 10,
                  dt: '2018-01-03',
                },
              ],
            },
          ],
          loading: false,
          error: null,
        },
        engagementRateByCohort: {
          totalCount: 1,
          data: [
            {
              sending_domain: 'test.com',
              history: [
                {
                  p_total_eng: 25,
                  p_new_eng: 5,
                  p_uneng_eng: 5,
                  p_14d_eng: 5,
                  p_365d_eng: 5,
                  dt: '2018-01-01',
                },
                {
                  p_total_eng: 50,
                  p_new_eng: 10,
                  p_uneng_eng: 10,
                  p_14d_eng: 10,
                  p_365d_eng: 10,
                  dt: '2018-01-03',
                },
              ],
            },
          ],
          loading: false,
          error: null,
        },
        unsubscribeRateByCohort: {
          totalCount: 1,
          data: [
            {
              sending_domain: 'test.com',
              history: [
                {
                  p_total_unsub: 25,
                  p_new_unsub: 5,
                  p_uneng_unsub: 5,
                  p_14d_unsub: 5,
                  p_365d_unsub: 5,
                  dt: '2018-01-01',
                },
                {
                  p_total_unsub: 50,
                  p_new_unsub: 10,
                  p_uneng_unsub: 10,
                  p_14d_unsub: 10,
                  p_365d_unsub: 10,
                  dt: '2018-01-03',
                },
              ],
            },
          ],
          loading: false,
          error: null,
        },
        complaintsByCohort: {
          totalCount: 1,
          data: [
            {
              sending_domain: 'test.com',
              history: [
                {
                  p_total_fbl: 0.25,
                  p_new_fbl: 0.5,
                  p_uneng_fbl: 0.5,
                  p_14d_fbl: 0.5,
                  p_365d_fbl: 0.5,
                  dt: '2018-01-01',
                },
                {
                  p_total_fbl: 0.5,
                  p_new_fbl: 0.1,
                  p_uneng_fbl: 0.1,
                  p_14d_fbl: 0.1,
                  p_365d_fbl: 0.1,
                  dt: '2018-01-03',
                },
              ],
            },
          ],
          loading: false,
          error: null,
        },
        healthScore: {
          totalCount: 1,
          data: [
            {
              current_weights: [],
              current_health_score: 0.98,
              sending_domain: 'test.com',
              WoW: -0.07,
              history: [
                {
                  dt: '2018-01-01',
                  health_score: 0.74321, // bad
                  total_injection_count: 182400,
                  weights: [
                    {
                      weight_type: 'eng cohorts: new, 14-day',
                      weight: 0.5,
                      weight_value: 0.5,
                    },
                    {
                      weight_type: 'Transient Failures',
                      weight: 0.7,
                      weight_value: 0.5,
                    },
                    {
                      weight_type: 'Other bounces',
                      weight: -0.1,
                      weight_value: 0.5,
                    },
                  ],
                },
                {
                  dt: '2018-01-02',
                  health_score: 0.8,
                  weights: [],
                  total_injection_count: 12345,
                },
                {
                  dt: '2018-01-03',
                  health_score: 0.98, // good
                  weights: [],
                  total_injection_count: 35000,
                },
              ],
            },
          ],
        },
        currentHealthScore: {
          totalCount: 1,
          data: [
            {
              sid: -1,
              current_weights: [],
              current_health_score: 0.98,
              sending_domain: 'test.com',
              WoW: -0.07,
              history: [
                {
                  dt: '2018-01-01',
                  health_score: 0.74321, // bad
                  total_injection_count: 100,
                  weights: [],
                },
                {
                  dt: '2018-01-02',
                  health_score: 0.8,
                  total_injection_count: 100,
                  weights: [],
                },
                {
                  dt: '2018-01-03',
                  health_score: 0.98, // good
                  weights: [],
                  total_injection_count: 100,
                },
              ],
            },
            {
              sid: 101,
              current_weights: [],
              current_health_score: 0.8,
              sending_domain: 'test.com',
              WoW: -0.07,
              history: [
                {
                  dt: '2018-01-01',
                  health_score: 0.74321, // bad
                  total_injection_count: 100,
                  weights: [],
                },
                {
                  dt: '2018-01-02',
                  health_score: 0.8,
                  total_injection_count: 100,
                  weights: [],
                },
                {
                  dt: '2018-01-03',
                  health_score: 0.8,
                  weights: [],
                  total_injection_count: 100,
                },
              ],
            },
          ],
        },
      },
    };
  });

  describe('facet value', () => {
    it('should decode facet url for mailbox provider', () => {
      const newProps = {
        ...props,
        match: {
          params: {
            facet: 'mb_provider',
            facetId: 'Potato%2FPotato',
          },
        },
      };
      expect(selectors.getFacetIdFromParams(state, newProps)).toEqual('Potato/Potato');
    });
  });

  describe('spam hits details', () => {
    it('should select spam hits details', () => {
      expect(selectors.selectSpamHitsDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = { ...state, signals: { spamHits: { data: [], loading: false } } };
      expect(selectors.selectSpamHitsDetails(stateWhenEmpty, props)).toMatchSnapshot();
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = { ...state, signals: { spamHits: { data: [], loading: true } } };
      expect(selectors.selectSpamHitsDetails(stateWhenLoading, props).details.empty).toBe(false);
    });
  });

  describe('engagement recency details', () => {
    it('should select details', () => {
      expect(selectors.selectEngagementRecencyDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: { engagementRecency: { data: [], loading: false } },
      };
      expect(selectors.selectEngagementRecencyDetails(stateWhenEmpty, props)).toMatchSnapshot();
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: { engagementRecency: { data: [], loading: true } },
      };
      expect(selectors.selectEngagementRecencyDetails(stateWhenLoading, props).details.empty).toBe(
        false,
      );
    });
  });

  describe('engagement rate by cohort details', () => {
    it('should select details', () => {
      expect(selectors.selectEngagementRateByCohortDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: {
          engagementRateByCohort: { data: [], loading: false },
          engagementRecency: { data: [], loading: false },
        },
      };
      expect(
        selectors.selectEngagementRateByCohortDetails(stateWhenEmpty, props).details.empty,
      ).toBe(true);
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: {
          engagementRateByCohort: { data: [], loading: true },
          engagementRecency: { data: [], loading: true },
        },
      };
      expect(
        selectors.selectEngagementRateByCohortDetails(stateWhenLoading, props).details.empty,
      ).toBe(false);
    });

    it('should cutoff to date if to is within 3 days of today', () => {
      const mockNow = new Date('2018-01-05');
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
      const data = selectors.selectEngagementRateByCohortDetails(state, props).details.data;
      expect(data[data.length - 1].date).toEqual('2018-01-01');
    });
  });

  describe('unsubscribe rate by cohort details', () => {
    it('should select details', () => {
      expect(selectors.selectUnsubscribeRateByCohortDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: {
          unsubscribeRateByCohort: { data: [], loading: false },
          engagementRecency: { data: [], loading: false },
        },
      };
      expect(
        selectors.selectUnsubscribeRateByCohortDetails(stateWhenEmpty, props).details.empty,
      ).toBe(true);
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: {
          unsubscribeRateByCohort: { data: [], loading: true },
          engagementRecency: { data: [], loading: true },
        },
      };
      expect(
        selectors.selectUnsubscribeRateByCohortDetails(stateWhenLoading, props).details.empty,
      ).toBe(false);
    });

    it('should cutoff to date if to is within 3 days of today', () => {
      const mockNow = new Date('2018-01-05');
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
      const data = selectors.selectUnsubscribeRateByCohortDetails(state, props).details.data;
      expect(data[data.length - 1].date).toEqual('2018-01-01');
    });
  });

  describe('complaints by cohort details', () => {
    it('should select details', () => {
      expect(selectors.selectComplaintsByCohortDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: {
          complaintsByCohort: { data: [], loading: false },
          engagementRecency: { data: [], loading: false },
        },
      };
      expect(selectors.selectComplaintsByCohortDetails(stateWhenEmpty, props).details.empty).toBe(
        true,
      );
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: {
          complaintsByCohort: { data: [], loading: true },
          engagementRecency: { data: [], loading: true },
        },
      };
      expect(selectors.selectComplaintsByCohortDetails(stateWhenLoading, props).details.empty).toBe(
        false,
      );
    });

    it('should cutoff to date if to is within 3 days of today', () => {
      const mockNow = new Date('2018-01-05');
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
      const data = selectors.selectComplaintsByCohortDetails(state, props).details.data;
      expect(data[data.length - 1].date).toEqual('2018-01-01');
    });
  });

  describe('health score details', () => {
    it('should select details', () => {
      expect(selectors.selectHealthScoreDetails(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: { healthScore: { data: [], loading: false }, spamHits: { data: [] } },
      };
      expect(selectors.selectHealthScoreDetails(stateWhenEmpty, props)).toMatchSnapshot();
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: { healthScore: { data: [], loading: true }, spamHits: { data: [] } },
      };
      expect(selectors.selectHealthScoreDetails(stateWhenLoading, props).details.empty).toBe(false);
    });
  });

  describe('health score detailsV3', () => {
    it('should select details', () => {
      expect(selectors.selectHealthScoreDetailsV3(state, props)).toMatchSnapshot();
    });

    it('should be empty with only fill data when not loading', () => {
      const stateWhenEmpty = {
        ...state,
        signals: { healthScore: { data: [], loading: false }, spamHits: { data: [] } },
      };
      expect(selectors.selectHealthScoreDetailsV3(stateWhenEmpty, props)).toMatchSnapshot();
    });

    it('should not be empty when loading', () => {
      const stateWhenLoading = {
        ...state,
        signals: { healthScore: { data: [], loading: true }, spamHits: { data: [] } },
      };
      expect(selectors.selectHealthScoreDetailsV3(stateWhenLoading, props).details.empty).toBe(
        false,
      );
    });
  });

  describe('selected date', () => {
    it('should select date from react router', () => {
      expect(selectors.getSelectedDateFromRouter(state, props)).toMatchSnapshot();
    });
  });

  describe('selectEngagementRecencyOverviewData', () => {
    it('returns data', () => {
      expect(selectors.selectEngagementRecencyOverviewData(state, props)).toMatchSnapshot();
    });

    it('returns empty array', () => {
      const stateWhenEmpty = { ...state, signals: { engagementRecency: { data: [] } } };
      expect(selectors.selectEngagementRecencyOverviewData(stateWhenEmpty, props)).toEqual([]);
    });
  });

  describe('selectEngagementRecencyOverviewMetaData', () => {
    it('returns max values', () => {
      expect(selectors.selectEngagementRecencyOverviewMetaData(state, props)).toEqual({
        currentMax: 10,
        currentRelativeMax: 20,
        max: 10,
        relativeMax: 20,
      });
    });

    it('returns null', () => {
      const stateWhenEmpty = { signals: { engagementRecency: { data: [] } } };
      expect(selectors.selectEngagementRecencyOverviewMetaData(stateWhenEmpty, props)).toEqual({
        currentMax: null,
        currentRelativeMax: null,
        max: null,
        relativeMax: null,
      });
    });
  });

  describe('selectEngagementRecencyOverview', () => {
    it('returns all overview data', () => {
      expect(selectors.selectEngagementRecencyOverview(state, props)).toMatchSnapshot();
    });
  });

  describe('selectSpamHitsOverviewData', () => {
    it('returns data', () => {
      expect(selectors.selectSpamHitsOverviewData(state, props)).toMatchSnapshot();
    });

    it('returns empty array', () => {
      const stateWhenEmpty = { ...state, signals: { spamHits: { data: [] } } };
      expect(selectors.selectSpamHitsOverviewData(stateWhenEmpty, props)).toEqual([]);
    });
  });

  describe('selectSpamHitsOverviewMetaData', () => {
    it('returns max values', () => {
      expect(selectors.selectSpamHitsOverviewMetaData(state, props)).toEqual({
        currentMax: 35,
        currentRelativeMax: 0.1,
        max: 856,
        relativeMax: 0.3,
      });
    });

    it('returns null', () => {
      const stateWhenEmpty = { ...state, signals: { spamHits: { data: [] } } };
      expect(selectors.selectSpamHitsOverviewMetaData(stateWhenEmpty, props)).toEqual({
        currentMax: null,
        currentRelativeMax: null,
        max: null,
        relativeMax: null,
      });
    });
  });

  describe('selectSpamHitsOverview', () => {
    it('returns all overview data', () => {
      expect(selectors.selectSpamHitsOverview(state, props)).toMatchSnapshot();
    });
  });

  describe('selectHealthScoreOverviewData', () => {
    it('returns data', () => {
      expect(selectors.selectHealthScoreOverviewData(state, props)).toMatchSnapshot();
    });

    it('returns empty array', () => {
      const stateWhenEmpty = { ...state, signals: { healthScore: { data: [] } } };
      expect(selectors.selectHealthScoreOverviewData(stateWhenEmpty, props)).toEqual([]);
    });
  });

  describe('selectHealthScoreOverview', () => {
    it('returns all overview data', () => {
      expect(selectors.selectHealthScoreOverview(state, props)).toMatchSnapshot();
    });
  });

  describe('selectCurrentHealthScoreDashboard', () => {
    it('returns data', () => {
      expect(selectors.selectCurrentHealthScoreDashboard(state, props)).toMatchSnapshot();
    });

    it('returns data for subaccount reporting users', () => {
      const stateWithSubReportingUser = {
        ...state,
        currentUser: { access_level: 'subaccount_reporting', subaccount_id: 101 },
      };
      expect(selectors.selectCurrentHealthScoreDashboard(stateWithSubReportingUser, props)).toEqual(
        expect.objectContaining({ sid: 101, current_health_score: 80 }),
      );
    });
  });
});
