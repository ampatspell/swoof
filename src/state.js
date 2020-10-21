import { toString } from './util';
import { writable } from 'svelte/store';

class State {

  constructor() {
    this._snapshots = new Set();
    this._writable = writable(this);
  }

  get snapshots() {
    return [ ...this._snapshots ];
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

export default state;
