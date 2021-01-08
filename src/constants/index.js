/* eslint-disable max-lines */
import { tokens } from '@sparkpost/design-tokens-hibana';

export const DEFAULT_REDIRECT_ROUTE = '/landing';
export const AFTER_JOIN_REDIRECT_ROUTE = '/onboarding/plan';
export const SIGN_UP_ROUTE = '/join';
export const AUTH_ROUTE = '/auth';
export const TFA_ROUTE = '/auth/tfa';
export const ENABLE_TFA_AUTH_ROUTE = '/auth/enable-tfa';
export const SSO_AUTH_ROUTE = '/auth/sso';
export const CREATE_SUBACCOUNT = '/account/subaccounts/create';
export const DASHBOARD_ROUTE = '/dashboard';
export const COOKIE_DOMAIN = '.sparkpost.com';

export const FORMATS = {
  DATE: 'MMM Do',
  LONG_DATE: 'MMM Do YYYY',
  SHORT_DATE: 'YYYY-MM-DD',

  TIME: 'h:mma',
  MILITARY_TIME: 'H:mm',
  ANTE_MILITARY_TIME: 'H:mma', // for 24 hour accidentally including am/pm (FE-61)

  DATETIME: 'MMM Do h:mma',
  LONG_DATETIME: 'MMM Do YYYY h:mma',
  LONG_DATETIME_ALT: 'MMM DD, YYYY [at] h:mma',

  INPUT_DATES: ['YYYY-MM-DD'],
  INPUT_TIMES: ['h:mma', 'H:mm', 'H:mma'],
  INPUT_DATETIMES: ['YYYY-MM-DD h:mma', 'YYYY-MM-DD H:mm', 'YYYY-MM-DD H:mma'],
};

export const RELATIVE_DATE_OPTIONS = ['hour', 'day', '7days', '10days', 'custom'];

export const LINKS = {
  SPC_EU_URL: 'https://app.eu.sparkpost.com',
  SPC_US_URL: 'https://app.sparkpost.com',
  SP_HOME_PAGE: 'https://www.sparkpost.com',
  API_DOCS: 'https://developers.sparkpost.com/api',
  DOCS: 'https://www.sparkpost.com/docs',
  PREMIUM_SUPPORT: 'https://www.sparkpost.com/contact-premium',
  ENTERPRISE_SUPPORT: 'https://www.sparkpost.com/contact-enterprise',
  RECIP_API: 'https://developers.sparkpost.com/api/recipient-lists.html',
  AB_TESTING_API: 'https://developers.sparkpost.com/api/ab-testing.html',
  SUBACCOUNTS: 'https://sparkpost.com/docs/user-guide/subaccounts/',
  SUBACCOUNTS_API: 'https://developers.sparkpost.com/api/subaccounts.html',
  TOU: 'https://www.sparkpost.com/policies/tou',
  SECURITY: 'https://www.sparkpost.com/policies/security/',
  DOMAIN_VERIFICATION:
    'https://www.sparkpost.com/docs/tech-resources/enabling-multiple-custom-tracking-domains',
  SENDING_REQS: 'https://www.sparkpost.com/docs/getting-started/requirements-for-sending-domains',
  SENDING_SETUP: 'https://www.sparkpost.com/docs/getting-started/setting-up-domains/',
  TRACKING_DOMAIN_DOCS:
    'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost/#tracking-domain',
  SENDING_DOMAIN_DOCS: 'https://www.sparkpost.com/docs/user-guide/managing-sending-domains/',
  BOUNCE_DOMAIN_DOCS:
    'https://www.sparkpost.com/docs/tech-resources/custom-bounce-domain/#using-the-sparkpost-ui',
  TFA_BACKUP_CODES: 'https://support.sparkpost.com/customer/portal/articles/1948449',
  IP_WARM_UP: 'https://support.sparkpost.com/customer/portal/articles/1972209-ip-warm-up-overview',
  DAILY_USAGE: 'https://www.sparkpost.com/docs/getting-started/what-counts-daily-monthly-usage',
  LEARN_MORE_TFA:
    'https://www.sparkpost.com/docs/my-account-and-profile/enabling-two-factor-authentication',
  ONBOARDING_SENDING:
    'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost/#preparing-your-from-address',
  ONBOARDING_SENDING_EMAIL:
    'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost/#sending-email',
  RECAPTCHA_LIB_URL: 'https://www.google.com/recaptcha/api.js',
  DAILY_MONTHLY_QUOTA_LIMIT_DOC: 'https://support.sparkpost.com/customer/portal/articles/2030894',
  GETTING_STARTED_GUIDE: 'https://www.sparkpost.com/docs/getting-started/getting-started-sparkpost',
  ADMIN_BOUNCE: 'https://support.sparkpost.com/', // TODO Add this to the bounce page
  SSO_GUIDE: 'https://www.sparkpost.com/docs/my-account-and-profile/sso',
  ALERTS_DOCS: 'https://developers.sparkpost.com/api/alerts/#alerts-post-create-an-alert',
  ALERTS_SURVEY: 'https://goo.gl/forms/rnIuTvdVF2xhpKCy2',
  SNIPPET_API_DOCS: 'https://developers.sparkpost.com/api/snippets/',
  MANDATORY_TFA:
    'https://www.sparkpost.com/docs/my-account-and-profile/enabling-two-factor-authentication/',
  RECIPIENT_VALIDATION_ACCESS: 'https://www.sparkpost.com/rv-access',
  AUTO_IP_WARMUP_SETUP: 'https://www.sparkpost.com/docs/user-guide/automated-ip-warmup/',
  MAILBOX_PROVIDERS: 'https://www.sparkpost.com/docs/user-guide/alerts/#mailbox-providers',
  STATUS: 'https://status.sparkpost.com/',
  AB_TESTING_DOCS: 'https://www.sparkpost.com/docs/tech-resources/a-b-testing-sparkpost/',
  TRANSMISSIONS_API:
    'https://developers.sparkpost.com/api/transmissions/#transmissions-post-send-an-a-b-test',
  RECIP_DOCS: 'https://developers.sparkpost.com/api/recipient-lists/',
  API_KEYS_GUIDE: 'https://www.sparkpost.com/docs/getting-started/create-api-keys/',
  SNIPPETS_DOCS: 'https://developers.sparkpost.com/api/template-language/#header-snippets',
  ANALYTICS_DOCS: 'https://www.sparkpost.com/docs/reporting/signals-analytics/#',
  METRICS_GROUPINGS_STRUCTURE_DOCS:
    'https://developers.sparkpost.com/api/metrics/#header-groupings-structure',
};

