import { defineHiddenProperty, toString, toPrimitive, toJSON, objectToJSON, get, isFunction, removeObject } from '../util';
import Subscriptions from '../subscriptions';

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

const normalizeOpts = ({ path, factory }) => {
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
const noop = () => {};

export default class Models {

  constructor({ parent, opts }) {
    defineHiddenProperty(this, 'parent', parent);
    defineHiddenProperty(this, '_opts', normalizeOpts(opts));
    defineHiddenProperty(this, '_subscriptions', new Subscriptions(this, {
      onStart: () => this._onStart(),
      onStop: () => this._onStop()
    }));
    this._content = [];
    return createProxy(this);
  }

  _recreateContent() {
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
        let cancel = this._subscriptions.withSuppressNotifyDidChange(() => {
          if(isFunction(model.subscribe)) {
            return model.subscribe(() => this._contentModelDidChange(model));
          } else {
            return noop;
          }
        });
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

    this._unsubscribeContentModels(current);

    this._content = content;
  }

  _parentDidChange() {
    this._recreateContent();
  }

  _contentModelDidChange() {
    this._subscriptions.notifyDidChange();
  }

  _unsubscribeContentModels(models) {
    models.forEach(model => {
      let hash = model[ownerKey];
      let { cancel } = hash;
      delete hash.cancel;
      delete hash.doc;
      cancel && cancel();
    });
  }

  _unsubscribeContent() {
    this._unsubscribeContentModels(this._content);
    this._content = [];
  }

  _onStart() {
    console.log('models start');
    this._recreateContent();
    this.subscription = this.parent.subscribe(() => this._parentDidChange());
    return () => this._onStop();
  }

  _onStop() {
    console.log('models stop');
    this.subscription();
    this._unsubscribeContent();
  }

  // subscribe(...args) {
  //   let r = this._subscriptions.subscribe(...args);
  //   return () => {
  //     console.log('models unsubscribe');
  //     r();
  //   };
  // }

  //

  atIndex(idx) {
    return this._content[idx];
  }

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
