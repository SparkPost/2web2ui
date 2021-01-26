import runner from '../utils/eslint-test-runner';
import rule from '../require-is-first-render-empty-state-loading';

runner('require-is-first-render-empty-state-loading', rule, {
  valid: {
    'Page instance with no properties.': {
      code: `<Page />`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with no properties.': {
      code: `<Page><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
  },
  invalid: {
    'Page instance with empty.trackingOnly but without loading attribute.': {
      code: `<Page empty={{ trackingOnly: true }} />`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr has no loading attribute.' }]
    },
    'Page instance with empty.trackingOnly but without loading isFirstRender expression.': {
      code: `<Page empty={{ trackingOnly: true }} loading={true} />`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr and loading attribute missing isFirstRender in the assignment expression.' }]
    },
  },
});
