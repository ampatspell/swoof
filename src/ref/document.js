import Reference from './reference';
import { toString, toJSON } from '../util';
import { documentForRefNotFoundError } from '../error';

const {
  assign
} = Object;

export default class DocumentReference extends Reference {

  get id() {
    return this.ref.id;
  }

  get path() {
    return this.ref.path;
  }

  //

  collection(path) {
    return this.store.collection(this.ref.collection(path));
  }

  new(data) {
    return this.store._createDocumentForReference(this, data || {});
  }

  existing() {
    return this.store._createDocumentForReference(this, null);
  }

  async load(opts) {
    let { optional } = assign({ optional: false }, opts);
    let { ref } = this;
    let snapshot = await ref.get();
    if(!snapshot.exists) {
      if(optional) {
        return;
      }
      throw documentForRefNotFoundError(ref);
    }
    return this.store._createDocumentForSnapshot(snapshot);
  }

  //

  get serialized() {
    let { id, path } = this;
    return { id, path };
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.path}`);
  }

}