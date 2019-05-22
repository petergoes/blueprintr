const { merge } = require('lodash')
const findInParentheses = require('./find-in-parentheses')
const splitSelector = require('./split-selector')
const splitSelectorParts = require('./split-selector-parts')

const ANY = 'any'
const COMBINATOR = 'combinator'
const ELEMENT = 'element'
const ID = 'id'
const CLASS = 'class'
const ATTRIBUTE = 'attribute'
const PSEUDO_ELEMENT = 'pseudoElement'
const PSEUDO_CLASS = 'pseudoClass'
const UNDEFINED = 'undefined'

const anyRE = /\*/
const combinatorRE = /\>|\+|\~/
const elementRE = /^\w/
const idRE = /^#([\w-]+)/
const classRE = /^\./
const attributeRE = /^\[/
const pseudoElementRE = /^::/
const pseudoClassesRE = /^:(?!:)/
const subjectRE = /^([#|.])?([\w-]+)(\W+)?/
const attributeValuesRE = /\[([\w="]+)\]/
const attributeValueRE = /(\w+)=?"?([\w]+)"?/
const pseudoElementValue = /^(?:.+?)(?:\:\:)(\w+)/

function getSubjectType(selector) {
  const isAny = anyRE.test(selector)
  const isCombinator = combinatorRE.test(selector)
  const isElement = elementRE.test(selector)
  const isId = idRE.test(selector)
  const isClass = classRE.test(selector)
  const isAttribute = attributeRE.test(selector)
  const isPseudoElement = pseudoElementRE.test(selector)
  const isPseudoClasses = pseudoClassesRE.test(selector)

  switch (true) {
    case isElement:
      return ELEMENT
    case isId:
      return ID
    case isClass:
      return CLASS
    case isAttribute:
      return ATTRIBUTE
    case isPseudoElement:
      return PSEUDO_ELEMENT
    case isPseudoClasses:
      return PSEUDO_CLASS
    case isCombinator:
      return COMBINATOR
    case isAny:
      return ANY
    default:
      return UNDEFINED
  }
}

function getName(selector) {
  const [, name] = /([^\:|\(|\[|\#|\.]+)/.exec(selector)
  return name
}

function getSubject(selector) {
  const [fullMatch, _, subject] = subjectRE.exec(selector) || []
  return subject
}

function getId(selector) {
  const [fullId, id] = idRE.exec(selector) || []
  return id
}

function getAttributes(selector) {
  function walk(selector, list = []) {
    const [match] = attributeValuesRE.exec(selector) || []
    const rest = selector.replace(match, '')
    const [_, key, value] = attributeValueRE.exec(match)
    list.push({ key, value })
    return rest.length ? walk(rest, list) : list
  }
  return attributeRE.test(selector)
    ? walk(selector.replace(/(^.+?)(\[.+)/, '$2'))
    : undefined
}

function getPseudoElement(_selector) {
  const selector = _selector.replace(/(^.+?)(\::.+)/, '$2')
  if (pseudoElementRE.test(selector) === false) return
  const [fullName, name] = /^(?:\:\:)([\w-]+)/.exec(selector)
  const hasValue = /^\(/.test(selector.replace(fullName, ''))
  const value = hasValue ? findInParentheses(selector) : undefined
  return { name, value }
}

function getPseudoClasses(selector) {
  function parse(_selector, list = []) {
    const selector = _selector.replace(/(^.[^:]+?)(\:(?!\:).+)/, '$2')
    if (pseudoClassesRE.test(selector) === false) return

    const [fullName, name] = /^(?:\:)([\w-]+)/.exec(selector)
    const hasValue = /^\(/.test(selector.replace(fullName, ''))
    const rawValue = hasValue ? findInParentheses(selector) : ''
    const value = hasValue ? selectorAst(rawValue) : undefined
    const restSelector = selector
      .replace(fullName, '')
      .replace(rawValue, '')
      .replace('()', '')

    list.push({ name, value })

    return restSelector.length !== 0
      ? parse(restSelector, list)
      : list
  }
  return parse(selector)
}

function parseSection(selector, list = []) {
  const id = getId(selector)
  const attributes = getAttributes(selector)
  const pseudoElement = getPseudoElement(selector)
  const pseudoClasses = getPseudoClasses(selector)
  const returnValue = {}

  if (id) returnValue.id = id
  if (attributes) returnValue.attributes = attributes
  if (pseudoElement) returnValue.pseudoElement = pseudoElement
  if (pseudoClasses) returnValue.pseudoClasses = pseudoClasses

  return returnValue
}

function buildAst(parts) {
  return parts
    .map(part => {
      const type = getSubjectType(part)
      const obj = {
        src: part,
        ...type !== 'attribute' && { name: getName(part) },
        .../\(/.test(part) && {
          children: selectorAst(findInParentheses(part))
        },
        ...!/\(.*(?=\[)/.test(part) && /\[/.test(part) && {
          attribute: findInParentheses(part, '[', ']')
        }
      }
      return { [type]: [obj] }
    })
    .reduce((acc, part) => {
      Object
        .entries(part)
        .forEach(([key, value]) => {
          acc[key] = acc[key] ? [...acc[key], ...value] : value
        })
      return acc
    }, {})
}

function selectorAst(selector, list = []) {
  return splitSelector(selector)
    .map(splitSelectorParts)
    .map(buildAst)
}

module.exports = selectorAst
