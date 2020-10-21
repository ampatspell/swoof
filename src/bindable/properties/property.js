import { toString } from '../../util';

export default class Property {

  constructor(binding, key) {
    this.binding = binding;
    this.owner = binding.owner;
    this.key = key;
  }

  registerNested() {
    this.binding.registerNested();
  }

  unregisterNested() {
    this.binding.unregisterNested();
  }

  notifyDidChange() {
    this.binding.notifyDidChange();
  }

  toString() {
    return toString(this, `${this.owner}:${this.key}`);
  }

}
