import Bindable from '../../bindable';
import { defineHiddenProperty, toJSON, toString, objectToJSON, defer } from '../../util';
import { registerOnSnapshot } from '../../state';

const {
  assign
} = Object;

export default class Query extends Bindable {

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

  _subscribeToOnSnapshot() {
    let cancel = this._cancel;
    if(!cancel) {
      this._setState({ isLoading: true, isError: false, error: null }, true);
      cancel = registerOnSnapshot(this, this._ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
        this._onSnapshot(snapshot);
        this._setState({ isLoading: false, isLoaded: true });
        this._notifyDidChange();
        this._deferred.resolve(this);
      }, error => {
        this._setState({ isLoading: false, isError: true, error }, true);
        this.store._onSnapshotError(this);
        this._deferred.reject(error);
      }));
      this._cancel = cancel;
    }
  }

  _unsubscribeFromOnSnapshot() {
    let { _cancel } = this;
    this._cancel = null;
    _cancel();
  }

  _onBind() {
    console.log(this+'', 'onBind');
    this._subscribeToOnSnapshot();
  }

  _onUnbind() {
    console.log(this+'', 'onUnbind');
    this._unsubscribeFromOnSnapshot();
  }

  //

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

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    let { string } = this;
    return toString(this, `${string}`);
  }

}
