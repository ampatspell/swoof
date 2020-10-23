<script>
  import { swoof, Model, writable, setGlobal, properties, objectToJSON } from 'swoof';
  import JSON from '../components/JSON.svelte';

  const {
    attr,
    alias,
    logger,
    tap
  } = properties;

  export let location; !location;

  let store = swoof.store('main');

  class Nested extends Model {
    constructor(base) {
      super();
      this.property('logger', logger());
      this.property('base', tap(base));
      this.property('doc', alias('base.doc'));
      this.property('name', alias('doc.data.name').deps('doc.data')); // all data updates notifies with `data`
    }

    get serialized() {
      let { doc, name } = this;
      return {
        name,
        doc: objectToJSON(doc),
      };
    }

  }

  class Alias extends Model {

    constructor() {
      super();
      this.property('logger', logger());
      this.property('doc', attr(() => store.doc('messages/first').existing()));
      this.property('nested', attr(() => new Nested(this)));
    }

    get serialized() {
      let { nested } = this;
      return {
        nested: objectToJSON(nested)
      };
    }

    replace() {
      console.log('replace');
      this.doc = store.doc('messages/second').existing();
    }

  }

  let model = writable(new Alias());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <JSON object={$model}/>
</div>

<div class="row">
  <input type="button" value="Replace" on:click={() => $model.replace()}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
