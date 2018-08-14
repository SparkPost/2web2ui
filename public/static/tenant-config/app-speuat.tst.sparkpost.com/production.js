window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//api-speuat.tst.sparkpost.com/api/v1',
  featureFlags: {},
  support: {"algolia": {"index": "development_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  sentry: {
    projectId: 237611,
    publicKey: 'b63907577f9c4091895c49cc963fa8e4'
  },
  smtpAuth: {
    enabled: true,
    host: 'speuat.smtp.tst.sparkpost.com',
    port: 587,
    username: "speuat",
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'speuat.et.tst.sparkpost.com'
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: 'speuat.mail.e.sparkpost.com'
  },
  tenant: 'speuat'
};
