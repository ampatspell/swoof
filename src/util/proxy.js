import { isFunction, toString, objectToJSON, toPrimitive } from './util';

const parseKey = key => {
  try {
    let idx = Number(key);
    if(isNaN(idx)) {
      return {
        key
      };
    }
    return {
      idx
    };
  } catch(err) {
    return {
      key
    };
  }
}

export const createArrayProxy = instance => new Proxy(instance, {
  get: (target, _key) => {
    let { idx, key } = parseKey(_key);
    if(key) {
      if(isFunction(target[key])) {
        return (...args) => target[key].call(target, ...args);
      }
      return target[key];
    } else {
      return target.atIndex(idx);
    }
  },
  set: (target, _key, value) => {
    let { key } = parseKey(_key);
    if(key) {
      target[key] = value;
      return true;
    }
    return false;
  }
});

export class ImmutableArrayProxy {

  constructor(content) {
    this._content = content;
  }

  //

  atIndex(idx) {
    return this._content[idx];
  }

  atIndex(idx) {
    return this._content[idx];
  }

  get last() {
    return this._content[this._content.length - 1];
  }

  map(...args) {
    return this._content.map(...args);
  }

  forEach(...args) {
    return this._content.forEach(...args);
  }

  reduce(...args) {
    return this._content.reduce(...args);
  }

  find(...args) {
    return this._content.find(...args);
  }

  filter(...args) {
    return this._content.filter(...args);
  }

  get length() {
    return this._content.length;
  }

  toString() {
    return toString(this);
  }

  get serialized() {
    return objectToJSON(this._content);
  }

  toJSON() {
    return this.serialized;
  }

  get [Symbol.toStringTag]() {
    return toPrimitive(this);
  }

  [Symbol.toPrimitive]() {
    return this.toString();
  }

}
