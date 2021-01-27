const fs = require('fs');

/**
 * ESLint Docs:
 *  - https://eslint.org/docs/developer-guide/working-with-plugins#create-a-plugin
 *  - https://eslint.org/docs/developer-guide/working-with-rules
 *
 */

const requireIsFirstRenderEmptyStateLoading = {
  meta: {},
  create(context) {
    // https://eslint.org/docs/developer-guide/working-with-rules#the-context-object
    const { report } = context;
    const filePath = context.getFilename();
    const withinSrcPages = /2web2ui\/src\/pages/.test(filePath);
    const isTestFile = /.test.js$/.test(filePath);
    const sourceCode = context.getSourceCode();

    if (!withinSrcPages || isTestFile) {
      return {};
    }

    return {
      JSXElement: (node) => {
        let sourceCodeLines = sourceCode.getText(node);

        if (node.openingElement.name.name === 'Page') {
          const hibanaEmptyStateComponentAttr = node.openingElement.attributes.find(attr => {
            if (attr && attr.name && attr.name.name && attr.name.name === 'hibanaEmptyStateComponent') {
              return attr;
            }
          });

          let emptyTrackingOnlyAttr;
          const empty = node.openingElement.attributes.find(attr => {
            if (attr && attr.name && attr.name.name && attr.name.name === 'empty') {
              return attr;
            }
          });
          if (empty) {
            empty.value.expression.properties.forEach(node => {
              if (node.key.name === 'trackingOnly') {
                emptyTrackingOnlyAttr = true;
              }
            });
          }

          const loadingAttr = node.openingElement.attributes.find(attr => {
            if (attr && attr.name && attr.name.name && attr.name.name === 'loading') {
              return attr;
            }
          });
          const loadingAttributeLines = sourceCode.getText(loadingAttr);

          if (hibanaEmptyStateComponentAttr) {
            if (!loadingAttr) {
              report({
                node: node,
                message: 'Page with hibanaEmptyStateComponentAttr has no loading attribute.',
              });
            } else {
              const lines = loadingAttributeLines.split('\n\r');
              let foundIsFirstRender;
              lines.forEach(line => {
                if (/isFirstRender/.test(line)) {
                  foundIsFirstRender = true;
                }
              });

              if (!foundIsFirstRender) {
                report({
                  node: node,
                  message: 'Page with hibanaEmptyStateComponentAttr and loading attribute missing isFirstRender in the assignment expression.',
                });
              }
            }
          }

          if (emptyTrackingOnlyAttr) {
            if (!loadingAttr) {
              report({
                node: node,
                message: 'Page with empty.trackingOnly has no loading attribute.',
              });
            } else {
              const lines = loadingAttributeLines.split('\n\r');
              let foundIsFirstRender;
              lines.forEach(line => {
                if (/isFirstRender/.test(line)) {
                  foundIsFirstRender = true;
                }
              });

              if (!foundIsFirstRender) {
                report({
                  node: node,
                  message: 'Page with empty.trackingOnly and loading attribute missing isFirstRender in the assignment expression.',
                });
              }
            }
          }
        }
      }
    };
  },
};

module.exports = requireIsFirstRenderEmptyStateLoading;
