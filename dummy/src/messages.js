import { Model, swoof, computed, get } from 'swoof';

const {
  observed,
  models,
  alias
} = computed;

class Message extends Model {

  constructor(doc) {
    super();
    this.doc = doc;
    this.define({
      name: alias('doc.data.name'),
      message: observed('hey')
    });
  }

  get serialized() {
    return {
      name: this.name,
      message: this.message
    };
  }

}

export default class Messages extends Model {

  constructor() {
    super();

    let store = swoof.store('main');

    let createQuery = name => {
      let coll = store.collection('messages');
      if(name) {
        coll = coll.where('name', '==', name);
      }
      return coll.query();
    };

    this.define('name', observed('hey there', name => {
      this.query = createQuery(name);
    }));

    this.define('query', observed(createQuery(this.name)));
    this.define('models', models('query.content', doc => new Message(doc)));
  }

  get names() {
    return this.models.map(model => model.doc.data.name);
  }

  get messages() {
    return this.models.map(model => model.message);
  }

  get serialized() {
    return {
      total: get(this, 'query.content.length'),
      names: this.names,
      names: this.messages,
      models: this.models.map(model => model.serialized)
    };
  }

}
