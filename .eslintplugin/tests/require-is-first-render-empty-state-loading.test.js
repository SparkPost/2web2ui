import runner from '../utils/eslintTestRunner';
import rule from '../require-is-first-render-empty-state-loading';

const NEWLINE = '\n\r'; // make sure we do newlines just like the real file would

function EmptyState() { return <></> };

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
    'Page instance with just empty prop.': {
      code: `<Page empty={{}}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with just empty.show prop.': {
      code: `<Page empty={{ show: true }}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with empty.show and loading isFirstRender prop.': {
      code: `<Page empty={{ show: true }} hibanaEmptyStateComponent={EmptyState} loading={isFirstRender}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with empty.show and loading isFirstRender prop on a newline.': {
      code: `<Page empty={{ show: true }} hibanaEmptyStateComponent={EmptyState} ${NEWLINE}loading={isFirstRender}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with empty.trackingOnly and loading isFirstRender prop.': {
      code: `<Page empty={{ trackingOnly: true }} ${NEWLINE}loading={isFirstRender}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
    'Page instance with empty.trackingOnly and loading isFirstRender prop on a newline.': {
      code: `<Page empty={{ trackingOnly: true }} ${NEWLINE}loading={isFirstRender}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js'
    },
  },
  invalid: {
    'Page instance with hibanaEmptyStateComponent without loading': {
      code: `<Page hibanaEmptyStateComponent={EmptyState}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr has no loading attribute.' }]
    },
    'Page instance with hibanaEmptyStateComponent and loading without isFirstRender': {
      code: `<Page hibanaEmptyStateComponent={EmptyState} loading={false}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with hibanaEmptyStateComponentAttr and loading attribute missing isFirstRender in the assignment expression.' }]
    },
    'Page instance with empty.trackingOnly without loading.': {
      code: `<Page empty={{ trackingOnly: true }}><span>Page content!</span></Page>`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with empty.trackingOnly has no loading attribute.' }]
    },
    'Page instance with empty.trackingOnly and loading without isFirstRender': {
      code: `<Page empty={{ trackingOnly: true }} loading={false} />`,
      filename: '2web2ui/src/pages/filename_in_src_pages_required.js',
      errors: [{ message: 'Page with empty.trackingOnly and loading attribute missing isFirstRender in the assignment expression.' }]
    },
  },
});
