import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toJSON } from './util';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
    defineHiddenProperty(this, '_observed', Object.create(null));
  }

  observed(key, value) {
    Object.defineProperty(this, key, {
      get() {
        let def = this._observed[key];
        return def && def.value;
      },
      set(value) {
        let def = this._observed[key];
        if(def && def.value === value) {
          return;
        }
        this._stopObservingDefinition(def);
        def = { key, value };
        this._observed[key] = def;
        this._maybeStartObservingDefinition(def);
      }
    });
    this[key] = value;
    return value;
  }

  //

  _stopObservingDefinition(def) {
    if(!def) {
      return;
    }
    let { unsubscribe } = def;
    if(unsubscribe) {
      unsubscribe();
      delete def.unsubscribe;
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
    if(typeof value.subscribe !== 'function') {
      return;
    }
    def.unsubscribe = value.subscribe(() => this._propertyDidChange(key));
  }

  _maybeStartObserving() {
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

  //

  _propertyDidChange() {
    this._notifyDidChange();
  }

  _notifyDidChange() {
    this._writable.set(this);
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    this._subscribed = true;
    this._maybeStartObserving();
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      this._stopObserving();
      unsubscribe();
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
