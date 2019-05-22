const findInParentheses = require('./find-in-parentheses')

function find(string) {
  let index = 1
  let found = false
  let substr = ''
  let delimiters = ['#', '.', ':', '[', '(']
  do {
    if (delimiters.includes(string[index])) {
      found = true
      substr = string.slice(0, index)
    }

    if (string[index - 1] === ':' && string[index] === ':') {
      found = false
      substr = ''
    }
    index += 1
  } while (found === false && index < string.length)

  return substr === '' ? string : substr
}

function splitSelectorParts(selector) {
  function walk(_selector, parts = []) {
    let result = find(_selector)
    let remainingSelector = _selector.replace(result, '')

    if (
      remainingSelector[0] === '(' ||
      remainingSelector[0] === '['
    ) {
      const [start, end] = remainingSelector[0] === '('
        ? ['(', ')']
        : ['[', ']']
      const nested = findInParentheses(remainingSelector, start, end)

      result = `${result}${start}${nested}${end}`
      remainingSelector = remainingSelector.replace(`${start}${nested}${end}`, '')
    }

    parts.push(result)

    if (remainingSelector.length) {
      return walk(remainingSelector, parts)
    }
    return parts
  }

  return walk(selector)
}

module.exports = splitSelectorParts
