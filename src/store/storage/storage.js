import 'firebase/storage';
import { toString, toJSON, defineHiddenProperty } from '../../util/util';
import StorageReference from './reference';

export default class Storage {

  constructor(store) {
    defineHiddenProperty(this, 'store', store);
  }

  get _storage() {
    return this.store.firebase.storage();
  }

  //

  ref(arg) {
    if(typeof arg === 'string') {
      arg = { path: arg };
    }

    let { path, url } = arg;
    let ref;
    if(path) {
      ref = this._storage.ref(path);
    } else {
      ref = this._storage.refFromURL(url);
    }

    return new StorageReference(this, ref);
  }

  //

  get serialized() {
    let { storageBucket} = this._storage.app.options;
    return {
      storageBucket
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
