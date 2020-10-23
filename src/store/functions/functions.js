import 'firebase/functions';
import { toString, toJSON, defineHiddenProperty, cached } from '../../util/util';
import Region from './region';

export default class Functions {

  constructor(store) {
    defineHiddenProperty(this, 'store', store);
  }

  get _defaultRegion() {
    return cached(this, '_defaultRegion', () => {
      let { store, store: { firebase } } = this;
      let region = store._config.functions.region;
      if(!region) {
        return firebase.functions();
      }
      return firebase.functions(region);
    });
  }

  _functions(region) {
    if(!region) {
      return this._defaultRegion;
    }
    return this.store.firebase.functions(region);
  }

  region(name) {
    return new Region(this, this._functions(name));
  }

  call() {
    return this.region().call(...arguments);
  }

  get serialized() {
    let region = this._defaultRegion.region;
    return {
      region
    };
  }

  toString() {
    return toString(this, `${this._defaultRegion.region}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}