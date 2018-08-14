window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//api-staging-mtas2.sparkpost.com/api/v1',
  featureFlags: {
    "allow_anyone_at_verification": true, 
    "allow_mailbox_verification": true
},
  support: {"algolia": {"index": "staging_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  sentry: {
    projectId: 237612,
    publicKey: 'cb27762b225f4884b5e035580f1cc289'
  },
  smtpAuth: {
    enabled: true,
    host: 'smtp-staging-mtas2.sparkpostmail.com',
    port: 587,
    username: "staging-mtas2",
    alternativePort: 2525,
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'staging-mtas2.spgo.io'
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: 'staging-mtas2.mail.e.sparkpost.com'
  },
  tenant: 'stagingmtas2'
};
