import { toString } from './util/util';
import { writable } from 'svelte/store';

class State {

  constructor() {
    this._snapshots = new Set();
    this._bound = new Set();
    this._roots = new Set();
    this._writable = writable(this);
  }

  get snapshots() {
    return [ ...this._snapshots ];
  }

  get bound() {
    return [ ...this._bound ];
  }

  get roots() {
    return [ ...this._roots ];
  }

  _notify() {
    this._writable.set(this);
  }

  registerRoot(model) {
    this._roots.add(model);
    this._notify();
    return () => {
      this._roots.delete(model);
      this._notify();
    }
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

export const registerRoot = model => state.registerRoot(model);

export const registerBound = model => state.registerBound(model);
export const unregisterBound = model => state.unregisterBound(model);

export default state;
