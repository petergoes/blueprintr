function split(selector) {
    let index = 0
    let level = 0
    let start = 0
    let list = []

    do {
        const char = selector[index]

        if (char === '(' || char === '[') {
            level += 1
        }

        if (char === ')' || char === ']') {
            level -= 1
        }

        if (char === ' ' && level === 0) {
            const substr = selector.slice(start, index)
            list.push(substr)
            start = index + 1
        }

        index += 1
    } while (index <= selector.length)
    
    list.push(selector.slice(start))
    
    return list
}

module.exports = split
