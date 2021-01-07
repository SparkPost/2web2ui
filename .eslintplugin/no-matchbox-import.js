/**
 * ESLint Docs:
 *  - https://eslint.org/docs/developer-guide/working-with-plugins#create-a-plugin
 *  - https://eslint.org/docs/developer-guide/working-with-rules
 */

const noMatchboxImport = {
  meta: {},
  create(context) {
    const { report } = context;
    const filePath = context.getFilename();
    const withinSrc = /2web2ui\/src/.test(filePath);
    const withinSrcMatchboxComponents = /2web2ui\/src\/components\/matchbox/.test(filePath);

    return {
      ImportDeclaration: function(node) {
        if (!withinSrc) {
          return {};
        }

        if (
          !withinSrcMatchboxComponents &&
          /@sparkpost\/matchbox(-hibana)?$/.test(node.source.value)
        ) {
          report({
            node: node,
            message: 'Do not allow direct matchbox imports.',
          });
        }
      },
    };
  },
};

module.exports = noMatchboxImport;
