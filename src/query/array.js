import Query from './query';
import { assert } from '../error';
import { insertAt, removeAt } from '../util';

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

  _onSnapshot(snapshot) {
    let { content } = this;
    snapshot.docChanges({ includeMetadataChanges: true }).map(change => {
      this._onSnapshotChange(content, change);
    });
  }

  _onLoad(_snapshot) {
    let { content } = this;
    this.content = _snapshot.docs.map(snapshot => {
      let path = snapshot.ref.path;
      let doc = content.find(doc => doc.path === path);
      if(!doc) {
        doc = this.store._createDocumentForSnapshot(snapshot, this);
      } else {
        this._withSuspendedDocumentDidChange(() => doc._onSnapshot(snapshot));
      }
      return doc;
    });
  }

}
