import { defineHiddenProperty, toJSON, toString, objectToJSON } from '../util';
import { writable } from 'svelte/store';

const {
  assign
} = Object;

export default class Query {

  constructor({ store, ref }) {
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, 'writable', writable(this));
    defineHiddenProperty(this, 'ref', ref);
    this.isLoading = false;
    this.isLoaded = false;
    this.isError = false;
    this.error = null;
    this._documentDidChangeSuspended = 0;
  }

  get string() {
    return this.ref.string;
  }

  get serialized() {
    let { isLoading, isLoaded, isError, error, string } = this;
    return {
      isLoading,
      isLoaded,
      isError,
      error: objectToJSON(error),
      string
    };
  }

  //

  // TODO: from document
  _notifyDidChange() {
    this.writable.set(this);
  }

  // TODO: from document
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

  _withSuspendedDocumentDidChange(cb) {
    this._documentDidChangeSuspended++;
    try {
      cb();
    } finally {
      this._documentDidChangeSuspended--;
    }
  }

  _documentDidChange() {
    if(this._documentDidChangeSuspended > 0) {
      return;
    }
    this._notifyDidChange();
  }

  set() {
    this._notifyDidChange();
  }

  subscribe(...args) {
    if(!this.cancel) {
      this._setState({ isLoading: true, isError: false, error: null }, true);
      let observing = this.store._registerObserving(this);
      let snapshot = this._ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
        this._onSnapshot(snapshot);
        this._setState({ isLoading: false, isLoaded: true });
        this._notifyDidChange();
      }, error => {
        this._setState({ isLoading: false, isError: true, error }, true);
        this.store._onSnapshotError(this);
      });
      this._cancel = () => {
        observing();
        snapshot();
      };
    }
    let unsubscribe = this.writable.subscribe(...args);
    return () => {
      this._cancel();
      unsubscribe();
    }
  }

  async load(opts) {
    let { force } = assign({ force: false }, opts);
    let { isLoaded } = this;
    if(isLoaded && !force) {
      return this;
    }
    this._setState({ isLoading: true, isError: false, error: null }, true);
    try {
      let snapshot = await this._ref.get();
      this._onLoad(snapshot);
      this._setState({ isLoading: false, isLoaded: true }, true);
    } catch(error) {
      this._setState({ isLoading: false, isError: true, error }, true);
      throw error;
    }
    return this;
  }

  reload() {
    return this.load({ force: true });
  }

  //

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    let { string } = this;
    return toString(this, `${string}`);
  }

}