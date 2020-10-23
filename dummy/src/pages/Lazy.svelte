<script>
  import { swoof, Model, writable, setGlobal, properties, load } from 'swoof';
  import JSON from '../components/JSON.svelte';

  const {
    attr,
    logger
  } = properties;

  export let location; !location;

  let store = swoof.store('main');

  class Lazy extends Model {

    constructor() {
      super();
      this.property('logger', logger());
      this.property('one', attr(() => store.doc('messages/first').existing()).readOnly());
      this.property('two', attr(() => store.doc('messages/second').existing()).readOnly());
      this.property('three', attr(() => store.doc('messages/third').existing()).readOnly());
      this.property('isLoading', attr(false));
      this.property('isLoaded', attr(false));
    }

    async load() {
      if(this.isLoaded) {
        return;
      }
      this.isLoading = true;
      let { one, two, three } = this;
      await load(one, two, three);
      this.isLoaded = true;
      this.isLoading = false;
    }

    get serialized() {
      let { isLoading, isLoaded } = this;
      let docs;
      if(isLoaded) {
        // touching property will start onSnapshot for each document
        // just to demo load() thingie, include docs in serialized
        // only if model is fully loaded
        let { one, two, three } = this;
        docs = {
          one,
          two,
          three
        }       ;
      }
      return {
        isLoading,
        isLoaded,
        docs
      };
    }

  }

  let model = writable(new Lazy());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <button on:click={() => $model.load()}>Load</button>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
