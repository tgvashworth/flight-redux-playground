import _ from "lodash";

import { createStore, combineReducers } from "redux";
import { makeConnect, createObserverComponent } from "./createComponent.js";

import { h } from "virtual-dom";


// UI

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
    return h("button", {}, [
      String(this.attr.clicks)
    ]);
  }
});

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
