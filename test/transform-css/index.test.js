const transformCss = require('../../lib/transform-css')

test('append element name to selector that does not have :host or :host-context', async () => {
  expect(await transformCss(
    'element { background-color: blue; }',
    'x-element'))
  .toBe('x-element element { background-color: blue; }')

  expect(await transformCss(
    '#id { background-color: blue; }',
    'x-element'))
  .toBe('x-element #id { background-color: blue; }')

  expect(await transformCss(
    '.class { background-color: blue; }',
    'x-element'))
  .toBe('x-element .class { background-color: blue; }')

  expect(await transformCss(
    '[foo="bar"] { background-color: blue; }',
    'x-element'))
  .toBe('x-element [foo="bar"] { background-color: blue; }')

  expect(await transformCss(
    '::slotted(*) { background-color: blue; }',
    'x-element'))
  .toBe('x-element *[data-slotted] { background-color: blue; }')
})

test('do not append element name to selector that contains does have :host', async () => {
  const css = ':host { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('x-element { background-color: blue; }')
})

test('do not append element name to selector that contains does have :host-context', async () => {
  const css = ':host-context(.footer) { background-color: blue; }'
  const elementName = 'x-element'
  const result = await transformCss(css, elementName)
  expect(result).toBe('.footer x-element { background-color: blue; }')
})