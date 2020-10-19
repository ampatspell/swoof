import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toJSON } from './util';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
  }

  _notifyDidChange() {
    this._writable.set(this);
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    this._subscribed = true;
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      unsubscribe();
    }
  }

  toString() {
    return toString(this, `${this.path}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
