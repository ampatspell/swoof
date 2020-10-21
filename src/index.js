import JSON from './components/JSON.svelte';
import swoof from './swoof';
import state from './state';
import { setGlobal, isServerTimestamp, isTimestamp, objectToJSON, toString, toJSON, get, set } from './util';
import Model from './model/model';
import * as computed from './model/computed';
import writable from './writable';

export {
  JSON,
  setGlobal,
  isServerTimestamp,
  isTimestamp,
  objectToJSON,
  toString,
  toJSON,
  swoof,
  state,
  get,
  set,
  Model,
  computed,
  writable
}

export default swoof;
