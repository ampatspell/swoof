import { Model, stores } from 'swoof';

export default class Message extends Model {

  constructor() {
    super();
    this.store = stores.get('main');
    this.define({
      doc: this.observed(this.store.doc('messages/first').existing()),
      name: this.readOnly('doc.data.name')
    });
  }

  get serialized() {
    let { doc, name } = this;
    return {
      doc: doc.serialized,
      name
    };
  }

}
