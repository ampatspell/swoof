<script>
  import { JSON, swoof, Bindable, writable, computed, setGlobal } from 'swoof';
import Blank from './Blank.svelte';

  const {
    attr,
  } = computed;

  let store = swoof.store('main');

  class Document extends Bindable {

    constructor() {
      super();
      this.property('id', attr('first'));
      this.property('doc', attr(() => {
        let { id } = this;
        if(!id) {
          return;
        }
        return store.doc(`messages/${id}`).existing(); // or .new();
      }).dependencies('id'));
    }

    get serialized() {
      let { id, doc } = this;
      return {
        id,
        doc
      };
    }

    async save() {
      await this.doc && this.doc.save();
    }

  }

  let model = writable(new Document());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <div class="label">id</div>
  <input bind:value={$model.id}/>
</div>

<div class="row">
  <div class="label">doc.data.name</div>
  <input bind:value={$model.doc.data.name}/>
  <button on:click={() => $model.save()}>Save</button>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .row {
    margin-bottom: 5px;
    > .label {
      font-size: 11px;
    }
  }
</style>
