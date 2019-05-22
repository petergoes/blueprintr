function hydrate() {
  Array.from(document.querySelectorAll('[data-ssr="serialized"]'))
    .forEach(el => {
      const lightDom = el.querySelector('[type="ssr-light-dom"]')
      const lightDomContent = lightDom && lightDom.content
      const dataElement = el.querySelector('[type="ssr-data"]')
      const dataContent = dataElement && dataElement.innerText
      const data = dataContent && JSON.parse(dataContent)

      Array.from(el.childNodes).forEach(node => {
        console.log(node.nodeName)
        if (node !== lightDom) {
          node.parentElement.removeChild(node)
        }
      })

      lightDomContent && Array.from(lightDomContent.childNodes).forEach(node => el.appendChild(node))
      lightDom && lightDom.parentElement.removeChild(lightDom)
      dataElement && dataElement.parentElement && dataElement.parentElement.removeChild(dataElement)
      data && Object.keys(data).forEach(key => {
        el[key] = data[key]
      })

      el.setAttribute('data-ssr', 'hydrated')
    })

  Array.from(document.querySelectorAll('style[data-ssr-element]'))
    .forEach(el => el.parentElement.removeChild(el))
}

module.exports = `<script>${hydrate.toString()}; hydrate();</script>`