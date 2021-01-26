const fs = require('fs');

/**
 * ESLint Docs:
 *  - https://eslint.org/docs/developer-guide/working-with-plugins#create-a-plugin
 *  - https://eslint.org/docs/developer-guide/working-with-rules
 *
    pseudocode
    1. Find JSX instances of <Page />
      2a. Look for hibanaEmptyStateComponent= prop, if there is one
      2b. or... Look for empty?.trackingOnly= prop, if there is one
        3. Look for loading= prop
          4a. no loading at all - report
          4b. loading but no isFirstRender - report
 */

const requireIsFirstRenderEmptyStateLoading = {
  meta: {},
  create(context) {
    // https://eslint.org/docs/developer-guide/working-with-rules#the-context-object
    const { report } = context;
    const filePath = context.getFilename();
    const withinSrcPages = /2web2ui\/src\/pages/.test(filePath);
    const isTestFile = /.test.js$/.test(filePath);
    if (!withinSrcPages || isTestFile) {
      return {};
    }
    return {
      JSXElement: (node) => {
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

          if (hibanaEmptyStateComponentAttr || emptyTrackingOnlyAttr) {
            if (!loadingAttr) {
              report({
                node: node,
                message: 'Page with hibanaEmptyStateComponentAttr has no loading attribute.',
              });
            } else {
              if (fs.existsSync(filePath)) {
                const file = fs.readFileSync(filePath, {});
                const start = loadingAttr.loc.start.line - 1;
                const end = loadingAttr.loc.end.line - 1;
                const allLinesInFile = file.toString().split(/(?:\r\n|\r|\n)/g);
                let foundIsFirstRender;
                for (let index = start; index <= end; index++) {
                  const line = allLinesInFile[index];
                  if (/isFirstRender/.test(line)) {
                    foundIsFirstRender = true;
                    break;
                  }
                }

                if (!foundIsFirstRender) {
                  report({
                    node: node,
                    message: 'Page with hibanaEmptyStateComponentAttr and loading attribute missing isFirstRender in the assignment expression.',
                  });
                }
              }
            }
          }
        }
      }
    };
  },
};

module.exports = requireIsFirstRenderEmptyStateLoading;
