var _ = require("lodash");

window.$ = window.jQuery = require("jquery");
var flight = require("flightjs");
var withState = require("flight-with-state");

var redux = require("redux");
var createStore = redux.createStore;
var combineReducers = redux.combineReducers;

// UI

var Base = flight.component(withState, function base() {});

var special = {
  attributes: true,
  initialState: true,
  defaultAttrs: true,
  initialize: true,
  teardown: true
};

function createComponent(spec) {
  spec = spec || {};
  return Base.mixin(function () {
    this.attributes(spec.attributes || {});
    this.initialState(spec.initialState || {});
    this.after("initialize", spec.initialize || function () {});
    this.before("teardown", spec.teardown || function () {});
    Object.keys(spec || {})
      .filter(function (k) { return !special[k]; })
      .reduce(function (self, k) {
        self[k] = spec[k];
        return self;
      }, this);
  });
}

function createRenderComponent(spec) {
  spec = spec || {};
  return createComponent(Object.assign(spec, {
    _initialize: spec.initialize,
    initialize: function () {
      this.after("stateChanged", this.render);
      this._initialize();
      this.render();
    },
    render: spec.render || function () {}
  }));
}

function createObserverComponent(spec) {
  spec = spec || {};
  return createRenderComponent(Object.assign(spec, {
    next: function (next) {
      this.attr = Object.assign(this.attr, next || {});
      this.stateChanged();
    },
    complete: function () {
      this.teardown();
    }
  }));
}

function attach(Component, node, attr) {
  attr = attr || {};
  var instance = new Component();
  instance.initialize(node, attr);
  return instance;
}

var Example = createObserverComponent({
  attributes: {
    clicks: 0
  },

  initialize: function () {
    this.on("click", this.handleClick);
  },
  
  handleClick: function (e) {
    store.dispatch({
      type: "INCREMENT"
    });
  },
  
  render: function () {
    this.$node.text(
      this.attr.clicks
    );
  }
});

function makeConnect(store) {
  return function connect(mapStateToProps) {
    mapStateToProps = mapStateToProps || _.identity;
    return function (Component) {
      return createComponent({
        initialize: function () {
        	var child = attach(Component, this.$node, this.attr);
          var unsubscribe = store.subscribe(function () {
            child.next(
              mapStateToProps(store.getState())
            );
          });
          
          this.before('teardown', unsubscribe);
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

var store = createStore(combineReducers({
  counter: counter
}));

var connect = makeConnect(store);

// Let's go!

var ConnectedExample = connect(function (state) {
  return {
    clicks: state.counter
  };
})(Example);
var example = attach(ConnectedExample, window.target);