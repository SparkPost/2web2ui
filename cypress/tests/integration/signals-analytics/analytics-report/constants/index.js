export const STABLE_UNIX_DATE = 1581087062000; // Stable unix timestamp (2/6/2020)
export const PAGE_URL =
  '/signals/analytics?from=2020-06-22T19%3A00%3A00Z&to=2020-06-23T19%3A03%3A48Z&range=day&timezone=America%2FNew_York&precision=hour';

export const QUERY_FILTER = `[{"AND":{"templates":{"notLike":["template"]}}},{"AND":{"sending_domains":{"like":["thisisasendingdomain"]}}}]`;
export const FILTERS_URL = `${PAGE_URL}&query_filters=${QUERY_FILTER}`;

export const METRICS = [
  {
    name: 'Admin Bounce Rate',
    queryParam: 'admin_bounce_rate',
  },
  {
    name: 'Admin Bounces',
    queryParam: 'count_admin_bounce',
  },
  {
    name: 'Generation Failures',
    queryParam: 'count_generation_failed',
  },
  {
    name: 'Generation Rejections',
    queryParam: 'count_generation_rejection',
  },
  {
    name: 'Injected',
    queryParam: 'count_injected',
  },
  {
    name: 'Policy Rejections',
    queryParam: 'count_policy_rejection',
  },
  {
    name: 'Rejected',
    queryParam: 'count_rejected',
  },
  {
    name: 'Rejection Rate',
    queryParam: 'rejected_rate',
  },
  {
    name: 'Targeted',
    queryParam: 'count_targeted',
  },
  {
    name: 'Accepted',
    queryParam: 'count_accepted',
  },
  {
    name: 'Accepted Rate',
    queryParam: 'accepted_rate',
  },
  {
    name: 'Avg Delivery Message Size',
    queryParam: 'avg_msg_size',
  },
  {
    name: 'Avg Latency 1st Attempt',
    queryParam: 'avg_delivery_time_first',
  },
  {
    name: 'Avg Latency 2+ Attempts',
    queryParam: 'avg_delivery_time_subsequent',
  },
  {
    name: 'Block Bounce Rate',
    queryParam: 'block_bounce_rate',
  },
  {
    name: 'Block Bounces',
    queryParam: 'count_block_bounce',
  },
  {
    name: 'Bounce Rate',
    queryParam: 'bounce_rate',
  },
  {
    name: 'Bounces',
    queryParam: 'count_bounce',
  },
  {
    name: 'Delayed',
    queryParam: 'count_delayed',
  },
  {
    name: 'Delayed 1st Attempt',
    queryParam: 'count_delayed_first',
  },
  {
    name: 'Delayed Rate',
    queryParam: 'delayed_rate',
  },
  {
    name: 'Delivered 1st Attempt',
    queryParam: 'count_delivered_first',
  },
  {
    name: 'Delivered 2+ Attempts',
    queryParam: 'count_delivered_subsequent',
  },
  {
    name: 'Delivery Message Volume',
    queryParam: 'total_msg_volume',
  },
  {
    name: 'Hard Bounce Rate',
    queryParam: 'hard_bounce_rate',
  },
  {
    name: 'Hard Bounces',
    queryParam: 'count_hard_bounce',
  },
  {
    name: 'In-band Bounces',
    queryParam: 'count_inband_bounce',
  },
  {
    name: 'Out-of-band Bounces',
    queryParam: 'count_outofband_bounce',
  },
  {
    name: 'Sent',
    queryParam: 'count_sent',
  },
  {
    name: 'Soft Bounce Rate',
    queryParam: 'soft_bounce_rate',
  },
  {
    name: 'Soft Bounces',
    queryParam: 'count_soft_bounce',
  },
  {
    name: 'Undetermined Bounce Rate',
    queryParam: 'undetermined_bounce_rate',
  },
  {
    name: 'Undetermined Bounces',
    queryParam: 'count_undetermined_bounce',
  },
  {
    name: 'Click-through Rate',
    queryParam: 'click_through_rate_approx',
  },
  {
    name: 'Clicks',
    queryParam: 'count_clicked',
  },
  {
    name: 'Initial Opens',
    queryParam: 'count_initial_rendered',
  },
  {
    name: 'Open Rate',
    queryParam: 'open_rate_approx',
  },
  {
    name: 'Opens',
    queryParam: 'count_rendered',
  },
  {
    name: 'Spam Complaint Rate',
    queryParam: 'spam_complaint_rate',
  },
  {
    name: 'Spam Complaints',
    queryParam: 'count_spam_complaint',
  },
  {
    name: 'Unique Clicks',
    queryParam: 'count_unique_clicked_approx',
  },
  {
    name: 'Unique Confirmed Opens',
    queryParam: 'count_unique_confirmed_opened_approx',
  },
  {
    name: 'Unsubscribe Rate',
    queryParam: 'unsubscribe_rate',
  },
  {
    name: 'Unsubscribes',
    queryParam: 'count_unsubscribe',
  },
];

export const INBOX_METRICS = [
  { name: 'Inbox Folder Count' },
  { name: 'Spam Folder Count' },
  { name: 'Inbox Folder Rate' },
  { name: 'Spam Folder Rate' },
  { name: 'Moved to Inbox Count' },
  { name: 'Moved to Spam Count' },
  { name: 'Moved to Inbox Rate' },
  { name: 'Moved to Spam Rate' },
];

export const FILTER_OPTIONS = [
  {
    label: 'Recipient Domain',
    url: '/api/v1/metrics/domains**',
    requestAlias: 'getRecipientDomains',
    fixture: 'metrics/domains/200.get.json',
    search: 'hello.com',
  },
  {
    label: 'Sending IP',
    url: '/api/v1/metrics/sending-ips**',
    requestAlias: 'getSendingIpMetrics',
    fixture: 'metrics/sending-ips/200.get.json',
    search: 'my-sending-ip',
  },
  {
    label: 'IP Pool',
    url: '/api/v1/metrics/ip-pools**',
    requestAlias: 'getIpPoolMetrics',
    fixture: 'metrics/ip-pools/200.get.json',
    search: 'myPool',
  },
  {
    label: 'Campaign (ID)',
    url: '/api/v1/metrics/campaigns**',
    requestAlias: 'getCampaignMetrics',
    fixture: 'metrics/campaigns/200.get.json',
    search: 'test-campaign',
  },
  {
    label: 'Campaign (Subject Line)',
    url: '/api/v1/metrics/subject-campaigns**',
    requestAlias: 'getCampaignSubjectMetrics',
    fixture: 'metrics/subject-campaigns/200.get.json',
    search: 'subject-1',
  },
  {
    label: 'Template',
    url: '/api/v1/metrics/templates**',
    requestAlias: 'getTemplateMetrics',
    fixture: 'metrics/templates/200.get.json',
    search: 'fake-template-1',
  },
  {
    label: 'Sending Domain',
    url: '/api/v1/sending-domains',
    requestAlias: 'getSendingDomains',
    fixture: 'sending-domains/200.get.json',
    search: 'bounce.uat.sparkspam.com',
  },
  {
    label: 'Subaccount',
    url: '/api/v1/subaccounts',
    requestAlias: 'getSubaccounts',
    fixture: 'subaccounts/200.get.json',
    search: 'Fake Subaccount 3',
  },
];
