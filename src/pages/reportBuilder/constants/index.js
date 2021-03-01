import {
  getCampaigns,
  getDomains,
  getIpPools,
  getSendingIps,
  getSubjectCampaigns,
  getTemplates,
} from 'src/helpers/api/metrics';
import {
  selectCampaigns,
  selectIpPools,
  selectRecipientDomains,
  selectSendingDomains,
  selectSendingIps,
  selectSubaccounts,
  selectSubjectCampaigns,
  selectTemplates,
} from 'src/helpers/api/selectors/metrics';
import { getSendingDomains } from 'src/helpers/api/domains';
import { getSubaccounts } from 'src/helpers/api/subaccounts';

export const PRESET_REPORT_CONFIGS = [
  {
    key: 'summary',
    id: 'summary',
    name: 'Summary Report',
    query_string:
      'range=day&metrics=count_targeted&metrics=count_rendered&metrics=count_accepted&metrics=count_bounce',
    type: 'preset',
    creator: 'Default',
  },
  {
    key: 'bounce',
    id: 'bounce',
    name: 'Bounce Report',
    query_string:
      'range=day&metrics=count_targeted&metrics=count_sent&metrics=count_bounce&metrics=count_hard_bounce&metrics=count_soft_bounce&metrics=count_block_bounce&metrics=count_admin_bounce&metrics=count_undetermined_bounce&metrics=count_outofband_bounce&metrics=count_inband_bounce',
    type: 'preset',
    creator: 'Default',
  },
  {
    key: 'engagement',
    id: 'engagement',
    name: 'Engagement Report',
    query_string:
      'range=day&metrics=count_sent&metrics=count_accepted&metrics=count_clicked&metrics=count_rendered',
    type: 'preset',
    creator: 'Default',
  },
  {
    key: 'delayed',
    id: 'delayed',
    name: 'Delayed Report',
    query_string:
      'range=day&metrics=count_sent&metrics=count_accepted&metrics=count_delivered_first&metrics=count_delivered_subsequent&metrics=accepted_rate&metrics=count_delayed&metrics=delayed_rate',
    type: 'preset',
    creator: 'Default',
  },
  {
    key: 'rejections',
    id: 'rejections',
    name: 'Rejections Report',
    query_string: 'range=day&metrics=count_targeted&metrics=count_rejected&metrics=rejected_rate',
    type: 'preset',
    creator: 'Default',
  },
  {
    key: 'accepted',
    id: 'accepted',
    name: 'Accepted Report',
    query_string:
      'range=day&metrics=count_sent&metrics=count_accepted&metrics=accepted_rate&metrics=avg_delivery_time_first&metrics=avg_delivery_time_subsequent&metrics=avg_msg_size',
    type: 'preset',
    creator: 'Default',
  },
];

export const GROUP_BY_CONFIG = {
  domain: {
    label: 'Recipient Domain',
    keyName: 'domain',
    filterKey: 'domains',
  },
  'watched-domain': {
    label: 'Recipient Domain',
    keyName: 'watched_domain',
    filterKey: 'watched_domains',
  },
  'sending-domain': {
    label: 'Sending Domain',
    keyName: 'sending_domain',
    filterKey: 'sending_domains',
  },
  campaign: {
    label: 'Campaign (ID)',
    keyName: 'campaign_id',
    filterKey: 'campaigns',
  },
  'subject-campaign': {
    label: 'Campaign (Subject Line)',
    keyName: 'subject_campaign',
    filterKey: 'subject_campaigns',
  },
  template: {
    label: 'Template',
    keyName: 'template_id',
    filterKey: 'templates',
  },
  subaccount: {
    label: 'Subaccount',
    keyName: 'subaccount_id',
    filterKey: 'subaccounts',
  },
  'sending-ip': {
    label: 'Sending IP',
    keyName: 'sending_ip',
    filterKey: 'sending_ips',
  },
  'ip-pool': {
    label: 'IP Pool',
    keyName: 'ip_pool',
    filterKey: 'ip_pools',
  },
};

export const FILTER_OPTIONS = [
  {
    label: 'Recipient Domain',
    value: 'domains',
    action: getDomains,
    selector: selectRecipientDomains,
  },
  {
    label: 'Sending IP',
    value: 'sending_ips',
    action: getSendingIps,
    selector: selectSendingIps,
  },
  {
    label: 'IP Pool',
    value: 'ip_pools',
    action: getIpPools,
    selector: selectIpPools,
  },
  {
    label: 'Campaign (ID)',
    value: 'campaigns',
    action: getCampaigns,
    selector: selectCampaigns,
  },
  {
    label: 'Campaign (Subject Line)',
    value: 'subject_campaigns',
    action: getSubjectCampaigns,
    selector: selectSubjectCampaigns,
  },
  {
    label: 'Template',
    value: 'templates',
    action: getTemplates,
    selector: selectTemplates,
  },
  {
    label: 'Sending Domain',
    value: 'sending_domains',
    action: getSendingDomains,
    selector: selectSendingDomains,
  },
  {
    label: 'Subaccount',
    value: 'subaccounts',
    action: getSubaccounts,
    selector: selectSubaccounts,
  },
];

export const COMPARE_BY_OPTIONS = [
  {
    label: 'is equal to',
    value: 'eq',
  },
  {
    label: 'is not equal to',
    value: 'notEq',
  },
  {
    label: 'contains',
    value: 'like',
  },
  {
    label: 'does not contain',
    value: 'notLike',
  },
];

export const TAB_LOADING_HEIGHT = '300px';
