// import { Model, swoof, computed } from 'swoof';

// const {
//   observed,
//   readOnly,
//   alias
// } = computed;

// export default class Message extends Model {

//   constructor() {
//     super();
//     this.store = swoof.store('main');
//     this.define({
//       doc: observed(this.store.doc('messages/first').existing()),
//       query: observed(this.store.collection('messages').query()),
//       total: readOnly('query.content.length'),
//       name: alias('doc.data.name')
//     });
//   }

//   get serialized() {
//     let { doc: { serialized: doc }, name, total } = this;
//     return {
//       doc,
//       total,
//       name
//     };
//   }

// }
