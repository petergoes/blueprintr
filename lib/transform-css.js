const clone = require('lodash/clone')
const get = require('lodash/get')
const omit = require('lodash/omit')
const merge = require('lodash/merge')
const head = require('lodash/head')
const identity = require('lodash/identity')
const postcss = require('postcss')
const selectorAst = require('./selector-ast')
const buildSelectorFromAst = require('./build-selector-from-ast')

const plugin = postcss.plugin(
    'transform-css',
    ({elementName}) => root => {
        root.walkRules(rule => {
            const ast = selectorAst(rule.selector)

                // append an element part to each selected except selectors 
                // containing :host
                .reduce((ast, part, index, array) => {
                    const addition = []
                    if (index === 0) {
                        const getHost = value => 
                            get(value, 'pseudoClass[0].name') === 'host' ||
                            get(value, 'pseudoClass[0].name') === 'host-context'

                        if (!array.find(getHost)) {
                            addition.push({ element: [{name: elementName, src: elementName}] })
                        }
                    }
                    return [...addition, ...ast, part]
                }, [])

                // Modify selector parts
                .reduce((ast, part) => {
                    const { pseudoClass = [], pseudoElement = [], element = [] } = part
                    const host = pseudoClass.find(({name}) => name === 'host')
                    const hostContext = pseudoClass.find(({name}) => name === 'host-context')
                    const slotted = pseudoElement.find(({name}) => name === 'slotted')
                    let additions = []

                    if (host) {
                        const [firstChild, ...children] = clone(host.children) || []
                        const firstChildPartKey = firstChild && head(Object.keys(firstChild))
                        const firstChildPart = firstChildPartKey && head(firstChild[firstChildPartKey])
                        
                        host.name = elementName
                        host.src = host.src.replace(':host', elementName)
                        part.element = [host]
                        
                        delete part.pseudoClass
                        delete host.children

                        if (firstChild && !firstChild.attribute && firstChildPartKey !== 'element') {
                            part = merge({}, part, firstChild || {})
                        }

                        if (firstChild && firstChild.attribute) {
                            const attribute = get(head(get(firstChild, 'attribute')), 'attribute')
                            host.attribute = attribute
                        }

                        additions = [...additions, ...children]
                    }

                    if (hostContext) {
                        const children = clone(hostContext.children) || []
                        const hostContextIndex = pseudoClass.indexOf(hostContext)
                        hostContext.name = elementName
                        hostContext.src = hostContext.src.replace(':host-context', elementName)
                        part.element = [hostContext]
                        part.pseudoClass = part.pseudoClass.filter(item => item !== hostContext)

                        const { element, id, class: _class, ...rest } = part

                        delete hostContext.children
                        const partClone = clone({
                            ...element && { element },
                            ...id && { id },
                            ..._class && { class: _class },
                            ...rest
                        })

                        part = undefined
                        additions = [...additions, ...children, partClone]
                    }

                    if (slotted) {
                        const emptyFirstChild = { any: [{ src: '*', name: '', attribute: 'data-slotted' }] }
                        const [firstChild = emptyFirstChild, ...children] = clone(slotted.children) || []
                        const firstChildPartKey = firstChild && head(Object.keys(firstChild))
                        const firstChildPart = firstChildPartKey && head(firstChild[firstChildPartKey])
                        
                        delete part.pseudoElement
                        
                        firstChild.attribute 
                            ? firstChild.attribute.push({ attribute: 'data-slotted' })
                            : firstChildPart.attribute = 'data-slotted'

                        additions = [
                            ...additions,
                            ...firstChild ? [firstChild] : [],
                            ...children
                        ]
                    }

                    return [...ast, part, ...additions].filter(identity)
                }, [])

            rule.selector = buildSelectorFromAst(ast)
        })
    }
)

function transformCss(rawCSS, elementName) {
    return postcss([plugin({ elementName })])
        .process(rawCSS, { from: undefined })
        .then(({css}) => css)
}

module.exports = transformCss