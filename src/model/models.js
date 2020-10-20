import { defineHiddenProperty, toString, toPrimitive, toJSON, objectToJSON, get, isFunction } from '../util';
import swoof from '../swoof';

const {
  defineProperty
} = Object;

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
      if(isFunction(target[key])) {
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

const normalizeOpts = ({ source: path, factory }) => {
  let components = path.split('.');
  let key = components.pop();
  let value = components.join('.');
  return {
    source: {
      path,
      key,
      value
    },
    factory
  };
}

export default class Models {

  constructor({ parent, opts }) {
    defineHiddenProperty(this, 'parent', parent);
    defineHiddenProperty(this, '_opts', normalizeOpts(opts));
    this._subscribeToParent();
    return createProxy(this);
  }

  _subscribeToParent() {
    let observing = swoof._registerObserving(this);
    let subscription = this.parent.subscribe(() => this._parentDidChange());
    this._cancel = () => {
      subscription();
      observing();
    };
  }

  subscribe() {
    return () => {
      let { _cancel } = this;
      this._cancel = null;
      _cancel && _cancel();
    };
  }

  //

  modelAtIndex(idx) {
    return this._content[idx];
  }

  _parentDidChange() {
    let source = get(this.parent, this._opts.source.path);
    let factory = this._opts.factory;

    let current = this._content || [];

    let key = '__swoof_owner';
    let find = doc => current.find(model => model[key] === doc);
    let create = doc => {
      let model = factory(doc);
      if(model) {
        defineProperty(model, key, { value: doc });
      }
      return model;
    };

    let content = [];
    if(source) {
      source.forEach(doc => {
        let model = find(doc);
        if(!model) {
          model = create(doc);
        }
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
      parent: String(this.parent),
      source: this._opts.source.path,
      models: this.map(model => objectToJSON(model))
    };
  }

  toString() {
    return toString(this, `parent=${this.parent}, source=${this._opts.source.path}`);
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
