import { defineHiddenProperty, toString, toJSON } from '../util/util';
import Binding, { _binding, getBinding } from './binding';

export {
  _binding,
  getBinding
}

export default class Bindable {

  constructor() {
    defineHiddenProperty(this, _binding, new Binding(this));
  }

  property(key, value) {
    return getBinding(this).defineProperty(key, value);
  }

  _notifyDidChange() {
    getBinding(this).notifyDidChange();
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
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this);
  }

}
