import { writable } from 'svelte/store';
import { assert } from './error';
import Bindable from './bindable';

export class Writable {

  constructor(model) {
    assert(model instanceof Bindable, `model ${model} is not Bindable`);
    this.model = model;
    this.writable = writable(model, () => this.bind());
  }

  notifyDidChange() {
    this.writable.set(this.model);
  }

  get isBound() {
    return this.model._isBound;
  }

  _nestedDidChange() {
    this.notifyDidChange();
  }

  bind() {
    this.model._bind(this);
    return () => {
      this.model._unbind(this);
    }
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

export default model => new Writable(model);
