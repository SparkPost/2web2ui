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
