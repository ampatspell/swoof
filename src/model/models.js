import { writable } from 'svelte/store';
import { defineHiddenProperty, toString, toPrimitive, toJSON, objectToJSON, get, isFunction, removeObject } from '../util';
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

const normalizeOpts = ({ source: path, factory }) => {
  let components = path.split('.');
  let key = components.shift();
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

const ownerKey = '__swoof_owner';

export default class Models {

  constructor({ parent, opts }) {
    defineHiddenProperty(this, 'parent', parent);
    defineHiddenProperty(this, '_opts', normalizeOpts(opts));
    defineHiddenProperty(this, '_writable', writable(this));
    this._subscribe();
    return createProxy(this);
  }

  atIndex(idx) {
    return this._content[idx];
  }

  //

  _subscribe() {
    let parent = this.parent.subscribe(() => this._parentDidChange());
    let content = () => this._unsubscribeModels(this._content);
    this._cancel = () => {
      parent();
      content();
    };
  }

  _unsubscribe() {
    let { _cancel } = this;
    this._cancel = null;
    _cancel && _cancel();
  }

  subscribe(...args) {
    this._subscribed = true;
    let observing = swoof._registerObserving(this);
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      this._unsubscribe();
      unsubscribe();
      observing();
    }
  }

  _notifyDidChange() {
    this._writable.set(this);
  }

  //

  _modelDidChange() {
    this._notifyDidChange();
  }

  _unsubscribeModels(models) {
    models.forEach(model => {
      let hash = model[ownerKey];
      let { cancel } = hash;
      delete hash.cancel;
      delete hash.doc;
      cancel && cancel();
    });
  }

  _sourceDidChange() {
    let source = get(this.parent, this._opts.source.path);
    let factory = this._opts.factory;

    let current = this._content || [];

    let find = doc => {
      let model = current.find(model => model[ownerKey] && model[ownerKey].doc === doc);
      if(model) {
        removeObject(current, model);
      }
      return model;
    };

    let create = doc => {
      let model = factory(doc);
      if(model) {
        let cancel = model.subscribe(() => this._modelDidChange(model));
        defineProperty(model, ownerKey, { value: { cancel, doc } });
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

    this._unsubscribeModels(current);

    this._content = content;
  }

  _parentDidChange() {
    this._sourceDidChange();
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
