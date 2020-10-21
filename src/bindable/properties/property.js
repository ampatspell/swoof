import { toString } from '../../util/util';

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

  notifyDidChange() {
    this.binding.notifyDidChange(this.key);
  }

  onDependencyDidChange() {
  }

  onPropertyDidChange(key) {
    let dependency = this.dependencies.find(dep => key.startsWith(dep));
    if(!dependency) {
      return;
    }
    this.onDependencyDidChange(dependency, key);
  }

  onBind() {
  }

  onUnbind() {
  }

  toString() {
    return toString(this, `${this.owner}:${this.key}`);
  }

}
