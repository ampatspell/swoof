import Model from '../model';
import { defineHiddenProperty, toJSON, toString, objectToJSON, defer } from '../util';

const {
  assign
} = Object;

export default class Query extends Model {

  constructor({ store, ref }) {
    super();
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, 'ref', ref);
    this.isLoading = false;
    this.isLoaded = false;
    this.isError = false;
    this.error = null;
    this._deferred = defer();
    this._documentDidChangeSuspended = 0;
  }

  get promise() {
    return this._deferred.promise;
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
        this._deferred.resolve(this);
      }, error => {
        this._setState({ isLoading: false, isError: true, error }, true);
        this.store._onSnapshotError(this);
        this._deferred.reject(error);
      });
      this._cancel = () => {
        observing();
        snapshot();
      };
    }
    let unsubscribe = this._writable.subscribe(...args);
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
