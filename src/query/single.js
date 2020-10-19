import Query from './query';

export default class QuerySingle extends Query {

  constructor(opts) {
    super(opts);
    this.content = null;
  }

  get _ref() {
    return this.ref.ref;
  }

  _onSnapshot(_snapshot, notify=true) {
    let snapshot = _snapshot.docs[0];
    if(_snapshot.docs.length > 1) {
      console.warn(`${this.ref.string}.query({ type: 'single' }) yields more than 1 document`);
    }
    let { content } = this;
    if(snapshot) {
      if(content && content.path === snapshot.ref.path) {
        this._withSuspendedDocumentDidChange(() => content._onSnapshot(snapshot));
      } else {
        this.content = this.store._createDocumentForSnapshot(snapshot, this);
      }
    } else {
      if(content) {
        content._onDeleted();
      }
      this.content = null;
    }
    this._setState({ isLoading: false, isLoaded: true });
    if(notify) {
      this._notifyDidChange();
    }
  }

}