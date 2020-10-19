import { defineHiddenProperty, toJSON, toString, objectToJSON } from '../util';
import { writable } from 'svelte/store';

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

  subscribe(...args) {
    if(!this.cancel) {
      this._setState({ isLoading: true, isError: false, error: null }, true);
      let observing = this.store._registerObserving(this);
      let snapshot = this._ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
        this._onSnapshot(snapshot);
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