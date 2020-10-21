import { defineHiddenProperty, toString, toJSON } from '../util';
import Properties from './properties';
import Subscriptions from '../subscriptions';

export default class Model {

  constructor() {
    defineHiddenProperty(this, '_properties', new Properties(this));
    defineHiddenProperty(this, '_subscriptions', new Subscriptions(this, {
      onStart: () => {},
      onStop: () => {}
    }));
  }

  define(...args) {
    return this._properties.define(...args);
  }

  _notifyDidChange() {
    this._subscriptions.notifyDidChange();
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    return this._subscriptions.subscribe(...args);
  }

  toString() {
    return toString(this, this.toStringExtension);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
