const transformCss = require('../../lib/transform-css')

test('handle naked', async () => {
  const css = '::slotted { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element [data-slotted] { background-color: blue; }')
})

test('handle any', async () => {
  const css = '::slotted(*) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element *[data-slotted] { background-color: blue; }')
})

test('handle attribute', async () => {
  const css = '::slotted([foo="bar"]) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element [foo="bar"][data-slotted] { background-color: blue; }')
})

test('handle element selector', async () => {
  const css = '::slotted(h1) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element h1[data-slotted] { background-color: blue; }')
})

test('handle composed element selector', async () => {
  const css = '::slotted(h1 span) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element h1[data-slotted] span { background-color: blue; }')
})

test('handle composed element selecor with any', async () => {
  const css = '::slotted(h1 span *) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element h1[data-slotted] span * { background-color: blue; }')
})