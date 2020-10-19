import { Model, stores } from 'swoof';

export default class Message extends Model {

  constructor() {
    super();
    this.store = stores.get('main');
    this.observed('doc', this.store.doc('messages/first').existing());
  }

  get serialized() {
    let { doc } = this;
    return {
      doc: doc.serialized
    };
  }

}
