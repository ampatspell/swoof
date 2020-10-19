<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let query = store.collection('messages').query();
  setGlobal({ query });

  $: $query && console.log('query did change');

  $: doc = $query.content[0];
  $: setGlobal({ doc });

</script>

<div class="query">
  <JSON object={$query}/>
  {#if $doc}
    <input bind:value={$doc.data.text}/>
    <button on:click={() => doc.save()}>Save</button>
  {/if}
</div>

<div class="docs">
  {#each $query.content as doc}
    <div class="doc">
      <JSON object={doc}/>
    </div>
  {/each}
</div>

<style type="text/scss">
  .query {
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