export const ENTERPRISE_PLAN_CODES = ['ent1'];

export const AWS_COOKIE_NAME = 'aws-mkt';

export const DAILY_LIMIT_REQUEST_TEMPLATE = 'daily-limit-increase';

export const SPC_EU_TENANT = 'spceu';
export const SPC_TENANT = 'spc';

export const CROSS_LINK_MAP = {
  [SPC_TENANT]: { label: '', url: LINKS.SPC_US_URL },
  [SPC_EU_TENANT]: { label: 'EU', url: LINKS.SPC_EU_URL },
};

export const TYPEAHEAD_LIMIT = 100;
export const METRICS_API_LIMIT = 1000;

export const FORMS = {
  LOGIN: 'loginForm',
  SSO: 'ssoLoginForm',
  JOIN: 'joinForm',
  JOIN_PLAN: 'joinPlanForm',
  JOIN_SENDING_DOMAIN: 'joinSendingDomainForm',
  INVITE_USER: 'userInviteForm',
  EDIT_USER: 'userEditForm',
  EVENTS_SEARCH: 'eventsSearchForm',
  RV_ADDPAYMENTFORM: 'rvAddPaymentForm',
  RV_ADDPAYMENTFORM_UPLOADLISTPAGE: 'rvAddPaymentFormUploadListPage',
};

//These filters are the searchable filters in the 'more filters' modal on the Events Search page
export const EVENTS_SEARCH_FILTERS = {
  recipient_domains: {
    placeholder: 'list of domain parts (e.g., gmail, yahoo.co, yahoo.co.jp, .fr)',
    label: 'Recipient Domains',
  },
  from_addresses: {
    placeholder: 'list of full from addresses (e.g., john@mycompany.com)',
    label: 'From Addresses',
  },
  sending_domains: {
    placeholder: 'list of domain parts (e.g., joespizza, marketing.joespizza)',
    label: 'Sending Domains',
  },
  subjects: {
    placeholder: 'list of full words (e.g. happy birthday, christmas)',
    label: 'Subjects',
  },
  bounce_classes: {
    placeholder: 'list of bounce classification codes (e.g. 10, 30)',
    label: 'Bounce Classes',
  },
  reasons: {
    placeholder: 'list of full words in raw reasons (e.g. 5.4.7, IP, Mail rejected)',
    label: 'Reasons',
  },
  campaigns: {
    placeholder: 'list of full words in campaign ids (e.g. newsletter, fire-sale)',
    label: 'Campaign IDs',
  },
  templates: {
    placeholder: 'list of full words in template ids (e.g. newsletter, fire-sale)',
    label: 'Template IDs',
  },
  sending_ips: { placeholder: 'list of ip addresses (e.g., 10.0.0.4.25)', label: 'Sending IPs' },
  ip_pools: {
    placeholder: 'list of full words in ip pool id (e.g billing, administrative)',
    label: 'IP Pools',
  },
  subaccounts: { placeholder: 'list of subaccount ids (e.g. 346, 823)', label: 'Subaccount IDs' },
  messages: {
    placeholder: 'list of message ids (e.g. 00129004225c33cc4c45)',
    label: 'Message IDs',
  },
  transmissions: {
    placeholder: 'list of transmission ids (e.g. 337221619334066426)',
    label: 'Transmissions IDs',
  },
  ab_tests: {
    placeholder: 'list of full words in ab test ids (e.g. newsletter, fire-sale)',
    label: 'AB Test IDs',
  },
  ab_test_versions: {
    placeholder: 'list of version numbers; requires AB Test ID filter(e.g. 4)',
    label: 'AB Test Versions',
  },
};

