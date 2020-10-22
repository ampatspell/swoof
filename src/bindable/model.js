import { defineHiddenProperty, publicToString, publicToJSON } from '../util/util';
import Binding, { _binding, getBinding } from './binding';

export {
  _binding,
  getBinding
}

export default class Model {

  constructor() {
    defineHiddenProperty(this, _binding, new Binding(this));
  }

  property(key, value) {
    return getBinding(this).defineProperty(key, value);
  }

  //

  _notifyDidChange(key) {
    getBinding(this).notifyDidChange(key);
  }

  get _isBound() {
    return getBinding(this).isBound;
  }

  _onBind() {
  }

  _onUnbind() {
  }

  //

  toJSON() {
    let { serialized } = this;
    return publicToJSON(this, { serialized });
  }

  toString() {
    return publicToString(this, this.toStringExtension);
  }

}
