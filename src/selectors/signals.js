/* eslint-disable max-lines */
import { createSelector } from 'reselect';
import { fillByDate } from 'src/helpers/date';
import { roundToPlaces } from 'src/helpers/units';
import { getDoD } from 'src/helpers/signals';
import { selectSubaccountIdFromQuery } from 'src/selectors/subaccounts';
import { subaccountReportingIdSelector } from 'src/selectors/currentUser';
import { HEALTH_SCORE_COLORS_V3 } from 'src/pages/signals/constants/healthScoreThresholds';
import _ from 'lodash';
import moment from 'moment';

// Router props
export const getFacetFromParams = (state, props) => _.get(props, 'match.params.facet');
export const getFacetIdFromParamsRaw = (state, props) => _.get(props, 'match.params.facetId');
export const getSelectedDateFromRouter = (state, props) => _.get(props, 'location.state.date');
export const getOptions = (state, { now = moment().subtract(1, 'day'), ...options } = {}) => ({
  ...state.signalOptions,
  now,
  ...options,
});

// Redux store
export const getSpamHitsData = state => _.get(state, 'signals.spamHits', {});
export const getEngagementRecencyData = state => _.get(state, 'signals.engagementRecency', {});
export const getEngagementRateByCohortData = state =>
  _.get(state, 'signals.engagementRateByCohort', {});
export const getUnsubscribeRateByCohortData = state =>
  _.get(state, 'signals.unsubscribeRateByCohort', {});
export const getComplaintsByCohortData = state => _.get(state, 'signals.complaintsByCohort', {});
export const getHealthScoreData = state => _.get(state, 'signals.healthScore', {});
export const getCurrentHealthScoreData = state => _.get(state, 'signals.currentHealthScore', {});

export const getFacetIdFromParams = createSelector(
  [getFacetFromParams, getFacetIdFromParamsRaw],
  (facet, facetId) => (facet === 'mb_provider' ? decodeURIComponent(facetId) : facetId),
);

