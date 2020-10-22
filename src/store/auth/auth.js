import Model from '../../bindable/model';
import writable from '../../bindable/writable';
import { toString, toJSON, defineHiddenProperty, cached } from '../../util/util';

export default class Auth extends Model {

  constructor(store) {
    super();
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, '_writable', writable(this));
  }

  //

  subscribe() {
    return this._writable.subscribe(...arguments);
  }

  //

  toString() {
    return toString(this);
  }

  toJSON() {
    return toJSON(this);
  }

}
