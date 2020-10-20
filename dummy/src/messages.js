import { Model, swoof, computed, get } from 'swoof';

const {
  observed,
  models
} = computed;

class Message extends Model {

  constructor(doc) {
    this.doc = doc;
  }

}

export default class Messages extends Model {

  constructor() {
    super();
    this.store = swoof.store('main');
    this.define({
      query: observed(this.store.collection('messages').query()),
      models: models('query.content', doc => new Message(doc))
    });
  }

  get serialized() {
    return {
      total: get(this, 'query.content.length')
    };
  }

}
