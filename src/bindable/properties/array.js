import Property from './property';
import {insertAt, removeAt, removeObject } from '../../util/util';
import { createArrayProxy, ImmutableArrayProxy } from '../../util/proxy';

class ArrayProxy extends ImmutableArrayProxy {

  constructor(content, property) {
    super(content);
    this._property = property;
  }

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

}

export default class ArrayProperty extends Property {

  constructor(binding, key, dependencies, { value }) {
    super(binding, key, dependencies);
    this.value = value || [];
    this.content = new ArrayProxy(this.value, this);
    this.proxy = createArrayProxy(this.content);
  }

  registerNested(object) {
    super.registerNested(object, '[]');
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
        this.notifyDidChange(key);
      }
    });
  }

}
