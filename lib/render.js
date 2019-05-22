const puppeteer = require('puppeteer')

const serialize = require('./serialize')
const hydrate = require('./hydrate')
const transformCss = require('./transform-css')

const renderPage = browser => url => {
  return new Promise(async (resolve, reject) => {
    const page = await browser.newPage()

    page.on('console', event => console.log(event.text()))

    page.on('load', async (...args) => {
      await page.exposeFunction('transformCss', transformCss)
      await page.$eval('html', serialize)
      const pageContent = await page.content()

      resolve(
        pageContent.replace('</body>', `${hydrate}</body>`)
      )
    })

    await page.goto(url)
  })
}

async function render(pages = []) {
  const browser = await puppeteer.launch()
  const renderWithBrowser = renderPage(browser)
  const promises = pages.map(renderWithBrowser)
  return Promise.all(promises)
    .then(pages => {
      browser.close();
      return pages
    })
}

module.exports = render