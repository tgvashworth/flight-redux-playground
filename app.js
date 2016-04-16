import _ from "lodash";

window.$ = window.jQuery = require("jquery");
import flight from "flightjs";
import withState from "flight-with-state";

import { createStore, combineReducers } from "redux";

const noop = () => {};

// UI

const Base = flight.component(withState, function base() {});

const createComponent = (function () {
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

function createRenderComponent(spec) {
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

function attach(Component, node, attr) {
  attr = attr || {};
  const instance = new Component();
  instance.initialize(node, attr);
  return instance;
}

function createObserverComponent(spec) {
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

var Example = createObserverComponent({
  attributes: {
    clicks: 0
  },

  initialize() {
    this.on("click", this.handleClick);
  },

  handleClick(e) {
    store.dispatch({
      type: "INCREMENT"
    });
  },

  render() {
    this.$node.text(
      this.attr.clicks
    );
  }
});

function makeConnect(store) {
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

// store

function counter(state, action) {
  state = state || 0;
  switch (action.type) {
  case 'INCREMENT':
    return state + 1
  case 'DECREMENT':
    return state - 1
  default:
    return state
  }
}

const store = createStore(combineReducers({
  counter: counter
}));

const connect = makeConnect(store);

const ConnectedExample = connect(function (state) {
  return {
    clicks: state.counter
  };
})(Example);

// Let's go!

const example = ConnectedExample.attachTo(window.target);
