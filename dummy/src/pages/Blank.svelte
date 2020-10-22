<script>
  import { swoof, Model, writable, setGlobal, properties } from 'swoof';
  import JSON from '../components/JSON.svelte';

  const {
    attr
  } = properties;

  export let location; !location;

  let store = swoof.store('main');

  class Blank extends Model {

    constructor() {
      super();
      this.property('doc', attr(() => store.doc('messages/first').existing()).readOnly());
    }

    get serialized() {
      return {
        ok: true
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
