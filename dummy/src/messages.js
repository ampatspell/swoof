import { Model, swoof, computed, get } from 'swoof';

const {
  observed,
  models
} = computed;

class Message extends Model {

  constructor(doc) {
    super();
    this.doc = doc;
  }

  get serialized() {
    let doc = this.doc.serialized;
    return {
      doc
    };
  }

}

export default class Messages extends Model {

  constructor() {
    super();
    let store = swoof.store('main');
    this.define({
      query: observed(store.collection('messages').query()),
      models: models('query.content', doc => new Message(doc))
    });
  }

  get names() {
    return this.models.map(model => model.doc.data.name);
  }

  get serialized() {
    return {
      total: get(this, 'query.content.length'),
      names: this.names,
      models: this.models.map(model => model.serialized)
    };
  }

}
