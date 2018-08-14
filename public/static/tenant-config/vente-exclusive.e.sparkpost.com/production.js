window.SP = window.SP || {};
window.SP.productionConfig = {
  apiBase: '//vente-exclusive.api.e.sparkpost.com/api/v1',
  featureFlags: {
    "allow_anyone_at_verification": true, 
    "allow_default_signing_domains_for_ip_pools": true, 
    "allow_mailbox_verification": true
},
  support: {"algolia": {"index": "production_site_posts_support_article", "apiKey": "9ba87280f36f539fcc0a318c2d4fcfe6", "appID": "SFXAWCYDV8"}, "enabled": true},
  gaTag: 'UA-111136819-2',
  sentry: {
    projectId: 237613,
    publicKey: '014f9707c27b4e7ea90aff051a82e561'
  },
  smtpAuth: {
    enabled: true,
    host: 'vente-exclusive.smtp.e.sparkpost.com',
    port: 587,
    username: "vente-exclusive",
    commaFixer: "fixer of the trailing commas"
  },
  trackingDomains: {
    cnameValue: 'click1.mail1.vente-exclusive.com'
  },
  bounceDomains: {
    allowDefault: true,
    allowSubaccountDefault: true,
    cnameValue: 'vente-exclusive.mail.e.sparkpost.com'
  },
  tenant: 'vente'
};
