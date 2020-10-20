import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toJSON } from '../util';
import Properties from './properties';
import swoof from '../swoof';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
    defineHiddenProperty(this, '_properties', new Properties(this));
  }

  define(...args) {
    return this._properties.define(...args);
  }

  _notifyDidChange() {
    this._writable.set(this);
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    this._subscribed = true;
    let observing = swoof._registerObserving(this);
    let properties = this._properties.startObserving();
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      properties();
      unsubscribe();
      observing();
    }
  }

  toString() {
    return toString(this, this.toStringExtension);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