// Details
export const selectSpamHitsDetails = createSelector(
  [
    getSpamHitsData,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  ({ loading, error, data }, facet, facetId, subaccountId, { from, to }) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};
    const history = match.history || [];
    const normalizedHistory = history.map(({ dt: date, ...values }) => ({
      ...values,
      date,
      // note, this is an exception most other cases these relative metrics are provided by the API
      relative_trap_hits_parked: values.trap_hits_parked / values.injections,
      relative_trap_hits_recycled: values.trap_hits_recycled / values.injections,
      relative_trap_hits_typo: values.trap_hits_typo / values.injections,
    }));

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        injections: null,
        relative_trap_hits: null,
        trap_hits: null,
        relative_trap_hits_parked: null,
        trap_hits_parked: null,
        relative_trap_hits_recycled: null,
        trap_hits_recycled: null,
        relative_trap_hits_typo: null,
        trap_hits_typo: null,
      },
      from,
      to,
    });

    const isEmpty = filledHistory.every(values => values.trap_hits === null);

    return {
      details: {
        data: filledHistory,
        empty: isEmpty && !loading,
        error,
        loading,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

export const selectEngagementRecencyDetails = createSelector(
  [
    getEngagementRecencyData,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  ({ loading, error, data }, facet, facetId, subaccountId, { from, to }) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};

    const calculatePercentages = data =>
      data.map(({ c_total, dt, ...absolutes }) => {
        let values = {};

        for (const key in absolutes) {
          values = { ...values, [key]: absolutes[key] / c_total };
        }

        return { ...values, c_total, dt };
      });

    const history = calculatePercentages(match.history || []);
    const normalizedHistory = history.map(({ dt: date, ...values }) => ({ date, ...values }));

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        c_new: null,
        c_14d: null,
        c_90d: null,
        c_365d: null,
        c_uneng: null,
        c_total: null,
      },
      from,
      to,
    });

    const isEmpty = filledHistory.every(values => values.c_total === null);

    return {
      details: {
        data: filledHistory,
        empty: isEmpty && !loading,
        error,
        loading,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

// Engagement behavior charts do not contain data within the last 3 days (including today)
const excludeLastNDays = (date, n) =>
  moment().diff(date, 'days') < n ? moment().subtract(n, 'days') : date;

const engagementBehaviorDataLagDays = 3;

export const selectEngagementRateByCohortDetails = createSelector(
  [
    selectEngagementRecencyDetails,
    getEngagementRateByCohortData,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  (
    { details: { loading: loadingEngRecency, error: errorEngRecency, data: dataEngRecency } },
    { loading, error, data },
    facet,
    facetId,
    subaccountId,
    { from, to },
  ) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};

    // Rename date key
    const normalizedHistory = _.get(match, 'history', []).map(({ dt: date, ...values }) => ({
      date,
      ...values,
    }));

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        p_new_eng: null,
        p_14d_eng: null,
        p_90d_eng: null,
        p_365d_eng: null,
        p_uneng_eng: null,
        p_total_eng: null,
      },
      from,
      to: excludeLastNDays(to, engagementBehaviorDataLagDays),
    });

    const isEmpty = filledHistory.every(values => _.isNil(values.p_total_eng));

    return {
      details: {
        data: filledHistory,
        dataEngRecency,
        empty: isEmpty && !loading,
        error: error || errorEngRecency,
        loading: loading || loadingEngRecency,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

export const selectUnsubscribeRateByCohortDetails = createSelector(
  [
    selectEngagementRecencyDetails,
    getUnsubscribeRateByCohortData,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  (
    { details: { loading: loadingEngRecency, error: errorEngRecency, data: dataEngRecency } },
    { loading, error, data },
    facet,
    facetId,
    subaccountId,
    { from, to },
  ) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};

    // Rename date key
    const normalizedHistory = _.get(match, 'history', []).map(({ dt: date, ...values }) => ({
      date,
      ...values,
    }));

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        p_new_unsub: null,
        p_14d_unsub: null,
        p_90d_unsub: null,
        p_365d_unsub: null,
        p_uneng_unsub: null,
        p_total_unsub: null,
      },
      from,
      to: excludeLastNDays(to, engagementBehaviorDataLagDays),
    });

    const isEmpty = filledHistory.every(values => _.isNil(values.p_total_unsub));

    return {
      details: {
        data: filledHistory,
        dataEngRecency,
        empty: isEmpty && !loading,
        error: error || errorEngRecency,
        loading: loading || loadingEngRecency,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

export const selectComplaintsByCohortDetails = createSelector(
  [
    selectEngagementRecencyDetails,
    getComplaintsByCohortData,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  (
    { details: { loading: loadingEngRecency, error: errorEngRecency, data: dataEngRecency } },
    { loading, error, data },
    facet,
    facetId,
    subaccountId,
    { from, to },
  ) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};
    // Rename date key
    const normalizedHistory = _.get(match, 'history', []).map(({ dt: date, ...values }) => ({
      date,
      ...values,
    }));

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        p_new_fbl: null,
        p_14d_fbl: null,
        p_90d_fbl: null,
        p_365d_fbl: null,
        p_uneng_fbl: null,
        p_total_fbl: null,
      },
      from,
      to: excludeLastNDays(to, engagementBehaviorDataLagDays),
    });

    const isEmpty = filledHistory.every(values => _.isNil(values.p_total_fbl));

    return {
      details: {
        data: filledHistory,
        dataEngRecency,
        empty: isEmpty && !loading,
        error: error || errorEngRecency,
        loading: loading || loadingEngRecency,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

function rankHealthScore(value) {
  let rank = '';

  switch (true) {
    case value < 55:
      rank = 'danger';
      break;
    case value < 80:
      rank = 'warning';
      break;
    case value >= 80:
      rank = 'good';
      break;
    default:
      rank = '';
      break;
  }

  return rank;
}

export const selectHealthScoreDetails = createSelector(
  [
    getHealthScoreData,
    selectSpamHitsDetails,
    getFacetFromParams,
    getFacetIdFromParams,
    selectSubaccountIdFromQuery,
    getOptions,
  ],
  (
    { loading, error, data },
    { details: spamDetails },
    facet,
    facetId,
    subaccountId,
    { from, to },
  ) => {
    const match = data.find(item => String(item[facet]) === facetId) || {};

    const history = _.get(match, 'history', []);
    const normalizedHistory = history.map(
      ({ dt: date, weights, total_injection_count: injections, ...values }) => ({
        date,
        weights: _.sortBy(weights, ({ weight }) => parseFloat(weight)),
        injections,
        ...values,
      }),
    );

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        weights: [
          { weight_type: 'Hard Bounces', weight: null, weight_value: null },
          { weight_type: 'Complaints', weight: null, weight_value: null },
          { weight_type: 'Other bounces', weight: null, weight_value: null },
          { weight_type: 'Transient Failures', weight: null, weight_value: null },
          { weight_type: 'Block Bounces', weight: null, weight_value: null },
          { weight_type: 'List Quality', weight: null, weight_value: null },
          { weight_type: 'eng cohorts: new, 14-day', weight: null, weight_value: null },
          { weight_type: 'eng cohorts: unengaged', weight: null, weight_value: null },
        ],
        health_score: null,
        injections: null,
      },
      from,
      to,
    });

    // Merge in rankings
    const mergedHistory = filledHistory.map(healthData => ({
      ranking: rankHealthScore(roundToPlaces(healthData.health_score * 100, 1)),
      ...healthData,
    }));

    const isEmpty = mergedHistory.every(values => values.health_score === null);

    return {
      details: {
        data: mergedHistory,
        empty: isEmpty && !loading && !spamDetails.loading,
        error,
        loading: loading || spamDetails.loading,
      },
      facet,
      facetId,
      subaccountId,
    };
  },
);

