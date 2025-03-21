import { Model, properties } from '../../bindable';
import { toString, toJSON, defineHiddenProperty, assign } from '../../util/util';
import { assert } from '../../util/error';

const {
  attr,
  alias
} = properties;

export default class User extends Model {

  constructor(store, user) {
    super();
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, '_auth', store.auth);

    this.property('user', attr(user));

    let _user = key => alias(`user.${key}`).deps('user').readOnly();
    this.property('uid', _user('uid'));
    this.property('email', _user('email'));
  }

  async restore() {
  }

  //

  signOut() {
    return this._auth.signOut();
  }

  delete() {
    return this._auth._deleteUser(this);
  }

  async token(opts) {
    let { type, refresh } = assign({ type: 'string', refresh: false }, opts);
    if(type === 'string') {
      return await this.user.getIdToken(refresh);
    } else if(type === 'json') {
      return await this.user.getIdTokenResult(refresh);
    } else {
      assert(false, 'Unsupported token type');
    }
  }

  async link(_method, ...args) {
    let method = this._auth.methods[_method];
    assert(method, `Unsupported method '${_method}'`);
    let credential = method.credential(...args);
    return await this._auth._withAuthReturningUser(async () => {
      let { user } = await this.user.linkWithCredential(credential);
      return user;
    });
  }

  //

  get serialized() {
    let { uid, email } = this;
    return {
      uid,
      email
    };
  }

  toString() {
    let { uid, email } = this;
    return toString(this, `${email || uid}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
