function getPrefix(key) {
  switch (key) {
    case 'id':
      return '#'
    case 'class':
      return '.'
    case 'pseudoElement':
      return '::'
    case 'pseudoClass':
      return ':'
    default:
      return ''
  }
}

function build(ast) {
  return ast
    .reduce((selector, part) => {
      selector = `${selector} `
      Object.entries(part).forEach(([key, value]) => {
        const prefix = getPrefix(key)
        const subparts = value.reduce((subpart, item) => {
          let children = ''
          let attribute = ''
          if (item.children) {
            children = `(${build(item.children)})`
          }
          if (item.attribute) {
            attribute = `[${item.attribute}]`
          }
          if (item.name === undefined) {
            item.name = ''
          }
          return subpart + prefix + item.name + children + attribute
        }, '')
        selector = `${selector}${subparts}`
      })
      return selector
    }, '')
    .trim()
    .replace(/\s{2,}/, ' ') // remove double spaces
}

module.exports = build
