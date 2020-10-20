import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toJSON, isFunction } from '../util';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
    defineHiddenProperty(this, '_observed', Object.create(null));
  }

  define(hash) {
    for(let key in hash) {
      let value = hash[key];
      if(isFunction(value)) {
        value(this, key);
      } else {
        this[key] = value;
      }
    }
  }

  //

  _getValueForObservedKey(key) {
    let def = this._observed[key];
    return def && def.value;
  }

  _setValueForObservedKey(key, value) {
    let def = this._observed[key];
    if(def && def.value === value) {
      return;
    }
    this._stopObservingDefinition(def);
    def = { key, value };
    this._observed[key] = def;
    this._maybeStartObservingDefinition(def);
    return value;
  }

  _stopObservingDefinition(def) {
    if(!def) {
      return;
    }
    let { unsubscribe } = def;
    if(unsubscribe) {
      delete def.unsubscribe;
      unsubscribe();
    }
  }

  _maybeStartObservingDefinition(def) {
    if(!this._subscribed) {
      return;
    }
    let { unsubscribe, value, key } = def;
    if(unsubscribe) {
      return;
    }
    if(!value) {
      return;
    }
    if(!isFunction(value.subscribe)) {
      return;
    }
    def.unsubscribe = value.subscribe(() => this._observedPropertyDidChange(key));
  }

  _startObserving() {
    let { _observed } = this;
    for(let key in _observed) {
      let def = _observed[key];
      this._maybeStartObservingDefinition(def);
    }
  }

  _stopObserving() {
    let { _observed } = this;
    for(let key in _observed) {
      let def = _observed[key];
      this._stopObservingDefinition(def);
    }
  }

  _observedPropertyDidChange() {
    this._notifyDidChange();
  }

  //

  _notifyDidChange() {
    this._writable.set(this);
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    this._subscribed = true;
    let observing = this.store._registerObserving(this);
    this._startObserving();
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      this._stopObserving();
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
