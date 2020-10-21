import { toString } from './util';
import { writable } from 'svelte/store';

class State {

  constructor() {
    this._snapshots = new Set();
    this._bound = new Set();
    this._writable = writable(this);
  }

  get snapshots() {
    return [ ...this._snapshots ];
  }

  get bound() {
    return [ ...this._bound ];
  }

  _notify() {
    this._writable.set(this);
  }

  registerOnSnapshot(model) {
    this._snapshots.add(model);
    this._notify();
    return () => {
      this._snapshots.delete(model);
      this._notify();
    }
  }

  registerBound(model) {
    this._bound.add(model);
    this._notify();
  }

  unregisterBound(model) {
    this._bound.delete(model);
    this._notify();
  }

  subscribe() {
    return this._writable.subscribe(...arguments);
  }

  toString() {
    return toString(this);
  }

}

const state = new State();

export const registerOnSnapshot = (model, cancel) => {
  let snapshot = state.registerOnSnapshot(model);
  return () => {
    snapshot();
    cancel();
  };
}

export const registerBound = model => state.registerBound(model);
export const unregisterBound = model => state.unregisterBound(model);

export default state;
