import { createSelector } from 'reselect';
import endsWith from 'lodash/endsWith';

export const getSeeds = state => state.inboxPlacement.seeds;

export const selectReferenceSeed = createSelector([getSeeds], seeds =>
  seeds.find(seed => endsWith(seed, 'seed.sparkpost.com')),
);
