import StyleSheetRegistry from './StyleSheetRegistry'
import { resetCSS, predefinedCSS } from './predefs'

let isRendered = false

function renderToString() {
  const css = StyleSheetRegistry.renderToString()
  isRendered = true
  return `${resetCSS}\n${predefinedCSS}\n${css}`
}

export default {
  renderToString
}
