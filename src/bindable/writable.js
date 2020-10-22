import { writable } from 'svelte/store';
import { assert } from '../util/error';
import Model, { _binding, getBinding } from './model';
import { registerRoot } from '../state';

export class Writable {

  constructor(model) {
    assert(model instanceof Model, `model ${model} is not Model`);
    this.model = model;
    this[_binding] = {
      notifyDidChange: path => this.notifyDidChange(path)
    }
    this.writable = writable(model, () => this.bind());
  }

  notifyDidChange() {
    this.writable.set(this.model);
  }

  get value() {
    return this.model;
  }

  get isBound() {
    return getBinding(this.model).isBound;
  }

  bind() {
    let { model } = this;
    let binding = getBinding(model);
    let root = registerRoot(model);
    binding.bind(this);
    return () => {
      binding.unbind(this);
      root();
    };
  }

  set() {
  }

  subscribe(...args) {
    return this.writable.subscribe(...args);
  }

  get serialized() {
    let { isBound: bound, model } = this;
    return {
      bound,
      model: objectToJSON(model)
    };
  }

  toString() {
    let { isBound, model } = this;
    return toString(this, `${isBound ? 'bound' : 'unbound'}:${model}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}

export default (model, opts={}) => new Writable(model);
