import StyleSheetRegistry from './StyleSheetRegistry'
import { resetCSS, predefinedCSS } from './predefs'

const ELEMENT_ID = '__stylesheet'
let isRendered = false
let lastStyleSheet = ''

function renderSheet() {
  let styleElem = document.getElementById(ELEMENT_ID)
  if (!styleElem) {
    styleElem = document.createElement('style')
    styleElem.id = ELEMENT_ID
    document.head.appendChild(styleElem)
  }

  const newStyleSheet = renderToString()
  if (lastStyleSheet !== newStyleSheet) {
    styleElem.textContent = newStyleSheet
    lastStyleSheet = newStyleSheet
  }
}

function renderToString() {
  const css = StyleSheetRegistry.renderToString()
  isRendered = true
  return `${resetCSS}\n${predefinedCSS}\n${css}`
}

function create(styles = {}) {
  Object.keys(styles).forEach(k => {
    StyleSheetRegistry.registerStyle(styles[k])
  });

  // Already rendered once, so we have to update the existing sheet
  if (isRendered) {
    renderSheet();
  }

  return Object.keys(styles).reduce((result, k) => {
    result[k] = StyleSheetRegistry.resolve(styles[k])
    return result;
  }, {});
}

function inject() {
  renderSheet();
}

export default {
  create,
  inject,
  renderToString,
}
