import { toString, toJSON, defineHiddenProperty, objectToJSON } from './util';
import { writable } from 'svelte/store';
import Membrane from 'observable-membrane';

const {
  assign
} = Object;

export default class Document {

  constructor({ store, ref, snapshot, data, parent }) {
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, '_writable', writable(this));
    defineHiddenProperty(this, 'ref', ref);
    defineHiddenProperty(this, 'parent', parent);
    defineHiddenProperty(this, 'parent', parent, { writable: true });
    this.isNew = false;
    this.isLoading = false;
    this.isLoaded = false;
    this.isSaving = false;
    this.isDirty = true;
    this.isError = false;
    this.error = null;
    this.exists = undefined;
    this._proxy = null;
    this._data = {};
    if(snapshot) {
      this._onSnapshot(snapshot, false);
    } else if(data) {
      this._setData(data);
      this.isNew = true;
    }
  }

  get id() {
    return this.ref.id;
  }

  get path() {
    return this.ref.path;
  }

  //

  get data() {
    let { _proxy } = this;
    if(!_proxy) {
      let membrane = new Membrane({
        valueMutated: () => {
          this._setState({ isDirty: true });
          this._notifyDidChange();
        }
      });
      _proxy = membrane.getProxy(this._data);
      this._proxy = _proxy;
    }
    return _proxy;
  }

  set data(data) {
    this._setData(data || {});
    this._setState({ isDirty: true });
    this._notifyDidChange();
  }

  merge(props) {
    for(let key in props) {
      let value = props[key];
      this._data[key] = value;
    }
    this._setState({ isDirty: true });
    this._notifyDidChange();
  }

  //

  _notifyDidChange() {
    this._writable.set(this);
    this.parent && this.parent._documentDidChange(this);
  }

  _setState(props, notify) {
    let changed = false;
    for(let key in props) {
      let value  = props[key];
      if(this[key] !== value) {
        this[key] = value;
        changed = true;
      }
    }
    if(changed && notify) {
      this._notifyDidChange();
    }
    return changed;
  }

  _setData(data) {
    this._data = data;
    this._proxy = null;
  }

  _onSnapshot(snapshot, notify=true) {
    let { exists } = snapshot;
    if(exists) {
      this._setData(snapshot.data({ serverTimestamps: 'estimate' }));
    }
    this._setState({ isNew: false, isLoading: false, isLoaded: true, isDirty: false, exists });
    if(notify) {
      this._notifyDidChange();
    }
  }

  _shouldIgnoreSnapshot(snapshot) {
    // TODO: issue with current firebase js sdk
    return this.isSaving && !snapshot.metadata.hasPendingWrites;
  }

  _shouldObserve() {
    if(this.parent) {
      return false;
    }
    if(this.isNew) {
      return false;
    }
    return true;
  }

  _shouldStartObserving() {
    if(this._cancel) {
      return false;
    }
    if(!this._subscribed) {
      return;
    }
    return this._shouldObserve();
  }

  _maybeStartObserving() {
    if(!this._shouldStartObserving()) {
      return;
    }

    // console.log('start', this+'');

    let { isLoaded } = this;
    if(!isLoaded) {
      this._setState({ isLoading: true, isError: false, error: undefined }, true);
    }

    let observing = this.store._registerObserving(this);
    let snapshot = this.ref.ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
      if(this._shouldIgnoreSnapshot(snapshot)) {
        return;
      }
      this._onSnapshot(snapshot);
    }, error => {
      this._setState({ isLoading: false, isError: true, error }, true);
      this.store._onSnapshotError(this);
    });

    this._cancel = () => {
      // console.log('stop', this+'');
      observing();
      snapshot();
    };
  }

  _stopObserving() {
    let { _cancel } = this;
    if(_cancel) {
      this._cancel = null;
      _cancel();
    }
  }

  subscribe(...args) {
    this._subscribed = true;
    this._maybeStartObserving();
    let unsubscribe = this._writable.subscribe(...args);
    return () => {
      this._subscribed = false;
      this._stopObserving();
      unsubscribe();
    }
  }

  set() {
    this._setState({ isDirty: true });
    this._notifyDidChange();
  }

  async load(opts) {
    let { force } = assign({ force: false }, opts);
    let { isLoaded } = this;
    if(isLoaded && !force) {
      return this;
    }
    this._setState({ isNew: false, isLoading: true, isError: false, error: undefined }, true);
    try {
      let snapshot = await this.ref.ref.get();
      this._onSnapshot(snapshot, true);
      this._maybeStartObserving();
    } catch(error) {
      this._setState({ isLoading: false, isError: true, error }, true);
      throw error;
    }
    return this;
  }

  reload() {
    return this.load({ force: true });
  }

  async save(opts) {
    let { force, merge } = assign({ force: false, merge: false }, opts);
    let { isDirty } = this;
    if(!isDirty && !force) {
      return this;
    }
    this._setState({ isSaving: true, isError: false, error: undefined }, true);
    try {
      await this.ref.ref.set(this._data, { merge });
      this._setState({ isNew: false, isSaving: false, exists: true }, true);
      this._maybeStartObserving();
    } catch(error) {
      this._setState({ isSaving: false, isError: true, error }, true);
      throw error;
    }
    return this;
  }

  async delete() {
    this._setState({ isSaving: true, isError: false, error: undefined }, true);
    try {
      await this.ref.ref.delete();
      this._setState({ isSaving: false, exists: false }, true);
      this._maybeStartObserving();
    } catch(error) {
      this._setState({ isSaving: false, isError: true, error }, true);
      throw error;
    }
    return this;
  }

  _onDeleted() {
    this._setState({ exists: false }, true);
  }

  //

  get serialized() {
    let { id, path, isDirty, isNew, isLoading, isLoaded, isSaving, isError, error, exists, _data } = this;
    return {
      id,
      path,
      isDirty,
      isNew,
      isLoading,
      isLoaded,
      isSaving,
      isError,
      error: objectToJSON(error),
      exists,
      data: objectToJSON(_data)
    };
  }

  toString() {
    return toString(this, `${this.path}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}