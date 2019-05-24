function hydrate() {
  function isElementWithNameAndType(nodeName, type) {
    return function(node) {
      return node.nodeName === nodeName && node.getAttribute('type') === type
    }
  }

  function hydrateElement(el) {
    const lightDom = Array.from(el.children).find(isElementWithNameAndType('TEMPLATE', 'ssr-light-dom'))
    const lightDomContent = lightDom && lightDom.content
    const dataElement = Array.from(el.children).find(isElementWithNameAndType('SCRIPT', 'ssr-data'))
    const dataContent = dataElement && dataElement.innerText
    const data = dataContent && JSON.parse(dataContent)

    Array.from(el.childNodes).forEach(node => {
      if (node !== lightDom) {
        node.parentElement.removeChild(node)
      }
    })

    lightDomContent && Array.from(lightDomContent.childNodes).forEach(function(node) { return el.appendChild(node) })
    lightDom && lightDom.parentElement.removeChild(lightDom)
    dataElement && dataElement.parentElement && dataElement.parentElement.removeChild(dataElement)
    data && Object.keys(data).forEach(key => {
      el[key] = data[key]
    })

    el.setAttribute('data-ssr', 'hydrated')
  }

  Array.from(document.querySelectorAll('[data-ssr="serialized"]:not(:defined)'))
    .reduce(function(acc, node) {
      acc.indexOf(node.nodeName) === -1 && acc.push(node.nodeName)
      return acc
    }, [])
    .forEach(function(name) {
      var nodeName = name.toLowerCase()
      customElements.whenDefined(nodeName)
        .then(function() {
          Array.from(document.querySelectorAll(nodeName + '[data-ssr="serialized"]'))
            .forEach(hydrateElement)
        })
        .then(function() {
          Array.from(document.querySelectorAll('style[data-ssr-element="' + nodeName + '"]'))
            .forEach(el => el.parentElement.removeChild(el))
        })
    })
}

module.exports = `<script>${hydrate.toString()}; hydrate();</script>`