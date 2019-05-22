function find(string, startDelimiter = '(', endDelimiter = ')') {
    let start = -1
    let end = -1
    let level = 0
    let index = 0
    let substring = ''
    let found = false
    do {
        const char = string[index]
        
        if (char === startDelimiter) {
            if (start === -1) {
                start = index
            }
            level += 1
        }

        if (char === endDelimiter) {
            level -= 1
            if (level === 0) {
                end = index
                substring = string.slice(start + 1, end)
                found = true
            }
        }

        index += 1
    } while ((start < 0 || end < 0 || index < string.length) && found === false)

    return substring
}

module.exports = find
