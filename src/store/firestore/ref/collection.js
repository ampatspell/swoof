import QueryableReference from './queryable';
import { toString, toJSON } from '../../../util/util';

export default class CollectionReference extends QueryableReference {

  get id() {
    return this.ref.id;
  }

  get path() {
    return this.ref.path;
  }

  //

  doc(path) {
    let ref;
    if(path) {
      ref = this.ref.doc(path);
    } else {
      ref = this.ref.doc();
    }
    return this.store.doc(ref);
  }

  //

  get serialized() {
    let { id, path } = this;
    return { id, path };
  }

  get string() {
    return this.path;
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.path}`);
  }

}
