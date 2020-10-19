import Query from './query';
import { assert } from '../error';

const insertAt = (array, idx, object) => array.splice(idx, 0, object);
const removeAt = (array, idx) => array.splice(idx, 1);

export default class QueryArray extends Query {

  constructor(opts) {
    super(opts);
    this.content = [];
  }

  get _ref() {
    return this.ref.ref;
  }

  _onSnapshotChange(content, change) {
    let { type, oldIndex, newIndex, doc: snapshot } = change;
    console.log(type, oldIndex, newIndex, snapshot.data());
    if(type === 'added') {
      let doc = this.store._createDocumentForSnapshot(snapshot, this);
      insertAt(content, newIndex, doc);
    } else if(type === 'modified') {
      let existing = content[oldIndex];
      if(!existing) {
        let path = snapshot.ref.path;
        existing = content.find(doc => doc.path === path);
        assert(!!existing, `existing document not found for path '${path}'`);
      }
      this._withSuspendedDocumentDidChange(() => existing._onSnapshot(snapshot));
    } else if(type === 'removed') {
      removeAt(content, oldIndex);
    }
  }

  _onSnapshot(snapshot, notify=true) {
    console.log('_onSnapshot');
    let { content } = this;
    snapshot.docChanges({ includeMetadataChanges: true }).map(change => {
      this._onSnapshotChange(content, change);
    });
    this._setState({ isLoading: false, isLoaded: true });
    if(notify) {
      this._notifyDidChange();
    }
  }

}
