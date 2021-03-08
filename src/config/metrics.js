import { rate, average } from '../helpers/metrics';
import { safeRate } from '../helpers/math';
const injection = 'Injection';
const delivery = 'Delivery';
const deliverability = 'Deliverability';
const engagement = 'Engagement';

export const categories = [injection, delivery, deliverability, engagement];

export const list = [
  {
    key: 'count_targeted',
    label: 'Targeted',
    type: 'total',
    category: injection,
    unit: 'number',
    description:
      'Number of emails requested or relayed to SparkPost. Includes Injected and Rejected.',
    inSummary: true,
  },
  {
    key: 'count_injected',
    label: 'Injected',
    type: 'total',
    category: injection,
    unit: 'number',
    description: 'Number of emails successfully generated or relayed through SparkPost.',
    inSummary: true,
  },
  {
    key: 'count_sent',
    label: 'Sent',
    type: 'total',
    category: delivery,
    unit: 'number',
    description:
      'Number of emails that were attempted to be delivered. Includes Deliveries and Bounces.',
    inSummary: true,
  },
  {
    //TODO: Remove once deliverability metrics are released
    key: 'count_accepted',
    label: 'Accepted',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: "Number of emails delivered that didn't subsequently bounce (Out-of-Band).",
    inSummary: true,
  },
  {
    key: 'count_delivered_first',
    label: 'Delivered 1st Attempt',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Number of emails delivered on the first attempt.',
    inSummary: true,
    tab: 'delayed',
  },
  {
    key: 'count_delivered_subsequent',
    label: 'Delivered 2+ Attempts',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Number of emails delivered that required more than one attempt.',
    inSummary: true,
    tab: 'delayed',
  },
  {
    key: 'count_spam_complaint',
    label: 'Spam Complaints',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Number of spam complaints received from mailbox providers.',
    notApplicableFor: ['nodes'],
    inSummary: true,
  },
  {
    key: 'spam_complaint_rate',
    label: 'Spam Complaint Rate',
    unit: 'percent',
    category: engagement,
    computeKeys: ['count_spam_complaint', 'count_accepted'],
    compute: rate,
    description: 'Percentage of Spam Complaints.',
    inSummary: true,
  },
  {
    key: 'count_rendered',
    label: 'Opens',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Total opens of a message.',
    inSummary: true,
  },
  {
    key: 'count_unique_rendered_approx',
    label: 'Unique Rendered',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Total number of messages that were rendered at least once.',
    inSummary: true,
    isUniquePerTimePeriod: true,
    deprecated: true,
  },
  {
    key: 'count_initial_rendered',
    label: 'Initial Opens',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Total initial opens of a message.',
    inSummary: true,
  },
  {
    key: 'count_unique_initial_rendered_approx',
    label: 'Initial Unique Rendered',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Total number of messages that were intially rendered at least once.',
    inSummary: true,
    isUniquePerTimePeriod: true,
    deprecated: true,
  },
  {
    key: 'count_unique_confirmed_opened_approx',
    label: 'Unique Confirmed Opens',
    type: 'total',
    category: engagement,
    unit: 'number',
    description:
      'Number of emails that were displayed or had at a link clicked. Approximated with a 5% error threshold.',
    inSummary: true,
    isUniquePerTimePeriod: true,
  },
  {
    key: 'count_clicked',
    label: 'Clicks',
    type: 'total',
    category: engagement,
    unit: 'number',
    description: 'Number of times that links were clicked across all emails.',
    inSummary: true,
    tab: 'links',
  },
  {
    key: 'count_unique_clicked_approx',
    label: 'Unique Clicks',
    type: 'total',
    category: engagement,
    unit: 'number',
    description:
      'Number of emails that had at least one link clicked. Approximated with a 5% error threshold.',
    inSummary: true,
    isUniquePerTimePeriod: true,
    tab: 'links',
  },
  {
    key: 'count_bounce',
    label: 'Bounces',
    type: 'total',
    category: delivery,
    unit: 'number',
    description:
      'Number of bounced emails, not including Admin Bounces. Includes all In-Band and Out-of-Band Bounces.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_hard_bounce',
    label: 'Hard Bounces',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Number of emails that bounced due to permanent delivery issues.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_soft_bounce',
    label: 'Soft Bounces',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Number of emails that bounced due to temporary delivery issues.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_block_bounce',
    label: 'Block Bounces',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Total number of Bounced messages due to an IP block.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_admin_bounce',
    label: 'Admin Bounces',
    type: 'total',
    category: injection,
    unit: 'number',
    description: 'Number of emails that were bounced by SparkPost. Not counted in Bounces.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_undetermined_bounce',
    label: 'Undetermined Bounces',
    type: 'total',
    category: delivery,
    unit: 'number',
    description: 'Number of emails that bounced due to undetermined reasons.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'count_rejected',
    label: 'Rejected',
    type: 'total',
    category: injection,
    unit: 'number',
    description:
      'Number of emails that were rejected by SparkPost. Includes Policy Rejections, Generation Rejections, Generation Faliures.',
    inSummary: true,
    tab: 'rejection',
  },
  {
    key: 'count_policy_rejection',
    label: 'Policy Rejections',
    type: 'total',
    category: injection,
    unit: 'number',
    description: 'Number of emails that were rejected by SparkPost due to policy reasons.',
    inSummary: true,
    tab: 'rejection',
  },
  {
    key: 'count_generation_failed',
    label: 'Generation Failures',
    type: 'total',
    category: injection,
    unit: 'number',
    description: 'Number of emails that failed generation due to technical reasons.',
    inSummary: true,
    tab: 'rejection',
  },
  {
    key: 'count_unsubscribe',
    label: 'Unsubscribes',
    type: 'total',
    category: engagement,
    unit: 'number',
    description:
      'Number of times a recipient clicked a tagged unsubscribe link or used the list unsubscribe header.',
    inSummary: true,
  },
  {
    key: 'count_generation_rejection',
    label: 'Generation Rejections',
    type: 'total',
    category: injection,
    unit: 'number',
    description: 'Number of emails that failed generation due to policy reasons.',
    inSummary: true,
    tab: 'rejection',
  },
  {
    //TODO: Remove once deliverability metrics are released
    key: 'accepted_rate',
    label: 'Accepted Rate',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_accepted', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent messages that were accepted.',
    inSummary: true,
  },
  {
    key: 'open_rate_approx',
    label: 'Open Rate',
    type: 'percentage',
    category: engagement,
    unit: 'percent',
    computeKeys: ['count_unique_confirmed_opened_approx', 'count_accepted'],
    compute: rate,
    description:
      'Approximate Percentage of Accepted emails that were either rendered or had at least one link selected.',
    inSummary: true,
  },
  {
    key: 'click_through_rate_approx',
    label: 'Click-through Rate',
    category: engagement,
    unit: 'percent',
    computeKeys: ['count_unique_clicked_approx', 'count_accepted'],
    compute: rate,
    description: 'Approximate percentage of Accepted emails that had at least one link selected.',
    inSummary: true,
    tab: 'links',
  },
  {
    key: 'bounce_rate',
    label: 'Bounce Rate',
    type: 'percentage',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_bounce', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent messages that Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'hard_bounce_rate',
    label: 'Hard Bounce Rate',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_hard_bounce', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent emails that Hard Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'soft_bounce_rate',
    label: 'Soft Bounce Rate',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_soft_bounce', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent emails that Soft Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'block_bounce_rate',
    label: 'Block Bounce Rate',
    type: 'percentage',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_block_bounce', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent messages that Block Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'admin_bounce_rate',
    label: 'Admin Bounce Rate',
    category: injection,
    unit: 'percent',
    computeKeys: ['count_admin_bounce', 'count_targeted'],
    compute: rate,
    description: 'Percentage of Targeted messages that Admin Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'undetermined_bounce_rate',
    label: 'Undetermined Bounce Rate',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_undetermined_bounce', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent emails that Undertermined Bounced.',
    inSummary: true,
    tab: 'bounce',
  },
  {
    key: 'unsubscribe_rate',
    label: 'Unsubscribe Rate',
    category: engagement,
    unit: 'percent',
    computeKeys: ['count_unsubscribe', 'count_accepted'],
    compute: rate,
    description: 'Percentage of Accepted emails that resulted in unsubscribes.',
    inSummary: true,
  },
  {
    key: 'count_delayed',
    label: 'Delayed',
    category: delivery,
    type: 'total',
    unit: 'number',
    description:
      "Number of emails that were temporarily rejected by a recipient's mailbox provider.",
    inSummary: true,
    tab: 'delayed',
  },
  {
    key: 'delayed_rate',
    label: 'Delayed Rate',
    category: delivery,
    unit: 'percent',
    computeKeys: ['count_delayed', 'count_accepted'],
    compute: rate,
    description: 'Percentage of Accepted emails that were delayed on the first delivery attempt.',
    inReportBuilder: true,
    tab: 'delayed',
  },
  {
    key: 'rejected_rate',
    label: 'Rejection Rate',
    category: injection,
    unit: 'percent',
    computeKeys: ['count_rejected', 'count_sent'],
    compute: rate,
    description: 'Percentage of Targeted emails that were rejected.',
    inReportBuilder: true,
    tab: 'rejection',
  },
  {
    key: 'count_delayed_first',
    label: 'Delayed 1st Attempt',
    category: delivery,
    type: 'total',
    unit: 'number',
    description: 'Number of emails that were delayed on 1st delivery attempt.',
    inSummary: true,
  },
  {
    key: 'avg_delivery_time_first',
    label: 'Avg Latency 1st Attempt',
    category: delivery,
    unit: 'milliseconds',
    computeKeys: ['total_delivery_time_first', 'count_delivered_first'],
    compute: average,
    description:
      'Average delivery time in milliseconds (latency) for emails delivered on the first attempt.',
    inSummary: true,
  },
  {
    key: 'avg_delivery_time_subsequent',
    label: 'Avg Latency 2+ Attempts',
    category: delivery,
    unit: 'milliseconds',
    computeKeys: ['total_delivery_time_subsequent', 'count_delivered_subsequent'],
    compute: average,
    description:
      'Average delivery time in milliseconds (latency) for emails delivered that required more than one attempt.',
    inSummary: true,
  },
  {
    key: 'avg_msg_size',
    label: 'Avg Delivery Message Size',
    category: delivery,
    unit: 'bytes',
    computeKeys: ['total_msg_volume', 'count_delivered'],
    compute: average,
    description: 'Average size of delivered emails, including attachments, in bytes.',
    inSummary: true,
  },
  {
    key: 'total_msg_volume',
    label: 'Delivery Message Volume',
    category: delivery,
    type: 'total',
    unit: 'bytes',
    description: 'Total size of delivered emails including attachments, in bytes.',
    inSummary: true,
  },
  /* below are metrics that never show in the summary report, but are needed when making API calls from the Metrics service */
  {
    key: 'count_inband_bounce',
    label: 'In-band Bounces',
    type: 'total',
    unit: 'number',
    description: 'Number of emails that bounced on delivery attempt.',
    category: delivery,
    inReportBuilder: true,
    tab: 'bounce',
  },
  {
    key: 'count_outofband_bounce',
    label: 'Out-of-band Bounces',
    type: 'total',
    unit: 'number',
    description: 'Number of emails that bounced subsequent to a successful delivery.',
    category: delivery,
    inReportBuilder: true,
    tab: 'bounce',
  },
  {
    key: 'count_raw_clicked_approx',
    type: 'total',
    unit: 'number',
    description: 'Total number of messages which had at least one link selected one or more times.',
  },
  {
    key: 'count_accepted',
    label: 'Accepted',
    type: 'total',
    category: deliverability,
    unit: 'number',
    description: "Number of emails delivered that didn't subsequently bounce (Out-of-Band).",
    inSummary: true,
  },
  {
    key: 'accepted_rate',
    label: 'Accepted Rate',
    category: deliverability,
    unit: 'percent',
    computeKeys: ['count_accepted', 'count_sent'],
    compute: rate,
    description: 'Percentage of Sent messages that were accepted.',
    inSummary: true,
  },
  {
    key: 'count_inbox',
    label: 'Inbox Folder Count',
    type: 'total',
    unit: 'number',
    category: deliverability,
    compute: ({ count_inbox_panel, count_inbox_seed }) => count_inbox_panel + count_inbox_seed,
    computeKeys: ['count_inbox_panel', 'count_inbox_seed'],
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'count_spam',
    label: 'Spam Folder Count',
    type: 'total',
    unit: 'number',
    compute: ({ count_spam_panel, count_spam_seed }) => count_spam_panel + count_spam_seed,
    computeKeys: ['count_spam_panel', 'count_spam_seed'],
    category: deliverability,
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'inbox_folder_rate',
    label: 'Inbox Folder Rate',
    unit: 'percent',
    type: 'percentage',
    category: deliverability,
    compute: ({ count_inbox_panel, count_inbox_seed, count_spam_panel, count_spam_seed }) => {
      return safeRate(
        count_inbox_panel + count_inbox_seed,
        count_inbox_panel + count_inbox_seed + count_spam_panel + count_spam_seed,
      );
    },
    computeKeys: ['count_inbox_panel', 'count_inbox_seed', 'count_spam_panel', 'count_spam_seed'],
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'spam_folder_rate',
    label: 'Spam Folder Rate',
    unit: 'percent',
    type: 'percentage',
    category: deliverability,
    compute: ({ count_inbox_panel, count_inbox_seed, count_spam_panel, count_spam_seed }) => {
      return safeRate(
        count_spam_panel + count_spam_seed,
        count_inbox_panel + count_inbox_seed + count_spam_panel + count_spam_seed,
      );
    },
    computeKeys: ['count_inbox_panel', 'count_inbox_seed', 'count_spam_panel', 'count_spam_seed'],
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'count_moved_to_inbox',
    label: 'Moved to Inbox Count',
    type: 'total',
    unit: 'number',
    category: deliverability,
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'count_moved_to_spam',
    label: 'Moved to Spam Count',
    type: 'total',
    unit: 'number',
    category: deliverability,
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'moved_to_inbox_rate',
    label: 'Moved to Inbox Rate',
    unit: 'percent',
    type: 'percentage',
    category: deliverability,
    compute: ({ count_moved_to_inbox, count_spam_panel, count_spam_seed }) => {
      return safeRate(count_moved_to_inbox, count_spam_panel + count_spam_seed);
    },
    computeKeys: ['count_moved_to_inbox', 'count_spam_panel', 'count_spam_seed'],
    inReportBuilder: true,
    product: 'deliverability',
  },
  {
    key: 'moved_to_spam_rate',
    label: 'Moved to Spam Rate',
    unit: 'percent',
    type: 'percentage',
    category: deliverability,
    compute: ({ count_moved_to_spam, count_inbox_panel, count_inbox_seed }) => {
      return safeRate(count_moved_to_spam, count_inbox_panel + count_inbox_seed);
    },
    computeKeys: ['count_moved_to_spam', 'count_inbox_panel', 'count_inbox_seed'],
    inReportBuilder: true,
    product: 'deliverability',
  },
];

