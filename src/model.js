import { writable } from 'svelte/store';
import { defineHiddenProperty } from './util';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_writable', writable(this));
  }

  _notifyDidChange() {
    this._writable.set(this);
  }

  _setState(props, notify) {
    let changed = false;
    for(let key in props) {
      let value  = props[key];
      if(this[key] !== value) {
        this[key] = value;
        changed = true;
      }
    }
    if(changed && notify) {
      this._notifyDidChange();
    }
    return changed;
  }

}
