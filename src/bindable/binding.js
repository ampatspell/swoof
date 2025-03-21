import { toString, join } from '../util/util';
import { assert } from '../util/error';
import { registerBound, unregisterBound } from '../state';

export const _binding = '_binding';
export const isBindable = model => model && !!model[_binding];
export const getBinding = model => isBindable(model) && model[_binding];

export default class Binding {

  constructor(owner) {
    this.owner = owner;
    this.parent = null;
    this.nested = new Set();
    this.listeners = new Set();
    this.properties = {
      byKey: Object.create(null),
      all: []
    };
  }

  defineProperty(key, definition={}) {
    let { _isPropertyDefinition, factory, opts } = definition;
    assert(typeof key === 'string', 'property() first argument must be string');
    assert(_isPropertyDefinition, 'property() second argument must be property definition');
    let { dependencies } = opts;
    let property = new factory(this, key, dependencies, opts);
    this.properties.byKey[key] = property;
    this.properties.all.push(property);
    property.define();
  }

  get isBound() {
    return !!this.parent;
  }

  addNotifyDidChangeListener(listener) {
    this.listeners.add(listener);
  }

  removeNotifyDidChangeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyDidChange(key, local) {
    assert(!!key, 'Missing key for notifyDidChange');
    assert(local === undefined || typeof local === 'boolean', 'Local must be either undefined or boolean');

    if(!this.isBound) {
      return;
    }

    this.properties.all.forEach(property => {
      if(property.key === key) {
        return;
      }
      property.onPropertyDidChange(key);
    });

    this.listeners.forEach(listener => listener(key));

    if(!local) {
      let path = join([ this.key, key ], '.');
      getBinding(this.parent).notifyDidChange(path);
    }
  }

  registerNested(property, model, key) {
    let binding = getBinding(model);
    if(!binding) {
      return;
    }
    let path = join([ property.key, key ], '.');
    binding.key = path;
    this.nested.add(model);
    if(this.isBound) {
      binding.bind(this.owner);
    }
  }

  unregisterNested(property, model) {
    let binding = getBinding(model);
    if(!binding) {
      return;
    }
    if(this.isBound) {
      binding.unbind(this.owner);
    }
    this.nested.delete(model);
  }

  bind(parent) {
    assert(!this.parent, () => `${this.owner} is already bound to ${this.parent} while attempting to bind it to ${parent}`);
    this.parent = parent;
    registerBound(this.owner);
    this.nested.forEach(model => getBinding(model).bind(this.owner));
    this.properties.all.forEach(property => property.onBind());
    this.owner._onBind();
  }

  unbind(parent) {
    assert(this.parent, () => `${this.owner} is not bound while trying to unbind from ${parent}`);
    assert(this.parent === parent, () => `${this.owner} is bound to ${this.parent} while trying to unbind it from ${parent}`);
    this.parent = null;
    unregisterBound(this.owner);
    this.owner._onUnbind();
    this.nested.forEach(model => getBinding(model).unbind(this.owner));
    this.properties.all.forEach(property => property.onUnbind());
  }

  toString() {
    return toString(this, `owner=${this.owner}:parent=${this.parent}`);
  }

}
