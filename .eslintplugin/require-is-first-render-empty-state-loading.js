const fs = require('fs');

/**
 * ESLint Docs:
 *  - https://eslint.org/docs/developer-guide/working-with-plugins#create-a-plugin
 *  - https://eslint.org/docs/developer-guide/working-with-rules
 */

const requireIsFirstRenderEmptyStateLoading = {
  meta: {},
  create(context) {
    // https://eslint.org/docs/developer-guide/working-with-rules#the-context-object
    const { report } = context;
    const filePath = context.getFilename();
    const withinSrcPages = /2web2ui\/src\/pages/.test(filePath);
    const isTestFile = /.test.js$/.test(filePath);

    // Question: is it better to return early here, or down lower ?
    // return early...
    if (!withinSrcPages || isTestFile) {
      return {};
    }

    // pseudocode
    // 1. Find JSX instances of <Page />
    //   2. Look for empty= prop, if there is one
    //     3. Look for loading= prop
    //       4a. no loading at all - report
    //       4b. loading but no isFirstRender - report

    return {
      JSXElement: (node) => {
        if (node.openingElement.name.name === 'Page') {
          const emptyAttr = node.openingElement.attributes.find(attr => {
            if (attr && attr.name && attr.name.name && attr.name.name === 'empty') {
              return attr;
            }
          });

          const loadingAttr = node.openingElement.attributes.find(attr => {
            if (attr && attr.name && attr.name.name && attr.name.name === 'loading') {
              return attr;
            }
          });

          if (emptyAttr) {
            if (!loadingAttr) {
              report({
                node: node,
                message: 'Page with empty state has no loading attribute.',
              });
            } else {
              if (fs.existsSync(filePath)) {
                const file = fs.readFileSync(filePath, {});
                const start = loadingAttr.loc.start.line - 1;
                const end = loadingAttr.loc.end.line - 1;
                const lines = file.toString().split(/(?:\r\n|\r|\n)/g);
                let foundIsFirstRender;
                for (let index = start; index <= end; index++) {
                  const line = lines[index];
                  if (/isFirstRender/.test(line)) {
                    foundIsFirstRender = true;
                    break;
                  }
                }

                if (!foundIsFirstRender) {
                  report({
                    node: node,
                    message: 'Page with empty state & loading attribute missing isFirstRender.',
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
