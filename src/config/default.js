const tenantIdFromHostname = hostname => hostname.split('.')[0];

const config = identifier => ({
  apiBase: `https://${identifier}.api.e.sparkpost.com/api`,
  apiDateFormat: "yyyy-MM-dd'T'HH:mm",
  apiRequestTimeout: 60000,
  apiRequestHeaders: {
    'X-Sparky': '1d24c3473dd52a2f4a53fb6808cf9a73',
  },
  apiRequestBodyMaxSizeBytes: 500 * 1000, // ~ 500 KB
  authentication: {
    app: {
      // this is our first-party cookie
      // see, https://web.dev/samesite-cookies-explained/
      cookie: {
        name: 'auth',
        options: {
          // do not set domain it should inherit from current host
          path: '/',
          sameSite: 'strict',
          secure: true,
        },
      },
      authHeader: 'Basic bXN5c1dlYlVJOmZhODZkNzJlLTYyODctNDUxMy1hZTdmLWVjOGM4ZmEwZDc2Ng==',
    },
    site: {
      // this is our third-party cookie used by other web properties
      cookie: {
        name: 'website_auth',
        options: {
          domain: '.sparkpost.com',
          path: '/',
          sameSite: 'strict',
          secure: true,
        },
      },
      authHeader: 'Basic bXN5c1VJTGltaXRlZDphZjE0OTdkYS02NjI5LTQ3NTEtODljZS01ZDBmODE4N2MyMDQ=',
    },
  },
  cardTypes: [
    { paymentFormat: 'visa', apiFormat: 'Visa' },
    { paymentFormat: 'mastercard', apiFormat: 'MasterCard' },
    { paymentFormat: 'amex', apiFormat: 'AmericanExpress' },
    { paymentFormat: 'discover', apiFormat: 'Discover' },
  ],
  chartColors: ['#04AEF9', '#fa6423', '#FFD300', '#8CCA3A', '#b94696'],
  cookieConsent: {
    cookie: {
      name: 'cookieConsent',
      ageDays: 365,
      options: {
        domain: 'sparkpost.com',
        path: '/',
      },
    },
  },
  featureFlags: {
    allow_default_signing_domains_for_ip_pools: true,
    allow_mailbox_verification: true,
    allow_anyone_at_verification: false,
    has_signup: false,
  },
  heroku: {
    cookieName: 'heroku-nav-data',
  },
  maxUploadSizeBytes: 20000000,
  maxRecipVerifUploadSizeBytes: 20971520, // NGNIX configures max upload size in megabytes, translating to this value in bytes
  metricsPrecisionMap: [
    { time: 60 * 8, value: '1min', format: 'ha' },
    { time: 60 * 24 * 10, value: 'hour', format: 'ha' },
    { time: 60 * 24 * 33, value: 'day', format: 'MMM Do' },
    { time: 60 * 24 * 190, value: 'week', format: 'MMM Do' },
    { time: Infinity, value: 'month', format: 'MMM YY' },
  ],
  metricsRollupPrecisionMap: [
    {
      recommended: 60 * 8,
      min: 0,
      max: 60 * 24,
      value: '1min',
      format: 'ha',
      uniqueLabel: 'per minute',
    },
    {
      min: 10,
      max: 60 * 24,
      value: '5min',
      format: 'ha',
      uniqueLabel: 'per minute',
    },
    {
      min: 30,
      max: 60 * 24 * 2,
      value: '15min',
      format: 'ha',
      uniqueLabel: 'per minute',
    },
    {
      recommended: 60 * 24 * 10,
      min: 60 * 2,
      max: 60 * 24 * 30,
      value: 'hour',
      format: 'ha',
      uniqueLabel: 'per hour',
    },
    {
      recommended: Infinity,
      min: 60 * 24,
      max: Infinity,
      value: 'day',
      format: 'MMM Do',
      uniqueLabel: 'per day',
    },
    {
      recommended: Infinity,
      min: 60 * 24 * 7,
      max: Infinity,
      value: 'week',
      format: 'MMM Do',
      uniqueLabel: 'per day',
    },
    {
      recommended: Infinity,
      min: 60 * 24 * 30,
      max: Infinity,
      value: 'month',
      format: 'MMM YY',
      uniqueLabel: 'per day',
    },
  ],
  release: process.env.REACT_APP_VERSION,
  sandbox: {
    localpart: 'sandbox',
    domain: 'sparkpostbox.com',
  },
  splashPage: '/reports/summary',
  summaryChart: {
    defaultMetrics: ['count_targeted', 'count_rendered', 'count_accepted', 'count_bounce'],
  },
  reportBuilder: {
    defaultMetrics: [
      'count_sent',
      'count_unique_confirmed_opened_approx',
      'count_accepted',
      'count_bounce',
    ],
  },
  support: {
    maxAttachmentSizeBytes: 500 * 1000, // ~ 500 KB
  },
  templates: {
    testData: {
      substitution_data: {},
      metadata: {},
      options: {},
    },
  },
  tenantId: identifier,
  website: {
    domain: 'sparkpost.com',
  },
  zuora: {
    baseUrl: 'https://rest.apisandbox.zuora.com/v1',
    timeout: 15000,
  },
  smtpAuth: {
    host: `${identifier}.smtp.e.sparkpost.com`,
    port: 587,
    username: identifier,
    enabled: true,
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: `${identifier}.mail.e.sparkpost.com`,
    mxValue: `${identifier}.mx.e.sparkpost.com`,
  },
  trackingDomains: {
    cnameValue: `${identifier}.et.e.sparkpost.com`,
  },
  dateFormat: 'MMM D YYYY',
  dateFormatWithComma: 'MMM D, YYYY',
  dateFormatWithoutYear: 'MMM D',
  timeFormat: 'h:mma',
  messageEvents: {
    retentionPeriodDays: 10,
  },
  recaptcha: {
    key: '6LeFZQETAAAAACWJfxw_DKHgEPnop3brlj9IsHrY',
    invisibleKey: '6LekChoUAAAAAJZouMPHnhRss2t7-ZetbAABfsOZ',
  },
  attribution: {
    cookieName: 'attribution',
    cookieDuration: 60 * 24 * 30,
    cookieDomain: '.sparkpost.com',
  },
  salesforceDataParams: [
    'src',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ],
});

export default hostname => config(tenantIdFromHostname(hostname));
