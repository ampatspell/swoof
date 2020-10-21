import { toString, toJSON, defineHiddenProperty, objectToJSON, defer, cached, deleteCached, merge } from '../util';
import { assert } from '../error';
import Membrane from 'observable-membrane';
import { registerOnSnapshot } from '../state';
import Bindable from '../bindable';

const {
  assign
} = Object;

export default class Document extends Bindable {

  constructor({ store, ref, snapshot, data, parent }) {
    super();
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, 'ref', ref);
    defineHiddenProperty(this, 'parent', parent);
    this.isNew = false;
    this.isLoading = false;
    this.isLoaded = false;
    this.isSaving = false;
    this.isDirty = true;
    this.isError = false;
    this.error = null;
    this.exists = undefined;
    this._data = {};
    this._deferred = defer();
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

  //

  get promise() {
    return this._deferred.promise;
  }

  get data() {
    return cached(this, 'proxy', () => {
      let membrane = new Membrane({
        valueMutated: () => {
          this._setState({ isDirty: true });
          this._notifyDidChange();
        }
      });
      return membrane.getProxy(this._data);
    });
  }

  set data(data) {
    this._setData(data || {});
    this._setState({ isDirty: true });
    this._notifyDidChange();
  }

  merge(props) {
    merge(this._data, props);
    this._setState({ isDirty: true });
    this._notifyDidChange();
  }

  //

  _setData(data) {
    assert(data instanceof Object, 'data must be object');
    this._data = data;
    deleteCached(this, 'proxy');
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

  //

  async load(opts) {
    let { force } = assign({ force: false }, opts);
    let { isLoaded } = this;
    if(isLoaded && !force) {
      return this;
    }
    this._setState({ isNew: false, isLoading: true, isError: false, error: null }, true);
    try {
      let snapshot = await this.ref.ref.get();
      this._onSnapshot(snapshot, true);
      this._maybeStartObserving();
      this._deferred.resolve(this);
    } catch(error) {
      this._setState({ isLoading: false, isError: true, error }, true);
      this._deferred.reject(error);
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
    this._setState({ isSaving: true, isError: false, error: null }, true);
    try {
      await this.ref.ref.set(this._data, { merge });
      this._setState({ isNew: false, isSaving: false, exists: true }, true);
      this._maybeStartObserving();
      this._deferred.resolve(this);
    } catch(error) {
      this._setState({ isSaving: false, isError: true, error }, true);
      throw error;
    }
    return this;
  }

  async delete() {
    this._setState({ isSaving: true, isError: false, error: null }, true);
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

    // TODO: issue with current firebase js sdk
  _shouldIgnoreSnapshot(snapshot) {
    return this.isSaving && !snapshot.metadata.hasPendingWrites;
  }

  _shouldSubscribeToOnSnapshot() {
    if(this.parent) {
      return false;
    }
    if(!this._isBound) {
      return false;
    }
    if(this._cancel) {
      return false;
    }
    if(this.isNew) {
      return false;
    }
    return true;
  }

  _subscribeToOnSnapshot() {
    let { isLoaded } = this;
    if(!isLoaded) {
      this._setState({ isLoading: true, isError: false, error: null }, true);
    }

    this._cancel = registerOnSnapshot(this, this.ref.ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
      if(this._shouldIgnoreSnapshot(snapshot)) {
        return;
      }
      this._onSnapshot(snapshot);
      this._deferred.resolve(this);
    }, error => {
      this._setState({ isLoading: false, isError: true, error }, true);
      this.store._onSnapshotError(this);
      this._deferred.reject(error);
    }));
  }

  _maybeSubscribeToOnSnapshot() {
    if(!this._shouldSubscribeToOnSnapshot()) {
      return;
    }
    this._subscribeToOnSnapshot();
  }

  _unsubscribeFromOnSnapshot() {
    let { _cancel } = this;
    if(_cancel) {
      this._cancel = null;
      _cancel();
    }
  }

  _onBind() {
    this._maybeSubscribeToOnSnapshot();
  }

  _onUnbind() {
    this._unsubscribeFromOnSnapshot();
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
