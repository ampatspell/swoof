<script>
  import { swoof, Model, writable, setGlobal, properties, objectToJSON } from 'swoof';
  import JSON from '../components/JSON.svelte';

  const {
    attr,
    alias,
    logger
  } = properties;

  export let location; !location;

  let store = swoof.store('main');

  class Blank extends Model {

    constructor() {
      super();
      this.property('logger', logger());
      this.property('name', alias('doc.data.name'));
      this.property('doc', attr(() => store.doc('messages/first').existing()).readOnly());
    }

    get serialized() {
      let { name, doc } = this;
      return {
        name,
        doc: objectToJSON(doc)
      };
    }

  }

  let model = writable(new Blank());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <JSON object={$model}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
