import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toJSON, isFunction } from '../util';
import swoof from '../swoof';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
    defineHiddenProperty(this, '_observed', Object.create(null));
    defineHiddenProperty(this, '_meta', Object.create(null));
  }

  _defineKeyValue(key, value) {
    if(isFunction(value)) {
      let meta = value(this, key);
      if(meta) {
        this._meta[key] = meta;
      }
    } else {
      this[key] = value;
    }
  }

  _defineHash(hash) {
    for(let key in hash) {
      let value = hash[key];
      this._defineKeyValue(key, value);
    }
  }

  define(...args) {
    if(args.length === 1) {
      this._defineHash(args[0]);
    } else {
      this._defineKeyValue(args[0], args[1]);
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

  _maybeStartObservingDefinition(def, initial) {
    if(!this._subscribed) {
      return;
    }

    let { unsubscribe, value, key } = def;
    if(unsubscribe) {
      return;
    }

    if(value) {
      if(isFunction(value.subscribe)) {
        def.unsubscribe = value.subscribe(() => this._observedPropertyDidChange(key));
        return;
      }
    }

    this._observedPropertyDidChange(key, initial);
  }

  _startObserving() {
    let { _observed } = this;
    for(let key in _observed) {
      let def = _observed[key];
      this._maybeStartObservingDefinition(def, true);
    }
  }

  _stopObserving() {
    let { _observed } = this;
    for(let key in _observed) {
      let def = _observed[key];
      this._stopObservingDefinition(def);
    }
  }

  _notifyObservedProperty(key) {
    let meta = this._meta[key];
    if(!meta) {
      return;
    }
    let { didChange } = meta;
    if(!didChange) {
      return;
    }
    meta.didChange(this[key], key);
  }

  _observedPropertyDidChange(key, initial) {
    if(key && !initial) {
      this._notifyObservedProperty(key);
    }
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
    let observing = swoof._registerObserving(this);
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
