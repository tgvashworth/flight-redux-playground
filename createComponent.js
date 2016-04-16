window.$ = window.jQuery = require("jquery");
import flight from "flightjs";
import withState from "flight-with-state";

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

export function createRenderComponent(spec) {
  spec = spec || {};
  return createComponent(Object.assign(spec, {
    _initialize: spec.initialize,
    initialize() {
      this.after("stateChanged", this.render);
      this._initialize();
      this.render();
    },
    render: spec.render || noop
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
  var Component = createRenderComponent(Object.assign(spec, {
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
  return function connect(mapStateToProps = _identity) {
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

