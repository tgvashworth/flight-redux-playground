import hyphenate from './hyphenate'

let stylesCache = {}
let uid = 0

function createCssDeclarations(style) {
  return Object.keys(style).map(prop => {
    const property = hyphenate(prop)
    const value = style[prop]
    return `${property}:${value};`
  }).sort().join('')
}

function renderToString() {
  let css = `/* ${uid} unique declarations */`
  return Object.keys(stylesCache).reduce((css, k) => {
    const id = stylesCache[k].id
    const style = stylesCache[k].style
    const declarations = createCssDeclarations(style)
    const rule = `\n.${id}{${declarations}}`
    return css + rule
  }, css)
}

export default {
  renderToString
}