export const ALL_EVENTS_FILTERS = {
  recipients: { placeholder: 'Filter by recipient email address', label: 'Recipients' },
  events: { label: 'Event' },
  ...EVENTS_SEARCH_FILTERS,
};

export const DEFAULT_PER_PAGE_BUTTONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_RANGE = 5;
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_PER_PAGE = 10;

export const ANALYTICS_CREATE_ACCOUNT = 'create account';
export const ANALYTICS_ADDON_IP = 'dedicated_ips';
export const ANALYTICS_PREMIUM_SUPPORT = 'premium-support';
export const ANALYTICS_ENTERPRISE_SUPPORT = 'enterprise-support';
export const ANALYTICS_ONBOARDING = 'onboarding';
export const ANALYTICS_ONBOARDING_CREATE_DOMAIN = 'create-sending-domain-verify-';
export const ANALYTICS_FORMS = [
  FORMS.LOGIN,
  FORMS.JOIN,
  FORMS.JOIN_PLAN,
  FORMS.JOIN_SENDING_DOMAIN,
];

export const MAILBOX_PROVIDERS = {
  apple: 'Apple',
  gmail: 'Gmail',
  google_apps: 'Google Apps',
  microsoft: 'Microsoft',
  verizon_media: 'Verizon Media',
  yahoo_uk: 'Yahoo UK',
  us_broadband: 'US Broadband',
  uk_providers: 'UK Providers',
  italian_providers: 'Italian Providers',
  russian_providers: 'Russian Providers',
  french_providers: 'French Providers',
  chinese_providers: 'Chinese Providers',
  german_providers: 'German Providers',
  canadian_providers: 'Canadian Providers',
  japanese_providers: 'Japanese Providers',
  other_european_providers: 'Other European Providers',
  other: 'Other Providers',
};

export const PLAN_TIERS = {
  test: 'Test Account',
  starter: 'Starter',
  premier: 'Premier',
};
export const GUIDE_IDS = {
  SEND_TEST_EMAIL: '758d88cb-ed0d-4fe2-9c45-d74851ce9ed0',
  EXPLORE_ANALYTICS: '36bca470-b6fb-4b58-8053-06c30a8a44e1',
  CHECKOUT_EVENTS: '535b6562-8d0f-49fa-afe9-c96816634aed',
  VERIFY_SENDING_DOMAIN: '0937cdff-abfc-4395-a1d1-eb718f71dbc3',
  CANCEL_ACCOUNT: '86f7f5ed-54b6-476e-880b-ec6a671e2090',
  GIVE_HIBANA_FEEDBACK: 'e35ce0ad-f164-4c96-9323-f1021ac6f1be',
};

export const RECIPIENT_VALIDATION_TIERS = [
  { volumeMin: 0, volumeMax: 5000, cost: 0.01, displayedCost: '$0.010' },
  { volumeMin: 5000, volumeMax: 10000, cost: 0.008, displayedCost: '$0.008' },
  { volumeMin: 10000, volumeMax: 50000, cost: 0.006, displayedCost: '$0.006' },
  { volumeMin: 50000, volumeMax: 100000, cost: 0.004, displayedCost: '$0.004' },
  { volumeMin: 100000, volumeMax: 250000, cost: 0.003, displayedCost: '$0.003' },
  { volumeMin: 250000, volumeMax: 750000, cost: 0.0015, displayedCost: '$0.0015' },
  { volumeMin: 750000, volumeMax: 1000000, cost: 0.001, displayedCost: '$0.0010' },
  { volumeMin: 1000000, volumeMax: Infinity, cost: 0.00075, displayedCost: '$0.00075' },
];

export const HIBANA_METRICS_COLORS = [
  tokens.color_blue_700,
  tokens.color_teal_600,
  tokens.color_purple_800,
  tokens.color_magenta_600,
  tokens.color_blue_900,
  tokens.color_yellow_500,
  tokens.color_gray_700,
  tokens.color_purple_500,
  tokens.color_gray_1000,
];

export const REPORT_BUILDER_FILTER_KEY_MAP = {
  'Recipient Domain': 'domains',
  Campaign: 'campaigns',
  Template: 'templates',
  'Sending IP': 'sending_ips',
  'IP Pool': 'ip_pools',
  Subaccount: 'subaccounts',
  'Sending Domain': 'sending_domains',
};
export const UNLIMITED_PLAN_VOLUME = -1;

export { ROLES, SUBACCOUNT_ROLES, ROLE_LABELS } from './users';