export const bounceTabMetrics = list.filter(({ tab }) => tab && tab === 'bounce');
export const rejectionTabMetrics = list.filter(({ tab }) => tab && tab === 'rejection');
export const delayTabMetrics = list.filter(({ tab }) => tab && tab === 'delayed');
export const linksTabMetrics = list.filter(({ tab }) => tab && tab === 'links');

export const DELIVERABILITY_BOUNCE_METRIC_KEYS = [
  'count_sent',
  'count_bounce',
  'count_inband_bounce',
  'count_outofband_bounce',
  'count_admin_bounce',
  'count_targeted',
];

export const DELIVERABILITY_DELAY_METRIC_KEYS = [
  'count_accepted',
  'count_delayed',
  'count_delayed_first',
];

export const DELIVERABILITY_REJECTION_METRIC_KEYS = ['count_rejected', 'count_targeted'];

export const DELIVERABILITY_LINKS_METRIC_KEYS = [
  'count_accepted',
  'count_clicked',
  'count_sent',
  'count_unique_clicked_approx',
  'count_unique_confirmed_opened_approx',
];

export const LINKS_BY_DOMAIN_METRIC_KEYS = ['count_clicked', 'count_raw_clicked_approx'];

export const REJECTIONS_BY_DOMAIN_METRIC_KEYS = ['count_clicked', 'count_raw_clicked_approx'];

export const BOUNCE_BY_DOMAIN_METRIC_KEYS = ['count_bounce'];

export const map = list.reduce(
  (accumulator, metric) => ({
    ...accumulator,
    [metric.key]: metric,
  }),
  {},
);

const selectableMetrics = list.filter(
  metric => (metric.inSummary || metric.inReportBuilder) && metric.category && !metric.deprecated,
);

const categoriesObj = categories.reduce((accumulator, current) => {
  accumulator[current] = [];
  return accumulator;
}, {});

const categorizedMetrics = selectableMetrics.reduce((accumulator, current) => {
  accumulator[current.category].push(current);
  return accumulator;
}, categoriesObj);

export const categorizedMetricsList = categories.map(category => {
  return {
    category,
    metrics: categorizedMetrics[category].sort((a, b) => a.label.localeCompare(b.label)),
  }; //Sorts each metric alphabetically by label
});

export const INDUSTRY_BENCHMARK_METRICS_MAP = {
  inbox_folder_rate: {
    label: 'Inbox Folder Rate Industry Benchmark',
    helpText:
      'When on, inbox folder rate benchmark data for industry and mailbox provider selected below will display on graph.',
  },
};
