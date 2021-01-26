const matchSrc = 'src';
const matchScripts = 'scripts';
const matchProjectESLintRules = '.eslintplugin';
const testMatchList =
  process.env.TEST_MATCH_LIST || [matchSrc, matchScripts, matchProjectESLintRules].join('|');

module.exports = {
  reporters: ['default', 'jest-junit'],
  testResultsProcessor: './node_modules/jest-junit-reporter',
  setupFiles: ['<rootDir>/config/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js?(x)',
    `<rootDir>/(${testMatchList})/**/*.test.js?(x)`,
  ],
  testEnvironment: 'node',
  testURL: 'http://phoenix.test',
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  modulePaths: [''],
  clearMocks: true,
  restoreMocks: true,
  globals: {
    SUPPORTED_BROWSERS: {},
    TENANT_CONFIGS: {},
  },
  watchPathIgnorePatterns: ['<rootDir>/build'],
};
process.env.TZ = 'America/New_York';
