import { toString } from '../../util/util';

export default class Property {

  constructor(binding, key, dependencies) {
    this.binding = binding;
    this.owner = binding.owner;
    this.key = key;
    this.dependencies = new Set(dependencies);
  }

  registerNested(object) {
    this.binding.registerNested(object);
  }

  unregisterNested(object) {
    this.binding.unregisterNested(object);
  }

  notifyDidChange() {
    this.binding.notifyDidChange();
  }

  toString() {
    return toString(this, `${this.owner}:${this.key}`);
  }

}
