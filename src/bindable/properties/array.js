import Property from './property';
import { isFunction, toString, toJSON, objectToJSON, toPrimitive, insertAt, removeAt, removeObject } from '../../util';

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

class ArrayStorage {

  constructor(content, property) {
    this.property = property;
    this.content = content || [];
  }

  //

  atIndex(idx) {
    return this.content[idx];
  }

  get last() {
    return this.content[this.content.length - 1];
  }

  map(...args) {
    return this.content.map(...args);
  }

  forEach(...args) {
    return this.content.forEach(...args);
  }

  //

  insertAt(idx, object) {
    let removed = insertAt(this.content, idx, object);
    this.property.didAddItem(object);
    return removed;
  }

  removeAt(idx) {
    let removed = removeAt(this.content, idx);
    this.property.didRemoveItems(removed);
    return removed;
  }

  removeObject(object) {
    removeObject(this.content, object);
    this.property.didRemoveItem(object);
  }

  // remove last
  pop() {
    let item = this.content.pop();
    this.property.didRemoveItem(item);
    return item;
  }

  // remove 1st
  shift() {
    let item = this.content.shift();
    this.property.didRemoveItem(item);
    return item;
  }

  push(...values) {
    let len = this.content.push(...values);
    this.property.didAddItems(values);
    return len;
  }

  //

  get length() {
    return this.content.length;
  }

  toString() {
    return toString(this);
  }

  get serialized() {
    return objectToJSON(this.content);
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

export default class ArrayProperty extends Property {

  constructor(binding, key, { value }) {
    super(binding, key);
    this.content = new ArrayStorage(value, this);
    this.proxy = createProxy(this.content);
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
    this.registerNestedItems(this.content.content);
    Object.defineProperty(owner, key, {
      get: () => {
        return this.proxy;
      },
      set: value => {
        if(value === this.proxy) {
          return;
        }
        this.unregisterNestedItems(this.content.content);
        this.content.content = value;
        this.registerNestedItems(this.content.content);
        this.notifyDidChange();
      }
    });

    return this.proxy;
  }

}
