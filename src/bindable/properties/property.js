import { toString, join } from '../../util/util';

export default class Property {

  constructor(binding, key, dependencies) {
    this.binding = binding;
    this.owner = binding.owner;
    this.key = key;
    this.dependencies = [ ...new Set(dependencies) ];
  }

  registerNested(object, key) {
    this.binding.registerNested(this, object, key);
  }

  unregisterNested(object) {
    this.binding.unregisterNested(this, object);
  }

  notifyDidChange(key, local) {
    let path = join([ this.key, key ], '.');
    this.binding.notifyDidChange(path, local);
  }

  onDependencyDidChange() {
  }

  onPropertyDidChange(key) {
    if(!this.dependencies.includes(key)) {
      return;
    }
    this.onDependencyDidChange(key);
  }

  onBind() {
  }

  onUnbind() {
  }

  toString() {
    return toString(this, `${this.owner}:${this.key}`);
  }

}
