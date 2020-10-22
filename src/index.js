import swoof from './swoof';
import state from './state';

import {
  setGlobal,
  isServerTimestamp,
  isTimestamp,
  objectToJSON,
  publicToString as toString,
  publicToPrimitive as toPrimitive,
  publicToJSON as toJSON,
  get,
  set
} from './util/util';

import { SwoofError, error, assert } from './util/error';

import load from './util/resolve';

import Model from './bindable/model';
import writable from './bindable/writable';
import * as properties from './bindable/properties/definitions';

import User from './store/auth/user';

export {
  swoof,
  state,

  setGlobal,
  objectToJSON,
  toString,
  toPrimitive,
  toJSON,

  isServerTimestamp,
  isTimestamp,

  get,
  set,

  SwoofError,
  error,
  assert,

  load,

  writable,
  Model,
  User,
  properties
}
