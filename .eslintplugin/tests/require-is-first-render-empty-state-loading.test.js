import runner from '../utils/eslint-test-runner';
import rule from '../require-is-first-render-empty-state-loading';

runner('require-is-first-render-empty-state-loading', rule, {
  valid: {
    'Page instance with no properties.': {
      code: `<Page />`
    },
    'Page instance with no properties.': {
      code: `<Page><span>Page content!</span></Page>`
    },
  },
  invalid: {
    'Page instance with empty.trackingOnly but without loading attribute.': {
      code: `<Page empty={{ trackingOnly: true }} />`,
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr has no loading attribute.' }]
    },
    'Page instance with empty.trackingOnly but without loading set using isFirstRender.': {
      code: `<Page empty={{ trackingOnly: true }}\nloading="false" />`,
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr & loading attribute missing isFirstRender in the assignment expression.' }]
    },
  },
});
