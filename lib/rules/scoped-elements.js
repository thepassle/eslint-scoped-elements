/**
 * @fileoverview Don't use custom elements in html tagged template literals that are not defined in static scopedElements
 * @author Pascal Schilp
 */
const { TemplateAnalyzer } = require('eslint-plugin-lit/lib/template-analyzer.js');
const { isHtmlTaggedTemplate } = require('../utils/isLitHtmlTemplate.js');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Don't use custom elements in html tagged template literals that are not defined in static scopedElements",
      recommended: false,
      url: 'TODO',
    },
  },

  create(context) {
    /**
     * https://astexplorer.net/#/gist/dfff49bbfc8a590aaf0263e18096a38f/3a1c2f822ff4dc0a7ea64aa14c6d44eb12f97b63
     *
     * @TODO
     * - Check for `static get scopedElements` and `static scopedElements`, and keep a map of the custom element definitions
     * - Check lit-html `html` templates for usage of components, see if they're in the map of custom element definitions
     *
     * For now:
     * - if there is a `...super.scopedElements` in the `static scopedElements` or `static get scopedElements`, dont trigger an error
     * - if there is a variable in a `this.defineScopedElement(foo, bar)` call, dont trigger an error
     */
    let hasSuperScopedElements = false;
    let hasDynamicValuesInDefineScopedElementsCall = false;

    const scopedElements = new Map();

    return {
      /**
       * @TODO implement visitor logic to check `static get scopedElements` (static getter)
       * @TODO implement visitor logic to check `static scopedElements` (static class field)
       */
      /**
       * This will check lit-html tagged template literals
       */

      ClassBody(node) {
        for ( let member of node.body) {
          //Static getter visitor
          if (member.type === 'MethodDefinition' && member.kind === 'get' && member.key.name === 'scopedElements' && member?.static) {
            const returnStatement = member?.value?.body?.body.find(x => x.type === 'ReturnStatement');
            if (returnStatement.argument.type === 'ObjectExpression') {
              scopedElements
                  .set(returnStatement.argument?.properties
                          .map(x => x.key?.value)[0],
                      returnStatement.argument?.properties
                          .map(x => x.value?.name)[0]);
            }
          }
          //Static class field visitor
          if (member.type === 'PropertyDefinition' && member.key.name === 'scopedElements' && member?.static) {
            if (member?.value?.type === 'ObjectExpression') {
              scopedElements
                  .set(member?.value?.properties
                          .map(x => x.key?.value)[0],
                      member?.value?.properties
                          .map(x => x.value?.name)[0]);
            }
          }
        }
      },
      //Lazy loaded visitor
      CallExpression(node) {
       if(node.callee.property?.name === 'defineScopedElement'
           && node.arguments[0]?.type === 'Literal') {
         scopedElements
             .set(node.arguments[0].value,
                 node.arguments[1]?.property.name);
       }
      },
      //Dynamically defined, edgecase: ignore for now
      ExpressionStatement(node) {
       if(node.expression.callee.property.name === 'defineScopedElement'
           && node.expression.arguments[0]?.type === 'Identifier') {
         hasDynamicValuesInDefineScopedElementsCall = true;
       }
      },
      //...super.scopedElements, edgecase: ignore for now
      MemberExpression(node) {
        if(node?.object.type === 'Super' && node?.property.name === 'scopedElements') {
          hasSuperScopedElements = true;
        }
      },

      TaggedTemplateExpression(node) {
        if (isHtmlTaggedTemplate(node, context)) {
          const analyzer = TemplateAnalyzer.create(node);

          analyzer.traverse({
            enterElement(element) {
              /** @TODO you should implement this :) */
              const isDeclaredInStaticScopedElements = scopedElements.has(element?.name);
              if(
                !isDeclaredInStaticScopedElements &&
                !hasSuperScopedElements &&
                !hasDynamicValuesInDefineScopedElementsCall
              ) {
                /** Utility to resolve the location in the source code, for error reporting */
                const loc = analyzer.resolveLocation(
                  element.sourceCodeLocation.startTag,
                  context.getSourceCode(),
                ) ?? node.loc;

                /** Bonus points if you can output in the error message which element is not declared :) */
                context.report({loc, message: 'Element not declared in static scopedElements'})
              }
            },
          });
        }
      },
    };
  },
};