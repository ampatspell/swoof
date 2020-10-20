import JSON from './components/JSON.svelte';
import swoof from './swoof';
import { setGlobal, isServerTimestamp, isTimestamp, objectToJSON, get, set } from './util';
import Model from './model/model';
import * as computed from './model/computed';

export {
  JSON,
  setGlobal,
  isServerTimestamp,
  isTimestamp,
  objectToJSON,
  swoof,
  get,
  set,
  Model,
  computed
}

export default swoof;
