function isHtmlTaggedTemplate(node, context) {
  if (node.type !== 'TaggedTemplateExpression') return false;
  const { litHtmlTags = ['html'], litHtmlNamespaces = [] } = context.parserServices || {};

  switch (node.tag.type) {
    case 'Identifier':
      return litHtmlTags.includes(node.tag.name);
    case 'MemberExpression':
      return (
        node.tag.property.type === 'Identifier' &&
        node.tag.property.name === 'html' &&
        node.tag.object.type === 'Identifier' &&
        litHtmlNamespaces.includes(node.tag.object.name)
      );
    default:
      return false;
  }
}

function hasScopedElementsGetter(node) {
  return node.kind === 'get'  && node.key?.name === 'scopedElements';
}


module.exports = { isHtmlTaggedTemplate, hasScopedElementsGetter };