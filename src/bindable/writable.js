import { writable } from 'svelte/store';
import { assert } from '../util/error';
import Bindable, { _binding, getBinding } from './bindable';

export class Writable {

  constructor(model) {
    assert(model instanceof Bindable, `model ${model} is not Bindable`);
    this.model = model;
    this[_binding] = {
      notifyDidChange: () => this.notifyDidChange()
    }
    this.writable = writable(model, () => this.bind());
  }

  notifyDidChange() {
    this.writable.set(this.model);
  }

  get bound() {
    return getBinding(this.model).isBound;
  }

  bind() {
    let binding = getBinding(this.model);
    binding.bind(this);
    return () => binding.unbind(this);
  }

  set() {
  }

  subscribe(...args) {
    return this.writable.subscribe(...args);
  }

  get serialized() {
    let { bound, model } = this;
    return {
      bound,
      model: objectToJSON(model)
    };
  }

  toString() {
    let { bound, model } = this;
    return toString(this, `${bound ? 'bound' : 'unbound'}:${model}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}

export default model => new Writable(model);
