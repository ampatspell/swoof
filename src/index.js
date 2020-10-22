import JSON from './components/JSON.svelte';

import swoof from './swoof';
import state from './state';

import { setGlobal, isServerTimestamp, isTimestamp, objectToJSON, toString, toJSON, get, set } from './util/util';
import { SwoofError, error, assert } from './util/error';

import Model from './bindable/model';
import writable from './bindable/writable';
import * as computed from './bindable/properties/definitions';

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

  SwoofError,
  error,
  assert,

  writable,
  Model,
  computed
}
