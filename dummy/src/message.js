import { Model, stores, computed } from 'swoof';

const {
  observed,
  readOnly
} = computed;

export default class Message extends Model {

  constructor() {
    super();
    this.store = stores.get('main');
    this.define({
      doc: observed(this.store.doc('messages/first').existing()),
      name: readOnly('doc.data.name')
    });
  }

  get serialized() {
    let { doc: { serialized: doc }, name } = this;
    return {
      doc,
      name
    };
  }

}
