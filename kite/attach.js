export default function attach(Component, node, attr) {
  attr = attr || {};
  const instance = new Component();
  instance.initialize(node, attr);
  return instance;
}

