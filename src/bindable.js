import { defineHiddenProperty, toString } from './util';
import { assert } from './error';
import { registerBound, unregisterBound } from './state';

const _binding = '_binding';
const isBindable = model => model instanceof Bindable;
const getBinding = model => isBindable(model) && model[_binding];

class Binding {

  constructor(owner) {
    this.owner = owner;
    this.parent = null;
    this.nested = new Set();
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

  notifyDidChange() {
    if(!this.isBound) {
      return;
    }
    this.parent._nestedDidChange(this);
  }

  registerNested(model) {
    if(!isBindable(model)) {
      return;
    }
    this.nested.add(model);
    if(this.isBound) {
      model._bind(this.owner);
    }
  }

  unregisterNested(model) {
    if(!isBindable(model)) {
      return;
    }
    if(this.isBound) {
      model._unbind(this.owner);
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
    return this[_binding].defineProperty(key, value);
  }

  get _isBindable() {
    return true;
  }

  get _parent() {
    return this[_binding].parent;
  }

  get _isBound() {
    return this[_binding].isBound;
  }

  _onBind() {
  }

  _onUnbind() {
  }

  _registerNested(model) {
    this[_binding].registerNested(model);
    return model;
  }

  _unregisterNested(model) {
    this[_binding].unregisterNested(model);
  }

  _bind(parent) {
    this[_binding].bind(parent);
  }

  _unbind(parent) {
    this[_binding].unbind(parent);
  }

  _nestedDidChange() {
    this[_binding].notifyDidChange();
  }

  //

  toString() {
    return toString(this);
  }

}
