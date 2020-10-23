import { Model } from '../../bindable';
import { toString, toJSON, defineHiddenProperty, objectToJSON } from '../../util/util';
import firebase from "firebase/app";

const {
  STATE_CHANGED
} = firebase.storage.TaskEvent;

export default class StorageTask extends Model {

  constructor(ref, { type, data, task, metadata }) {
    super();
    defineHiddenProperty(this, 'ref', ref);
    this.type = type;
    this.data = data;
    this._task = task;
    this.metadata = metadata;
    this.total = null;
    this.transferred = null;
    this.isRunning = true;
    this.isCompleted = false;
    this.isError = false;
    this.error = null;
    this._await(task);
  }

  get progress() {
    let { total, transferred } = this;
    if(total === null || transferred === null) {
      return 0;
    }
    return Math.floor(transferred / total * 100);
  }

  async _await(task) {
    let snapshot;
    try {
      snapshot = await task;
    } catch {
      return;
    }
    this._onSnapshot(snapshot);
  }

  _onSnapshot(snapshot) {
    let { metadata, bytesTransferred, totalBytes } = snapshot;
    this.metadata = metadata;
    this.transferred = bytesTransferred;
    this.total = totalBytes;
    this._notifyDidChange('progress');
  }

  _onError(error) {
    this.isRunning = false;
    this.isError = true;
    this.error = error;
    this._notifyDidChange('progress');
  }

  _onCompleted() {
    this.isRunning = false;
    this.isCompleted = true;
    this._notifyDidChange('progress');
    this._cancelObserver();
  }

  get promise() {
    return Promise.resolve(this._task).then(() => this);
  }

  //

  _cancelObserver() {
    if(this._taskObserver) {
      this._taskObserver();
      this._taskObserver = null;
    }
  }

  _onBind() {
    if(!this.isRunning) {
      return;
    }
    this._taskObserver = this._task.on(STATE_CHANGED,
      snapshot => this._onSnapshot(snapshot),
      err => this._onError(err),
      (...args) => this._onCompleted(args)
    );
  }

  _onUnbind() {
    this._cancelObserver();
  }

  //

  get serialized() {
    let { type, data, ref: { path }, transferred, total, progress, isRunning, isError, isCompleted, error, metadata } = this;
    return {
      type,
      data: objectToJSON(data),
      path,
      transferred,
      total,
      progress,
      isRunning,
      isError,
      isCompleted,
      error,
      metadata
    };
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.ref.path}`);
  }

}