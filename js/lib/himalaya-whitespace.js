
function removeEmptyNodes (nodes) {
  return nodes.filter(node => {
    if (node.type === 'element') {
      node.children = removeEmptyNodes(node.children);
      return true
    }
    return node.content.length
  })
};

function stripWhitespace (nodes) {
  return nodes.map(node => {
    if (node.type === 'element') {
      node.children = stripWhitespace(node.children)
    } else {
      node.content = node.content.trim()
    }
    return node
  })
};

function removeWhitespace(nodes) {
  return removeEmptyNodes(stripWhitespace(nodes))
};
