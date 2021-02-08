const testConfig = {
  apiBase: 'http://mock.sparkpost.test',
  splashPage: '/dashboard',
  release: 'test-release',
  segment: {
    enabled: false,
  },
  smtpAuth: {
    host: 'smtp.sparkmail.com',
    alternativePort: 2525,
  },
  support: {
    algolia: {
      appID: 'id',
      apiKey: 'key',
      index: 'index',
    },
  },
  authentication: {
    app: {
      cookie: {
        name: 'test',
        options: {
          secure: false,
        },
      },
    },
    site: {
      cookie: {
        name: 'website_test',
        options: {
          domain: '.sparkpost.test',
          secure: false,
        },
      },
    },
  },
  crossLinkTenant: 'spc',
  cookieConsent: {
    cookie: {
      name: 'cookieConsent',
      ageDays: 365,
      options: {
        domain: 'test',
        path: '/',
      },
    },
  },
  tenantId: 'test',
};

export default testConfig;
