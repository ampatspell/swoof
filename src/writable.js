import { writable } from 'svelte/store';
import { toString, toJSON, objectToJSON } from './util';

class Writable {

  constructor(model) {
    this.model = model;
    this.writable = writable(model, () => this.bind());
    this.bound = false;
  }

  notifyDidChange() {
    this.writable.set(this.model);
  }

  bind() {
    let cancel = this.model.bind(() => this.notifyDidChange());
    this.bound = true;
    return () => {
      this.bound = false;
      cancel();
    }
  }

  subscribe(...args) {
    return this.writable.subscribe(...args);
  }

  get serialized() {
    let { model } = this;
    return {
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

let wrap = model => new Writable(model);

export default wrap;
