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

  class External extends Model {
    constructor() {
      super();
      this.property('doc', attr(() => store.doc('messages/first').existing()).readOnly());
    }
  }

  class Blank extends Model {

    constructor(external) {
      super();
      this.property('external', tap(external));
      this.property('logger', logger());
      this.property('name', alias('external.doc.data.name').deps('external.doc.data'));
    }

  }
  let external = writable(new External());
  let model = writable(new Blank(external.model));
  setGlobal({ model: model.value });

</script>

<div class="row">
  {$external}
  {$model.external.doc.data.name} :
  {$model.name}
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
