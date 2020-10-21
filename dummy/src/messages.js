import { Model, swoof, computed, setGlobal } from 'swoof';

const {
  observed,
  models,
  alias,
  readOnly,
} = computed;

class Message extends Model {

  constructor(doc, name) {
    super();
    this.doc = doc;
    this.name = name;
    // this.define('message', observed('hey'));
  }

  get serialized() {
    return {
      // name: this.name,
      // message: this.message
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

    this.define('foo', observed('one'));
    this.define('name', observed('hey there'));
    this.define('query', observed(() => createQuery(this.name)).dependencies('name'));
    // this.define('models', models('query.content', doc => new Message(doc, this.foo)));
    this.define('models', models('query.content', doc => ({})));
    // setGlobal({ models: this.models });
  }

  // get names() {
  //   return this.models.map(model => model.name);
  // }

  // get messages() {
  //   return this.models.map(model => model.message);
  // }

  get serialized() {
    return {
      total: get(this, 'query.content.length'),
      names: this.names,
      names: this.messages,
      models: this.models.map(model => model.serialized)
    };
  }

}