export const selectHealthScoreDetailsV3 = createSelector(
  [selectHealthScoreDetails],
  ({ details, ...rest }) => {
    // Add fill colors
    const dataWithFill = details.data.map(healthData => ({
      fill: HEALTH_SCORE_COLORS_V3[healthData.ranking || 'danger'],
      ...healthData,
    }));

    return {
      details: {
        ...details,
        data: dataWithFill,
      },
      ...rest,
    };
  },
);

export const selectEngagementRecencyOverviewData = createSelector(
  getEngagementRecencyData,
  getOptions,
  ({ data }, { from, to }) =>
    data.map(({ WoW, ...rowOfData }) => {
      const history = rowOfData.history || [];
      const normalizedHistory = history.map(({ dt: date, ...values }) => {
        const relative_engaged_recipients = (values.c_14d / values.c_total) * 100;

        return {
          ...values,
          date,
          engaged_recipients: values.c_14d,
          relative_engaged_recipients,
        };
      });
      const filledHistory = fillByDate({
        dataSet: normalizedHistory,
        fill: {
          engaged_recipients: null,
          relative_engaged_recipients: null,
        },
        from,
        to,
      });

      return {
        ...rowOfData,
        current_engaged_recipients: _.last(filledHistory).engaged_recipients,
        current_relative_engaged_recipients: _.last(filledHistory).relative_engaged_recipients,
        history: filledHistory,
        WoW: _.isNil(WoW) ? null : roundToPlaces(WoW * 100, 0),
      };
    }),
);

export const selectEngagementRecencyOverviewMetaData = createSelector(
  getEngagementRecencyData,
  ({ data }) => {
    const absoluteValues = _.flatMap(data, ({ history }) => history.map(({ c_14d }) => c_14d));
    const relativeValues = _.flatMap(data, ({ history }) =>
      history.map(({ c_14d, c_total }) => (c_14d / c_total) * 100),
    );
    const currentValues = data.reduce((acc, { current_c_14d }) => {
      if (current_c_14d === null) {
        return acc; // ignore
      }

      return [...acc, current_c_14d];
    }, []);
    const currentRelativeValues = data.reduce((acc, { current_c_14d, current_c_total }) => {
      if (current_c_total === null) {
        return acc; // ignore
      }

      return [...acc, (current_c_14d / current_c_total) * 100];
    }, []);

    return {
      currentMax: currentValues.length ? Math.max(...currentValues) : null,
      currentRelativeMax: currentRelativeValues.length ? Math.max(...currentRelativeValues) : null,
      max: absoluteValues.length ? Math.max(...absoluteValues) : null,
      relativeMax: relativeValues.length ? Math.max(...relativeValues) : null,
    };
  },
);

export const selectEngagementRecencyOverview = createSelector(
  [
    getEngagementRecencyData,
    selectEngagementRecencyOverviewData,
    selectEngagementRecencyOverviewMetaData,
  ],
  (engagementRecencyData, data, metaData) => ({
    ...engagementRecencyData,
    data,
    metaData,
  }),
);

export const selectHealthScoreOverviewData = createSelector(
  getHealthScoreData,
  getOptions,
  ({ data }, { from, to }) =>
    data.map(({ WoW, ...rowOfData }) => {
      const history = rowOfData.history || [];
      const normalizedHistory = history.map(({ dt: date, health_score, ...values }) => {
        const roundedHealthScore = roundToPlaces(health_score * 100, 1);

        return {
          ...values,
          date,
          health_score: roundedHealthScore,
          ranking: rankHealthScore(roundedHealthScore),
        };
      });
      const filledHistory = fillByDate({
        dataSet: normalizedHistory,
        fill: {
          health_score: null,
          ranking: null,
        },
        from,
        to,
      });

      return {
        ...rowOfData,
        current_health_score: _.last(filledHistory).health_score,
        history: filledHistory,
        average_health_score: roundToPlaces(
          normalizedHistory.reduce((total, { health_score }) => total + health_score, 0) /
            normalizedHistory.length,
          1,
        ),
        WoW: _.isNil(WoW) ? null : roundToPlaces(WoW * 100, 0),
        current_DoD: getDoD(
          _.last(filledHistory).health_score,
          filledHistory[filledHistory.length - 2].health_score,
        ),
      };
    }),
);

