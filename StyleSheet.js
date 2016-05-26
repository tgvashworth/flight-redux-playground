import fastdom from "fastdom";

const resetCSS =
`html {font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0,0,0,0)}
body {margin:0}
button::-moz-focus-inner, input::-moz-focus-inner {border:0;padding:0}
input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-decoration {display:none}`

const state = {
  m: {
    dxc: {},
    kxc: {},
    cs: 0
  },
  sheet: document.createElement("style")
};

// Modify that page. Where should this go?
document.head.appendChild(state.sheet);

function prop(s) {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function declaration(k, v) {
  return `${prop(k)}: ${v.trim()}`;
}

function dxcToCss(dxc = {}) {
  return Object.keys(dxc).reduce(
    (css, d) => `${css}.${prefix(dxc[d])}{${d}}`,
    ""
  );
}

function updateSheet() {
  // Update the stylesheet.
  fastdom.clear(state.fastdomid);
  state.fastdomid = fastdom.mutate(() => {
    state.sheet.textContent = `${resetCSS}\n${dxcToCss(state.m.dxc)}`;
  });
}

const prefix = c => `_${c}`;

export function create(o) {
  // Process style styles to produce a memory (m) blob of:
  //  - dxc: a deduped map of (declaration -> classnum)
  //  - kxc: a map from the original (key -> (classname -> true))
  //  - cs: a count of the highest classnum reached
  const { dxc, kxc, cs } = Object.keys(o).reduce(
    // k is the main key on the styles object (o) used to group styles.
    (acc, k) => Object.keys(o[k]).reduce(
      // prop is the specific CSS property being changed.
      ({dxc, kxc, cs}, prop) => {
        // Produce a declaration (d) from the prop and the value.
        // This is the value we dedupe on, so work will have to happen later on
        // to combine identical but "spelled different" declarations
        const d = declaration(prop, o[k][prop]);
        // c is the resulting classnumb. We look in the existing dxc map for
        // something that matches first. If none exists, we create it!
        const c = (
          typeof dxc[d] === "number" ?
            dxc[d] :
            cs + 1
        );
        // Return a new memory (m) blob resulting max classnum and updated maps
        return {
          cs: Math.max(cs, c),
          dxc: {
            ...dxc,
            [d]: c
          },
          kxc: {
            ...kxc,
            [k]: {
              ...(kxc[k] || {}),
              // prefix: (classnum -> classname)
              [prefix(c)]: true
            }
          }
        };
      },
      acc
    ),
    // The initial value for the reduce is the existing memory (m) blob
    state.m
  );
  // Remember the new values
  state.m = { dxc, kxc, cs };
  updateSheet();
  // The returned object maps the original group key to the new classnames object
  return Object.keys(o).reduce(
    (res, k) => ({ ...res, [k]: kxc[k] }),
    {}
  );
}

export default {
  create
}
