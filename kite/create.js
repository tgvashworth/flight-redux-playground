import flight from "flightjs";
import withState from "flight-with-state";

import { h, create, diff, patch } from "virtual-dom";

const compose = (f, g) => v => f(g(v));

const noop = () => {};
const Base = flight.component(withState, function base() {});

export const createClass = (function () {
  var special = {
    attributes: true,
    initialState: true,
    defaultAttrs: true,
    initialize: true,
    teardown: true
  };

  return function createClass(spec = {}) {
    return Base.mixin(function () {
      this.attributes(spec.attributes || {});
      this.initialState(spec.initialState || {});
      this.after("initialize", spec.initialize || noop);
      this.before("teardown", spec.teardown || noop);
      Object.keys(spec || {})
        .filter(k => !special[k])
        .reduce((self, k) => {
          self[k] = spec[k];
          return self;
        }, this);
    });
  }
}());

export const createRenderComponent = compose(createClass, (spec = {}) => {
  const _initialize = spec.initialize || noop;
  return Object.assign(spec, {
    initialize() {
      this.after("stateChanged", this.render);
      _initialize.call(this);
      this.render();
    },
    render: spec.render || noop
  });
});

export const createVDOMComponent = compose(createRenderComponent, (spec = {}) => {
  const _render = spec.render || noop;
  return Object.assign(spec, {
    h,
    render: function () {
      if (!this.tree) {
        this.tree = _render.call(this);
        this.rootNode = create(this.tree);
        return this.node.appendChild(this.rootNode);
      }
      const newTree = _render.call(this);
      const patches = diff(this.tree, newTree);
      this.rootNode = patch(this.rootNode, patches);
      this.tree = newTree;
    }
  });
});

export const createObserverComponent = compose(createVDOMComponent, (spec = {}) => {
  return Object.assign(spec, {
    next(nextAttr) {
      this.attr = Object.assign(this.attr, nextAttr || {});
      this.stateChanged();
    },
    complete() {
      this.teardown();
    }
  });
});

export default function createComponent(...args) {
  return createObserverComponent(...args);
}
