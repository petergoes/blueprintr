const findInParentheses = require('../lib/find-in-parentheses')

test('find string in parentheses', () => {
    const string = 'some string (with text) in parentheses'
    const result = findInParentheses(string)
    const expected = 'with text'
    expect(result).toBe(expected)
})

test('find string in nested parentheses', () => {
    const string = 'some string (with (nested) text) in parentheses'
    const result = findInParentheses(string)
    const expected = 'with (nested) text'
    expect(result).toBe(expected)
})

test('find string in custom delimiters', () => {
    const string = 'some string [with text] in brackets'
    const result = findInParentheses(string, '[', ']')
    const expected = 'with text'
    expect(result).toBe(expected)
})

test('find string in custom delimiters with special chars', () => {
    const string = 'some string [with="text"] in brackets'
    const result = findInParentheses(string, '[', ']')
    const expected = 'with="text"'
    expect(result).toBe(expected)
})