const build = require('../lib/build-selector-from-ast')

test('any', () => {
    const ast = [
        {
            any: [
                { name: "*", src: "*" }
            ]
        }
    ]
    expect(build(ast)).toBe('*')
})

test('Element', async () => {
    const ast = [
        {
            element: [
                { name: "span", src: "span" }
            ]
        }
    ]
    expect(build(ast)).toBe('span')
})

test('Class', async () => {
    const ast = [
        {
            class: [
                { name: "my-class", src: ".my-class" }
            ]
        }
    ]
    expect(build(ast)).toBe('.my-class')
})

test('Attribute', async () => {
    const ast = [
        {
            attribute: [
                { attribute: 'foo="bar"', src: '[foo="bar"]' }
            ]
        }
    ]
    expect(build(ast)).toBe('[foo="bar"]')
})

test('Pseudo Class', async () => {
    const ast = [
        {
            pseudoClass: [
                { name: 'first-child', src: ':first-child' }
            ]
        }
    ]
    expect(build(ast)).toBe(':first-child')
})

test('Pseudo Class with value', async () => {
    const ast = [
        {
            pseudoClass: [
                { 
                    name: 'nth-child',
                    src: ':nth-child(2)',
                    children: [
                        { element: [{ name: '2', src: '2' }] }
                    ]
                }
            ]
        }
    ]
    expect(build(ast)).toBe(':nth-child(2)')
})

test('Pseudo Element', async () => {
    const ast = [
        {
            pseudoElement: [
                { name: 'after', src: '::after' }
            ]
        }
    ]
    expect(build(ast)).toBe('::after')
})

test('Pseudo Element with value', async () => {
    const ast = [
        {
            pseudoElement: [
                { 
                    name: 'slotted',
                    src: '::slotted(h1)',
                    children: [
                        { element: [{ name: 'h1', src: 'h1' }] }
                    ]
                }
            ]
        }
    ]
    expect(build(ast)).toBe('::slotted(h1)')
})

test('Pseudo Element with attribute', async () => {
    const ast = [
        {
            pseudoElement: [
                { 
                    name: 'slotted',
                    src: '::slotted([foo="bar"])',
                    children: [
                        { attribute: [{ attribute: 'foo="bar"', src: '[foo="bar"]' }] }
                    ]
                }
            ]
        }
    ]
    expect(build(ast)).toBe('::slotted([foo="bar"])')
})

test('Combinator +', async () => {
    const ast = [
        {
            combinator: [
                { name: "+", src: "+" }
            ]
        }
    ]
    expect(build(ast)).toBe('+')
})

test('Combinator ~', async () => {
    const ast = [
        {
            combinator: [
                { name: "~", src: "~" }
            ]
        }
    ]
    expect(build(ast)).toBe('~')
})

test('Combinator >', async () => {
    const ast = [
        {
            combinator: [
                { name: ">", src: ">" }
            ]
        }
    ]
    expect(build(ast)).toBe('>')
})