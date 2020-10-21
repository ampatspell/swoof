import { defineHiddenProperty, toString, toJSON } from './util';
import { assert } from './error';
import { registerBound, unregisterBound } from './state';

export const _binding = '_binding';
const isBindable = model => model && model[_binding];
export const getBinding = model => isBindable(model) && model[_binding];

class Binding {

  constructor(owner) {
    this.owner = owner;
    this.parent = null;
    this.nested = new Set();
    this.listeners = new Set();
    this.properties = Object.create(null);
  }

  defineProperty(key, value) {
    this.registerNested(value);
    this.properties[key] = value;
    Object.defineProperty(this.owner, key, {
      get: () => {
        return this.properties[key];
      },
      set: value => {
        let current = this.properties[key];
        if(value === current) {
          return;
        }
        this.unregisterNested(current);
        this.properties[key] = value;
        this.registerNested(value);
        this.notifyDidChange();
      }
    });
    return value;
  }

  get isBound() {
    return !!this.parent;
  }

  addDidChangeListener(listener) {
    this.listeners.add(listener);
  }

  removeDidChangeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyDidChange() {
    if(!this.isBound) {
      return;
    }
    this.listeners.forEach(listener => listener(this.owner));
    getBinding(this.parent).notifyDidChange();
  }

  registerNested(model) {
    let binding = getBinding(model);
    if(!binding) {
      return;
    }
    this.nested.add(model);
    if(this.isBound) {
      binding.bind(this.owner);
    }
  }

  unregisterNested(model) {
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
    assert(!this.parent, `${this.owner} is already bound to ${this.parent} while attempting to bind to ${parent}`);
    this.parent = parent;
    registerBound(this.owner);
    this.nested.forEach(model => model[_binding].bind(this.owner));
    this.owner._onBind();
  }

  unbind(parent) {
    assert(this.parent, `${this.owner} is not bound while trying to unbind from ${parent}`);
    assert(this.parent === parent, `${this.owner} is bound to ${this.parent} while trying to unbind from ${parent}`);
    this.parent = null;
    unregisterBound(this.owner);
    this.owner._onUnbind();
    this.nested.forEach(model => model[_binding].unbind(this.owner));
  }

  toString() {
    return toString(this, `owner=${this.owner}:parent=${this.parent}`);
  }

}

export default class Bindable {

  constructor() {
    defineHiddenProperty(this, _binding, new Binding(this));
  }

  property(key, value) {
    return getBinding(this).defineProperty(key, value);
  }

  _notifyDidChange() {
    getBinding(this).notifyDidChange();
  }

  _isBound() {
    return getBinding(this).isBound;
  }

  _onBind() {
  }

  _onUnbind() {
  }

  //

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this);
  }

}
