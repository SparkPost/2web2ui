import { createSelector } from 'reselect';
import _ from 'lodash';

function reshape(list, type) {
  return list.map(value => ({ type, value }));
}

const selectSubaccounts = ({ subaccounts }) => subaccounts.list;
const selectSendingDomains = ({ sendingDomains }) => sendingDomains.list;
const selectRecipientDomains = ({ metrics }) => metrics.domains;
const selectCampaigns = ({ metrics }) => metrics.campaigns;
const selectSendingIps = ({ metrics }) => metrics.sendingIps;
const selectIpPools = ({ metrics }) => metrics.ipPools;
const selectTemplates = ({ metrics }) => metrics.templates;

const selectPreparedTemplates = createSelector([selectTemplates], templates =>
  reshape(templates, 'Template'),
);

const selectPreparedSubaccounts = createSelector([selectSubaccounts], subaccounts =>
  subaccounts.map(({ name, id }) => ({
    type: 'Subaccount',
    value: `${name} (ID ${id})`,
    id,
  })),
);

const selectPreparedSendingDomains = createSelector([selectSendingDomains], domains =>
  domains.map(d => ({ type: 'Sending Domain', value: d.domain })),
);

const selectPreparedRecipientDomains = createSelector([selectRecipientDomains], domains =>
  reshape(domains, 'Recipient Domain'),
);

const selectPreparedCampaigns = createSelector([selectCampaigns], campaigns =>
  reshape(campaigns, 'Campaign'),
);

const selectPreparedSendingIps = createSelector([selectSendingIps], ips =>
  reshape(ips, 'Sending IP'),
);

const selectPreparedIpPools = createSelector([selectIpPools], pools => reshape(pools, 'IP Pool'));

const selectCache = createSelector(
  [
    selectPreparedTemplates,
    selectPreparedSubaccounts,
    selectPreparedSendingDomains,
    selectPreparedRecipientDomains,
    selectPreparedCampaigns,
    selectPreparedSendingIps,
    selectPreparedIpPools,
  ],
  (...caches) => _.flatten(caches),
);

export const selectCacheReportBuilder = createSelector(
  [
    selectPreparedTemplates,
    selectPreparedSubaccounts,
    selectPreparedSendingDomains,
    selectPreparedRecipientDomains,
    selectPreparedCampaigns,
    selectPreparedSendingIps,
    selectPreparedIpPools,
  ],
  (templates, subaccounts, sendingDomains, recipientDomains, campaigns, sendingIps, IpPools) => ({
    'Recipient Domain': recipientDomains,
    Subaccount: subaccounts,
    Campaign: campaigns,
    Template: templates,
    'Sending Domain': sendingDomains,
    'IP Pool': IpPools,
    'Sending IP': sendingIps,
  }),
);

export default selectCache;
