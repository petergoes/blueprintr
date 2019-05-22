const transformCss = require('../../lib/transform-css')

test('handle element', async () => {
  const css = ':host-context(h1) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('h1 x-element { background-color: blue; }')
})

test('handle pseudo class', async () => {
  const css = ':host-context(h1):last-child { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('h1 x-element:last-child { background-color: blue; }')
})

test('handle pseudo element', async () => {
  const css = ':host-context(h1)::after { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('h1 x-element::after { background-color: blue; }')
})

test('handle pseudo element on context selector', async () => {
  const css = ':host-context(h1::after) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('h1::after x-element { background-color: blue; }')
})

test('handle combined selector', async () => {
  const css = ':host-context(.foo) button { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('.foo x-element button { background-color: blue; }')
})