export const selectCurrentHealthScoreDashboard = createSelector(
  [getCurrentHealthScoreData, subaccountReportingIdSelector, getOptions],
  ({ data, loading, error }, subaccountId, { from, to }) => {
    const accountData = _.find(data, ['sid', subaccountId]) || {};
    const history = accountData.history || [];

    const normalizedHistory = history.map(
      ({ dt: date, health_score, total_injection_count: injections, ...values }) => {
        const roundedHealthScore = roundToPlaces(health_score * 100, 1);
        return {
          ...values,
          date,
          health_score: roundedHealthScore,
          ranking: rankHealthScore(roundedHealthScore),
          injections,
        };
      },
    );

    const filledHistory = fillByDate({
      dataSet: normalizedHistory,
      fill: {
        health_score: null,
        ranking: null,
        injections: null,
      },
      from,
      to,
    });

    const latestHealthScore = _.get(_.last(filledHistory), 'health_score');

    return {
      ...accountData,
      loading,
      error,
      current_health_score: latestHealthScore,
      history: filledHistory,
      WoW: _.isNil(accountData.WoW) ? null : roundToPlaces(accountData.WoW * 100, 0),
      current_DoD: getDoD(
        latestHealthScore,
        _.get(filledHistory, `[${filledHistory.length - 2}].health_score`),
      ),
    };
  },
);

export const selectHealthScoreOverview = createSelector(
  [getHealthScoreData, selectHealthScoreOverviewData],
  (healthScoreData, data) => ({
    ...healthScoreData,
    data,
  }),
);

export const selectSpamHitsOverviewData = createSelector(
  getSpamHitsData,
  getOptions,
  ({ data }, { from, to }) =>
    data.map(({ WoW, ...rowOfData }) => {
      const history = rowOfData.history || [];
      const normalizedHistory = history.map(({ dt: date, relative_trap_hits, ...values }) => ({
        ...values,
        date,
        // Less than one tenth percent of hits to injections is good
        ranking: relative_trap_hits > 0.001 ? 'bad' : 'good',
        relative_trap_hits: relative_trap_hits * 100,
      }));
      const filledHistory = fillByDate({
        dataSet: normalizedHistory,
        fill: {
          injections: null,
          ranking: null,
          relative_trap_hits: null,
          trap_hits: null,
        },
        from,
        to,
      });

      return {
        ...rowOfData,
        current_relative_trap_hits: _.last(filledHistory).relative_trap_hits,
        history: filledHistory,
        total_injections: history.reduce((total, { injections }) => total + injections, 0),
        WoW: _.isNil(WoW) ? null : roundToPlaces(WoW * 100, 0),
      };
    }),
);

export const selectSpamHitsOverviewMetaData = createSelector(getSpamHitsData, ({ data }) => {
  const absoluteValues = _.flatMap(data, ({ history }) =>
    history.map(({ trap_hits }) => trap_hits),
  );
  const relativeValues = _.flatMap(data, ({ history }) =>
    history.map(({ relative_trap_hits }) => relative_trap_hits * 100),
  );
  const currentValues = data.reduce((acc, { current_trap_hits }) => {
    if (current_trap_hits === null) {
      return acc; // ignore
    }

    return [...acc, current_trap_hits];
  }, []);
  const currentRelativeValues = data.reduce((acc, { current_relative_trap_hits }) => {
    if (current_relative_trap_hits === null) {
      return acc; // ignore
    }

    return [...acc, current_relative_trap_hits * 100];
  }, []);

  return {
    currentMax: currentValues.length ? Math.max(...currentValues) : null,
    currentRelativeMax: currentRelativeValues.length ? Math.max(...currentRelativeValues) : null,
    max: absoluteValues.length ? Math.max(...absoluteValues) : null,
    relativeMax: relativeValues.length ? Math.max(...relativeValues) : null,
  };
});

export const selectSpamHitsOverview = createSelector(
  [getSpamHitsData, selectSpamHitsOverviewData, selectSpamHitsOverviewMetaData],
  (spamHitsData, data, metaData) => ({
    ...spamHitsData,
    data,
    metaData,
  }),
);
