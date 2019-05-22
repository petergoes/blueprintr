const transformCss = require('../../lib/transform-css')

test('handle naked', async () => {
  const css = ':host { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element { background-color: blue; }')
})

test('handle element', async () => {
  const css = ':host(element) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element { background-color: blue; }')
})

test('handle class', async () => {
  const css = ':host(.class) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element.class { background-color: blue; }')
})

test('handle attribute', async () => {
  const css = ':host([foo]) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element[foo] { background-color: blue; }')
})

test('handle pseudoSelector', async () => {
  const css = ':host(:hover) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element:hover { background-color: blue; }')
})

test('handle pseudoSelector with deeper selector', async () => {
  const css = ':host(:hover span) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element:hover span { background-color: blue; }')
})

test('handle combined selector', async () => {
  const css = ':host(.class) element { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element.class element { background-color: blue; }')
})
