function prop(s) {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function declaration(k, v) {
  return `${prop(k)}: ${v.trim()}`;
}

function dxcToCss(dxc = {}) {
  return Object.keys(dxc).reduce(
    (css, d) => `${css}\n.${prefix(dxc[d])}{${d}}`,
    ""
  );
}

const prefix = c => `__${c}`;

const Style = {
  sx(o) {
    return Object.keys(o).reduce(
      (style, k) => (
        typeof o[k] === "string" || typeof o[k] === "number" ?
          `${style}; ${declaration(k, o[k])}` :
          style),
      ""
    );
  },

  cx(o) {
    return Object.keys(o).map(prefix).join(' ');
  },

  m: {
    dxc: {},
    kxc: {},
    cs: 0
  },

  create(o) {
    // Process style styles to produce a memory (m) blob of:
    //  - dxc: a deduped map of (declaration -> classnum)
    //  - kxc: a map from the original (key -> (classnum -> true))
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
                [c]: true
              }
            }
          };
        },
        acc
      ),
      // The initial value for the reduce is the existing memory (m) blob
      Style.m
    );
    // Update the stylesheet.
    // TODO we recalc the whole thing. Sensible?
    document.getElementById('style').textContent = dxcToCss(dxc);
    // Remember the new values
    Style.m = { dxc, kxc, cs };
    // The returned object maps the original group key to the new classnums
    return kxc;
  }
};

export default Style;
