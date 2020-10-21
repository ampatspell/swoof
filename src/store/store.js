import Document from './document';
import DocumentReference from './ref/document';
import CollectionReference from './ref/collection';
import ConditionReference from './ref/condition';
import QuerySingle from './query/single';
import QueryArray from './query/array';
import { toString, toJSON, defineHiddenProperty, cached } from '../util/util';
import { assert } from '../util/error';
import firebase from "firebase/app";

const {
  assign
} = Object;

export default class Store {

  constructor({ swoof, identifier, firebase }) {
    this.identifier = identifier;
    defineHiddenProperty(this, 'swoof', swoof);
    defineHiddenProperty(this, 'firebase', firebase);
  }

  get firestore() {
    return cached(this, 'firestore', () => this.firebase.firestore());
  }

  //

  doc(path) {
    let ref = path;
    if(typeof ref === 'string') {
      ref = this.firestore.doc(path);
    }
    return this._createDocumentReference(ref);
  }

  collection(path) {
    let ref = path;
    if(typeof ref === 'string') {
      ref = this.firestore.collection(path);
    }
    return new CollectionReference(this, ref);
  }

  get serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  //

  _createDocumentReference(ref) {
    return new DocumentReference(this, ref);
  }

  _createConditionReference(ref, string) {
    return new ConditionReference(this, ref, string);
  }

  _createDocumentForReference(ref, data) {
    let store = this;
    return new Document({ store, ref, data });
  }

  _createDocumentForSnapshot(snapshot, parent) {
    let store = this;
    let ref = this._createDocumentReference(snapshot.ref);
    return new Document({ store, ref, snapshot, parent });
  }

  _createQuery(ref, opts) {
    let { type } = assign({ type: 'array' }, opts);
    let store = this;
    if(type === 'array') {
      return new QueryArray({ store, ref });
    } else if(type === 'first' || type === 'single') {
      return new QuerySingle({ store, ref });
    }
    assert(false, `Unsupported type '${type}'`);
  }

  _onSnapshotError(sender) {
    console.error('onSnapshot', sender.string || sender.path, sender.error.stack);
  }

  //

  toString() {
    let { identifier } = this;
    return toString(this, `${identifier}`);
  }

  toJSON() {
    let { identifier, firebase: { options: { projectId } } } = this;
    return toJSON(this, {
      identifier,
      projectId
    });
  }

}
