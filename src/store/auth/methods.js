import { toString, toJSON, defineHiddenProperty, cached } from '../../util/util';
import AnonymousAuthMethod from './methods/anonymous';
import EmailAuthMethod from './methods/email';

export default class AuthMethods{

  constructor(auth) {
    defineHiddenProperty(this, 'auth', auth);
    defineHiddenProperty(this, 'store', auth.store);
  }

  get anonymous() {
    return cached(this, 'anonymous', () => new AnonymousAuthMethod(this));
  }

  get email() {
    return cached(this, 'email', () => new EmailAuthMethod(this));
  }

  get serialized() {
  }

  toString() {
    return toString(this);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
