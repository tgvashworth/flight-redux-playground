import StyleSheetRegistry from './StyleSheetRegistry'
import { resetCSS, predefinedCSS } from './predefs'

let isRendered = false

function renderToString() {
  const css = StyleSheetRegistry.renderToString()
  isRendered = true
  return `${resetCSS}\n${predefinedCSS}\n${css}`
}

function create(styles = {}) {
  Object.keys(styles).forEach(k => {
    StyleSheetRegistry.registerStyle(styles[k])
  });

  // TODO render

  return styles
}

export default {
  create,
  renderToString,
}
