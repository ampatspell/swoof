import Document from './firestore/document';
import DocumentReference from './firestore/ref/document';
import CollectionReference from './firestore/ref/collection';
import ConditionReference from './firestore/ref/condition';
import QuerySingle from './firestore/query/single';
import QueryArray from './firestore/query/array';
import Auth from './auth/auth';
import { toString, toJSON, defineHiddenProperty, cached } from '../util/util';
import { assert } from '../util/error';
import BaseUser from './auth/user';
import firebase from "firebase/app";

const {
  assign
} = Object;

const normalizeConfig = (config={}) => {
  let { swoof } = config;
  let { User } = swoof || {};
  User = User || BaseUser;
  return { User };
}

export default class Store {

  constructor({ swoof, identifier, firebase, config }) {
    this.identifier = identifier;
    defineHiddenProperty(this, 'swoof', swoof);
    defineHiddenProperty(this, 'firebase', firebase);
    defineHiddenProperty(this, '_config', normalizeConfig(config));
  }

  get auth() {
    return cached(this, 'auth', () => new Auth(this));
  }

  //

  doc(path) {
    let ref = path;
    if(typeof ref === 'string') {
      ref = this.firebase.firestore().doc(path);
    }
    return this._createDocumentReference(ref);
  }

  collection(path) {
    let ref = path;
    if(typeof ref === 'string') {
      ref = this.firebase.firestore().collection(path);
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

  get serialized() {
    let { identifier, firebase: { options: { projectId } } } = this;
    return  {
      identifier,
      projectId
    };
  }

  toString() {
    let { identifier } = this;
    return toString(this, `${identifier}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}
