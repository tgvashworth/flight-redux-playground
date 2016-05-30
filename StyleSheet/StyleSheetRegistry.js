import prefixAll from 'inline-style-prefix-all'
import hyphenate from './hyphenate'
import expandStyle from './expandStyle'
import flattenStyle from './flattenStyle'
import processTransform from './processTransform'

let stylesCache = {}
let uid = 0

const getCacheKey = (prop, value) => `${prop}:${value}`

function normalizeStyle(style) {
  return processTransform(expandStyle(flattenStyle(style)))
}

// Render

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

function resolve(style = {}) {
  const normalizedStyle = normalizeStyle(style)

  return Object.keys(normalizedStyle).reduce((result, prop) => {
    const value = normalizedStyle[prop]
    const cacheKey = getCacheKey(prop, value)
    const id = stylesCache[cacheKey].id
    result[id] = true
    return result
  }, {})
}

// Registration

function registerStyle(style = {}) {
  const normalizedStyle = normalizeStyle(style)

  Object.keys(normalizedStyle).forEach(prop => {
    const value = normalizedStyle[prop]
    const cacheKey = getCacheKey(prop, value)
    const exists = stylesCache[cacheKey] && stylesCache[cacheKey].id
    if (!exists) {
      const id = ++uid
      // add new declaration to the store
      stylesCache[cacheKey] = {
        id: `_${id}`,
        style: prefixAll({ [prop]: value })
      }
    }
  })

  return style
}

export default {
  registerStyle,
  renderToString,
  resolve,
}
