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
  },
  'watched-domain': {
    label: 'Recipient Domain',
    keyName: 'watched_domain',
  },
  'sending-domain': {
    label: 'Sending Domain',
    keyName: 'sending_domain',
  },
  campaign: {
    label: 'Campaign',
    keyName: 'campaign_id',
  },
  template: {
    label: 'Template',
    keyName: 'template_id',
  },
  subaccount: {
    label: 'Subaccount',
    keyName: 'subaccount_id',
  },
  'sending-ip': {
    label: 'Sending IP',
    keyName: 'sending_ip',
  },
  'ip-pool': {
    label: 'IP Pool',
    keyName: 'ip_pool',
  },
};

export const TAB_LOADING_HEIGHT = '300px';
