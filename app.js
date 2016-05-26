import _ from "lodash";

window.$ = window.jQuery = require("jquery");
import { createStore, combineReducers } from "redux";
import cx from "classnames";
import { h } from "virtual-dom";

import { makeConnect } from "./kite-redux";
import { createComponent, attach } from "./kite";
import StyleSheet from "./StyleSheet";

// UI

const styles = StyleSheet.create({
  button: {
    fontSize: "1rem",
    padding: "3em",
    width: "100%",
    border: "5px solid rgba(0,0,0,0.5)",
    outlineColor: "rgba(255,255,255,0.2)",
    outlineStyle: "solid"
  }
});
const styles2 = StyleSheet.create({
  root: {
    padding: "3em"
  }
});

var Example = createComponent({
  attributes: {
    clicks: 0,
    button: "button"
  },

  initialize() {
    this.on("click", {
      button: this.handleClick
    });
  },

  handleClick(e) {
    store.dispatch({
      type: "INCREMENT"
    });
  },

  render() {
    const { clicks } = this.attr;
    return h("div", {
      className: cx(styles2.root),
      style: {
        backgroundColor: `hsl(${clicks * 10 + 20}, 50%, 20%)`
      }
    }, [
      h("button", {
        className: cx(styles.button),
        style: {
          color: `hsl(${clicks * 10}, 50%, 60%)`,
          backgroundColor: `hsl(${clicks * 10 - 22.5}, 50%, 20%)`
        }
      }, [
        `Clicks: ${clicks}`
      ])
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

window.example = attach(ConnectedExample, window.target);
