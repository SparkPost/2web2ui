window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//amexgbt.api.e.sparkpost.com/api/v1',
  featureFlags: {},
  support: {"algolia": {"index": "production_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  sentry: {
    projectId: 237613,
    publicKey: '014f9707c27b4e7ea90aff051a82e561'
  },
  smtpAuth: {
    enabled: true,
    host: 'amexgbt.smtp.e.sparkpost.com',
    port: 587,
    username: "amexgbt",
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'track.amexgbt-m.sparkpostelite.com'
  },
  bounceDomains: {
    allowDefault: false,
    allowSubaccountDefault: true,
    cnameValue: 'amexgbt.mail.e.sparkpost.com'
  },
  tenant: 'amex'
};
