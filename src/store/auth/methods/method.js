import { toString, toJSON, defineHiddenProperty } from '../../../util/util';

export default class AuthMethod {

  constructor(methods) {
    defineHiddenProperty(this, 'methods', methods);
    defineHiddenProperty(this, 'auth', methods.auth);
    defineHiddenProperty(this, 'store', methods.auth.store);
  }

  serialized() {
  }

  toString() {
    return toString(this);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
