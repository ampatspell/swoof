import Property from './property';
import { isFunction, toString, objectToJSON, toPrimitive, insertAt, removeAt, removeObject } from '../../util/util';

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

const createArrayProxy = instance => new Proxy(instance, {
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

class ArrayProxy {

  constructor(content, property) {
    this._property = property;
    this._content = content;
  }

  //

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

  //

  insertAt(idx, object) {
    let removed = insertAt(this._content, idx, object);
    this._property.didAddItem(object);
    return removed;
  }

  removeAt(idx) {
    let removed = removeAt(this._content, idx);
    this._property.didRemoveItems(removed);
    return removed;
  }

  removeObject(object) {
    removeObject(this._content, object);
    this._property.didRemoveItem(object);
  }

  // remove last
  pop() {
    let item = this._content.pop();
    this._property.didRemoveItem(item);
    return item;
  }

  // remove 1st
  shift() {
    let item = this._content.shift();
    this._property.didRemoveItem(item);
    return item;
  }

  push(...values) {
    let len = this._content.push(...values);
    this._property.didAddItems(values);
    return len;
  }

  //

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

export default class ArrayProperty extends Property {

  constructor(binding, key, { value }) {
    super(binding, key);
    this.value = value || [];
    this.content = new ArrayProxy(this.value, this);
    this.proxy = createArrayProxy(this.content);
  }

  registerNestedItems(items) {
    items.forEach(item => this.registerNested(item));
  }

  unregisterNestedItems(items) {
    items.forEach(item => this.unregisterNested(item));
  }

  //

  didAddItems(items) {
    this.registerNestedItems(items);
    this.notifyDidChange();
  }

  didAddItem(item) {
    this.registerNested(item);
    this.notifyDidChange();
  }

  didRemoveItems(items) {
    this.unregisterNestedItems(items);
    this.notifyDidChange();
  }

  didRemoveItem(item) {
    this.unregisterNested(item);
    this.notifyDidChange();
  }

  //

  define() {
    let { owner, key } = this;
    this.registerNestedItems(this.value);
    Object.defineProperty(owner, key, {
      get: () => {
        return this.proxy;
      },
      set: value => {
        if(value === this.proxy) {
          return;
        }
        this.unregisterNestedItems(this.value);
        this.value = value;
        this.content._content = value;
        this.registerNestedItems(this.value);
        this.notifyDidChange();
      }
    });

    return this.proxy;
  }

}
