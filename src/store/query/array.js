import Query from './query';
import { assert } from '../../util/error';
import { array } from '../../bindable/computed';

export default class QueryArray extends Query {

  constructor(opts) {
    super(opts);
    this.property('content', array([]));
  }

  get _ref() {
    return this.ref.ref;
  }

  _onSnapshotChange(content, change) {
    let { type, oldIndex, newIndex, doc: snapshot } = change;
    if(type === 'added') {
      let doc = this.store._createDocumentForSnapshot(snapshot, this);
      content.insertAt(newIndex, doc);
    } else if(type === 'modified') {
      let existing = content[oldIndex];
      if(!existing) {
        let path = snapshot.ref.path;
        existing = content.find(doc => doc.path === path);
        assert(!!existing, `existing document not found for path '${path}'`);
      }
      existing._onSnapshot(snapshot);
    } else if(type === 'removed') {
      content.removeAt(oldIndex);
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
        doc._onSnapshot(snapshot);
      }
      return doc;
    });
  }

}
