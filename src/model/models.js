import { defineHiddenProperty, toString, toPrimitive, toJSON, get } from '../util';

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
    this._createContent();
    return createProxy(this);
  }

  modelAtIndex(idx) {
    return this._content[idx];
  }

  get _source() {
    return get(this.parent, this._opts.source);
  }

  _createContent() {
    let content = [];
    let source = this._source;
    if(source) {
      let factory = this._opts.factory;
      source.forEach(doc => {
        let model = factory(doc);
        console.log(model+'');
        if(model) {
          content.push(model);
        }
      });
    }
    this._content = content;
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
      models: this.map(model => model.toJSON())
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
