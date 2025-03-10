import { Model, properties } from '../bindable';
import Document from './firestore/document';
import DocumentReference from './firestore/ref/document';
import CollectionReference from './firestore/ref/collection';
import ConditionReference from './firestore/ref/condition';
import QuerySingle from './firestore/query/single';
import QueryArray from './firestore/query/array';
import Auth from './auth/auth';
import Storage from './storage/storage';
import Functions from './functions/functions';
import { toString, toJSON, defineHiddenProperty, cached, assign } from '../util/util';
import { assert } from '../util/error';
import BaseUser from './auth/user';
import firebase from "firebase/app";

const {
  attr
} = properties;

const normalizeConfig = (config={}) => {
  let { swoof } = config;
  let { auth, functions } = assign({ auth: {}, functions: {} }, swoof);
  let { User } = assign({ User: BaseUser }, auth);
  let { region } = assign({}, functions);
  return {
    auth: { User },
    functions: { region }
  };
}

export default class Store extends Model {

  constructor({ swoof, identifier, firebase, config }) {
    super();
    this.identifier = identifier;
    defineHiddenProperty(this, 'swoof', swoof);
    defineHiddenProperty(this, 'firebase', firebase);
    defineHiddenProperty(this, '_config', normalizeConfig(config));
    this.property('auth', attr(() => new Auth(this)).readOnly());
    this.property('storage', attr(() => new Storage(this)).readOnly());
    this.property('functions', attr(() => new Functions(this)).readOnly());
  }

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

  get projectId() {
    return this.firebase.options.projectId;
  }

  get dashboard() {
    return `https://console.firebase.google.com/u/0/project/${this.projectId}/overview`;
  }

  openDashboard() {
    window.open(this.dashboard, '_blank');
  }

  get serialized() {
    let { identifier, projectId } = this;
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
