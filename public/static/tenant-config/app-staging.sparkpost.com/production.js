window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//api-staging.sparkpost.com/api/v1',
  featureFlags: {
    "allow_anyone_at_verification": true, 
    "allow_default_signing_domains_for_ip_pools": true, 
    "allow_mailbox_verification": true, 
    "has_signup": true, 
    "sending_domains_v2": true, 
    "templatesBySubaccount": true, 
    "usage_from_redis": true
},
  splashPage: '/dashboard',
  support: {"algolia": {"index": "staging_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  gtmId: 'GTM-5BCG3R',
  sentry: {
    projectId: 237612,
    publicKey: 'cb27762b225f4884b5e035580f1cc289'
  },
  siftScience: {
    id: '88affa8e11'
  },
  smtpAuth: {
    enabled: true,
    host: 'smtp-staging.sparkpostmail.com',
    port: 587,
    username: "SMTP_Injection",
    alternativePort: 2525,
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'stage.spgo.io'
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: 'staging.mail.e.sparkpost.com'
  },
  crossLinkTenant: 'spc',
  tenant: 'staging'
};
