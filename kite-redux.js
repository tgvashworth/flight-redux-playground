import _ from "lodash";
import { createClass, attach } from "./kite";

export function makeConnect(store) {
  return function connect(mapStateToProps = _.identity) {
    return function (Component) {
      return createClass({
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

