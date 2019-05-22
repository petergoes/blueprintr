module.exports = async function serialize (rootNode) {
  async function moveStyleToHead (style, customElementName) {
    const ceName = customElementName.toLowerCase()
    const notPresent = document.head.querySelectorAll(`[data-ssr-element="${ceName}"]`).length === 0

    if (style) {
      style.innerHTML = await window.transformCss(style.innerHTML, ceName)
      style.setAttribute('data-ssr-element', ceName)
      style.parentNode.removeChild(style)
      if (notPresent) {
        document.head.appendChild(style)
      }
    }
  }

  async function serializeNode (node) {
    try {
      const lightDomNodes = [...node.childNodes]
      const lightDomHtml = node.innerHTML
      const templateDom = document.createElement('template')
      const scriptData = document.createElement('script')
      const slotsNodes = node.shadowRoot.querySelectorAll('slot')
      const slots = slotsNodes ? [...slotsNodes] : []
      const style = node.shadowRoot.querySelector('style')
      const attributesProperties = node.getAttributeNames()
        .filter(name => name !== 'data-ssr')
        .reduce((obj, name) => {
            return {...obj, [name]: node[name] }
        }, {})

      // remove the style element from the shadow root
      await moveStyleToHead(style, node.nodeName)

      templateDom.setAttribute('type', 'ssr-light-dom')
      templateDom.innerHTML = lightDomHtml

      scriptData.setAttribute('type', 'ssr-data')
      scriptData.innerHTML = JSON.stringify(attributesProperties)

      slots.forEach(slot => {
        if (!slot.getAttribute('name')) {
          slot.setAttribute('name', 'default')
        }
      })

      // move light nodes into shadowDom into their correct slots
      lightDomNodes
        .forEach(lightNode => {
          const targetSlotName = lightNode.nodeName === '#text' 
            ? 'default'
            : lightNode.getAttribute('slot') || 'default'

          const targetSlot = slots.find(slot => {
            const nameOfSlot = slot.getAttribute('name') || 'default'
            return nameOfSlot === targetSlotName 
          })

          if (lightNode.nodeName !== '#text') {
            lightNode.setAttribute('data-slotted', '')
          }

          targetSlot 
            ? targetSlot.parentNode.insertBefore(lightNode, targetSlot)
            : lightNode.parentNode.removeChild(lightNode)

          // indicate that the slot has been filled
          targetSlot && targetSlot.setAttribute('data-slot-filled', 'filled')
        })

      // move shadowDom into root node
      Array.from(node.shadowRoot.childNodes).forEach(shadowNode => {
        shadowNode.parentNode.removeChild(shadowNode)
        node.appendChild(shadowNode)
      })

      // remove slot element only when it's filled
      slots.forEach(slot =>
        slot.getAttribute('data-slot-filled') &&
        slot.parentNode.removeChild(slot)
      )

      // serialize custom element child nodes 
      await serialize(node)

      // add original lightDom as template
      if (templateDom.innerHTML !== '') {
        node.appendChild(templateDom)
      }

      // add data element when filled
      if (scriptData.innerHTML !== '{}') {
        node.appendChild(scriptData)
      }

      // mark element as serialized for hydration script
      node.setAttribute('data-ssr', 'serialized')
    } catch (err) {
        console.log('error:', err.message)
    }
  }
  
  const promises = [...rootNode.querySelectorAll('*')]
      .filter(element => /-/.test(element.nodeName))
      .map(element => serializeNode(element))

  Promise.all(promises)
}
