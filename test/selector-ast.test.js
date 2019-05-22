const selectorAst = require('../lib/selector-ast')

describe('Simple Selector', () => {
  test('Any', async () => {
    const selector = '*'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        any: [
          { name: "*", src: "*" }
        ]
      }
    ])
  })

  test('Element', async () => {
    const selector = 'span'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        element: [
          { name: "span", src: "span" }
        ]
      }
    ])
  })

  test('Class', async () => {
    const selector = '.my-class'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        class: [
          { name: "my-class", src: ".my-class" }
        ]
      }
    ])
  })

  test('Attribute', async () => {
    const selector = '[foo="bar"]'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        attribute: [
          { attribute: 'foo="bar"', src: '[foo="bar"]' }
        ]
      }
    ])
  })

  test('Pseudo Class', async () => {
    const selector = ':first-child'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        pseudoClass: [
          { name: 'first-child', src: ':first-child' }
        ]
      }
    ])
  })

  test('Pseudo Class with value', async () => {
    const selector = ':nth-child(2)'
    const result = await selectorAst(selector)
    expect(result).toEqual([
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
    ])
  })

  test('Pseudo Element', async () => {
    const selector = '::after'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        pseudoElement: [
          { name: 'after', src: '::after' }
        ]
      }
    ])
  })

  test('Pseudo Element with value', async () => {
    const selector = '::slotted(h1)'
    const result = await selectorAst(selector)
    expect(result).toEqual([
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
    ])
  })

  test('Pseudo Element with attribute', async () => {
    const selector = '::slotted([foo="bar"])'
    const result = await selectorAst(selector)
    expect(result).toEqual([
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
    ])
  })

  test('Combinator +', async () => {
    const selector = '+'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        combinator: [
          { name: "+", src: "+" }
        ]
      }
    ])
  })

  test('Combinator ~', async () => {
    const selector = '~'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        combinator: [
          { name: "~", src: "~" }
        ]
      }
    ])
  })

  test('Combinator >', async () => {
    const selector = '>'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        combinator: [
          { name: ">", src: ">" }
        ]
      }
    ])
  })
})

describe('Combined Selector', () => {
  test('Element with class', async () => {
    const selector = 'h1.strong'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        element: [
          { name: "h1", src: "h1" }
        ],
        class: [
          { name: 'strong', src: ".strong" }
        ]
      }
    ])
  })

  test('Element with classes', async () => {
    const selector = 'h1.foo.bar'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        element: [
          { name: "h1", src: "h1" }
        ],
        class: [
          { name: 'foo', src: ".foo" },
          { name: 'bar', src: ".bar" }
        ]
      }
    ])
    expect(result).not.toEqual([
      {
        element: [
          { name: "h1", src: "h1" }
        ],
        class: [
          { name: 'bar', src: ".bar" },
          { name: 'foo', src: ".foo" },
        ]
      }
    ])
  })

  test('Element with attribute', async () => {
    const selector = 'h1[foo="bar"]'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        element: [
          { name: 'h1', src: 'h1[foo="bar"]', attribute: 'foo="bar"' }
        ],
      }
    ])
  })

  test('Class with attribute', async () => {
    const selector = '.foo[bar="baz"]'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        class: [
          { name: 'foo', src: '.foo[bar="baz"]', attribute: 'bar="baz"' }
        ],
      }
    ])
  })

  test('Classes with attribute', async () => {
    const selector = '.blub.foo[bar="baz"]'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        class: [
          { name: 'blub', src: '.blub' },
          { name: 'foo', src: '.foo[bar="baz"]', attribute: 'bar="baz"' }
        ],
      }
    ])
  })

  test('Class with PseudoClass', async () => {
    const selector = '.foo:hover'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        class: [
          { name: 'foo', src: '.foo' }
        ],
        pseudoClass: [
          { name: 'hover', src: ':hover' }
        ]
      }
    ])
  })

  test('Class with PseudoClasses', async () => {
    const selector = '.foo:first-of-type:hover'
    const result = await selectorAst(selector)
    expect(result).toEqual([
      {
        class: [
          { name: 'foo', src: '.foo' }
        ],
        pseudoClass: [
          { name: 'first-of-type', src: ':first-of-type' },
          { name: 'hover', src: ':hover' }
        ]
      }
    ])
  })
})