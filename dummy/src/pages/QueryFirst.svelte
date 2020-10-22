<script>
  import { swoof, Model, writable, properties, setGlobal } from 'swoof';
  import JSON from '../components/JSON.svelte';

  export let location; !location;

  const {
    attr,
  } = properties;

  let store = swoof.store('main');

  class QueryArray extends Model {

    constructor() {
      super();
      this.property('name', attr('first'));
      this.property('first', attr(() => {
        let { name } = this;
        if(!name) {
          return;
        }
        return store.collection('messages').where('name', '==', name).limit(1).query({ type: 'single' });
      }).dependencies('name'));
    }

    get serialized() {
      let { name, first } = this;
      return {
        name,
        first: first && first.content
      };
    }

  }

  let model = writable(new QueryArray());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <input bind:value={$model.name}/>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .row {
    margin-bottom: 5px;
  }
</style>
