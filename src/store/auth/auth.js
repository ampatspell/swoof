import 'firebase/auth';
import { Model, writable, properties } from '../../bindable';
import { toString, toJSON, defineHiddenProperty, cached, defer, objectToJSON } from '../../util/util';
import AuthMethods from './methods';

const {
  attr
} = properties;

export default class Auth extends Model {

  constructor(store) {
    super();
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, '_writable', writable(this));
    this.property('user', attr(null));
    this._deferred = defer();
  }

  get promise() {
    return this._deferred.promise;
  }

  //

  get methods() {
    return cached(this, 'methods', () => new AuthMethods(this));
  }

  async signOut() {
    this._withAuthReturningUser(async auth => {
      await auth.signOut();
      return null;
    });
  }

  //

  get _auth() {
    return this.store.firebase.auth();
  }

  async _withAuth(cb) {
    let auth = this._auth;
    return await cb(auth);
  }

  async _withAuthReturningUser(cb) {
    let user = await this._withAuth(cb);
    return await this._restoreUser(user);
  }

  get _userFactory() {
    return this.store._config.User;
  }

  async _restoreUser(internal) {
    let { user } = this;
    if(internal) {
      if(user && internal.uid === user.user.uid) {
        await user.restore(internal);
      } else {
        user = new this._userFactory(this);
        this.user = user;
        await user.restore(internal);
      }
    } else {
      user = null;
      this.user = user;
    }
    return user;
  }

  //

  async _deleteUser(user) {
    let internal = user.user;
    if(!internal) {
      return;
    }
    await this._withAuthReturningUser(async () => {
      await internal.delete();
      return null;
    })
  }

  //

  _onAuthStateChange(user) {
    this._restoreUser(user);
    this._deferred.resolve(this.user);
  }

  _onBind() {
    this._authStateObserver = this._auth.onAuthStateChanged(user => this._onAuthStateChange(user));
  }

  _onUnbind() {
    this._authStateObserver();
    this._authStateObserver = null;
    this._deferred = defer();
  }

  //

  subscribe() {
    return this._writable.subscribe(...arguments);
  }

  //

  get serialized() {
    let { user } = this;
    return {
      user: objectToJSON(user)
    };
  }

  toString() {
    return toString(this);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
