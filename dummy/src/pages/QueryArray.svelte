<script>
  import { swoof, Model, writable, properties, setGlobal } from 'swoof';
  import JSON from '../components/JSON.svelte';

  export let location; !location;

  const {
    attr,
    logger
  } = properties;

  let store = swoof.store('main');

  class QueryArray extends Model {

    constructor() {
      super();
      this.property('logger', logger());
      this.property('query', attr(store.collection('messages').query()));
    }

    async add() {
      await store.collection('messages').doc().new({ name: 'new one' }).save();
    }

    get serialized() {
      let { query } = this;
      return {
        name,
        query: query.content
      };
    }

  }

  let model = writable(new QueryArray());
  setGlobal({ model: model.value });

</script>

{#each $model.query.content as doc}
  <div class="doc">
    <div class="row">
      <div class="key">id</div>
      <div class="value">{doc.id}</div>
    </div>
    <div class="row">
      <div class="key">name</div>
      <div class="value">
        <input bind:value={doc.data.name}/>
        <button on:click={() => doc.save()}>Save</button>
        <button on:click={() => doc.delete()}>Delete</button>
      </div>
    </div>
  </div>
{/each}

<div class="row">
  <button on:click={() => $model.add()}>Add new</button>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .doc {
    margin-bottom: 15px;
    > .row {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      > .key {
        min-width: 50px;
      }
      > .value {
        flex: 1;
      }
    }
  }
  .row {
    margin-bottom: 5px;
  }
</style>
