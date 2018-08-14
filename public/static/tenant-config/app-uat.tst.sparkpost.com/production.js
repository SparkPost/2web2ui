window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//api-uat.tst.sparkpost.com/api/v1',
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
  support: {"algolia": {"index": "development_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  gtmId: 'GTM-P87NNJ4',
  sentry: {
    projectId: 237611,
    publicKey: 'b63907577f9c4091895c49cc963fa8e4'
  },
  siftScience: {
    id: '88affa8e11'
  },
  smtpAuth: {
    enabled: true,
    host: 'smtp.tst.sparkpost',
    port: 587,
    username: "SMTP_Injection",
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'spcuat.et.e.tst.sparkpost.com'
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: 'uat-public.mail.e.sparkpost.com'
  },
  crossLinkTenant: 'spceu',
  tenant: 'uat'
};
