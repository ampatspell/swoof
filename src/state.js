import { toString } from './util';

class State {

  constructor() {
    this._snapshots = new Set();
  }

  get snapshots() {
    return [ ...this._snapshots ];
  }

  registerOnSnapshot(model) {
    this._snapshots.add(model);
    return () => {
      this._snapshots.delete(model);
    }
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
