window.$ = window.jQuery = require("jquery");
import flight from "flightjs";
import withState from "flight-with-state";

import { create, diff, patch } from "virtual-dom";

const noop = () => {};
const Base = flight.component(withState, function base() {});

export const createComponent = (function () {
  var special = {
    attributes: true,
    initialState: true,
    defaultAttrs: true,
    initialize: true,
    teardown: true
  };

  return function createComponent(spec = {}) {
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

export function createRenderComponent(spec = {}) {
  const _initialize = spec.initialize || noop;
  return createComponent(Object.assign(spec, {
    initialize() {
      this.after("stateChanged", this.render);
      _initialize.call(this);
      this.render();
    },
    render: spec.render || noop
  }));
}

export function createVDOMComponent(spec = {}) {
  const _render = spec.render || noop;
  return createRenderComponent(Object.assign(spec, {
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
  }));
}

export function attach(Component, node, attr) {
  attr = attr || {};
  const instance = new Component();
  instance.initialize(node, attr);
  return instance;
}

export function createObserverComponent(spec) {
  spec = spec || {};
  var Component = createVDOMComponent(Object.assign(spec, {
    next(nextAttr) {
      this.attr = Object.assign(this.attr, nextAttr || {});
      this.stateChanged();
    },
    complete() {
      this.teardown();
    }
  }));

  Component.attachTo = function (node, attr) {
    return attach(this, node, attr);
  };

  return Component;
}

export function makeConnect(store) {
  return function connect(mapStateToProps = _.identity) {
    return function (Component) {
      return createComponent({
        initialize() {
          var child = attach(Component, this.$node, this.attr);
          var unsubscribe = store.subscribe(() => {
            child.next(
              mapStateToProps(store.getState())
            );
          });

          this.before('teardown', () => {
            unsubscribe();
            child.complete();
          });
        }
      });
    };
  };
}

