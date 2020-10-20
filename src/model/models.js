import { defineHiddenProperty, toString, toPrimitive, toJSON } from '../util';

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

const createProxy = instance => new Proxy(instance, {
  get: (target, _key) => {
    let { idx, key } = parseKey(_key);
    if(key) {
      if(typeof target[key] === 'function') {
        return (...args) => target[key].call(target, ...args);
      }
      return target[key];
    } else {
      return target.modelAtIndex(idx);
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

export default class Models {

  constructor({ parent, opts }) {
    defineHiddenProperty(this, 'parent', parent);
    defineHiddenProperty(this, '_opts', opts);
    defineHiddenProperty(this, '_content', []);
    return createProxy(this);
  }

  modelAtIndex(idx) {
    return this._content[idx];
  }

  //

  map(...args) {
    return this._content.map(...args);
  }

  forEach(...args) {
    return this._content.forEach(...args);
  }

  get length() {
    return this._content.length;
  }

  //

  get serialized() {
    return {
      parent: toPrimitive(this.parent),
      source: this._opts.source,
      models: this.map(model => model.serialized)
    };
  }

  toString() {
    return toString(this);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  get [Symbol.toStringTag]() {
    return toPrimitive(this)
  }

  [Symbol.toPrimitive]() {
    return this.toString();
  }

}
