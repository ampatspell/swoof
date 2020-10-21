import JSON from './components/JSON.svelte';
import swoof from './swoof';
import state from './state';
import { setGlobal, isServerTimestamp, isTimestamp, objectToJSON, toString, toJSON, get, set } from './util';

import Bindable from './bindable/bindable';
import writable from './bindable/writable';
import * as computed from './bindable/computed';

export {
  JSON,

  swoof,
  state,

  setGlobal,
  objectToJSON,
  toString,
  toJSON,

  isServerTimestamp,
  isTimestamp,

  get,
  set,

  writable,
  Bindable,
  computed
}

export default swoof;
