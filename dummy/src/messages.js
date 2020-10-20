import { Model, swoof, computed, get } from 'swoof';

const {
  observed,
  models
} = computed;

export default class Message extends Model {

  constructor() {
    super();
    this.store = swoof.store('main');
    this.define({
      query: observed(this.store.collection('messages').query()),
      models: models('query.content')
    });
  }

  get serialized() {
    return {
      total: get(this, 'query.content.length')
    };
  }

}
