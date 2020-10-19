<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let query = store.collection('messages').query();
  setGlobal({ query });

</script>

<div class="query">
  <JSON object={$query}/>
</div>

<div class="status">
  {#await $query.promise}
    Loading…
  {:then}
    Loaded
  {/await}
</div>

<div class="docs">
  {#each $query.content as doc}
    <div class="doc">
      <JSON object={doc}/>
      <input bind:value={doc.data.text}/>
      <button on:click={() => doc.save()}>Save</button>
    </div>
  {/each}
</div>

<style type="text/scss">
  .query {
    margin-bottom: 10px;
  }
  .status {
    margin-bottom: 10px;
  }
  .docs {
    > .doc {
      border: 1px solid #eee;
      border-radius: 3px;
      margin-bottom: 10px;
      padding: 10px;
    }
  }
</style>