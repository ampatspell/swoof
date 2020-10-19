<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let query = store.collection('messages').limit(1).query({ type: 'first' });
  setGlobal({ query });

  $: doc = $query.content;
  $: setGlobal({ doc });

</script>

<div class="first">
  <JSON object={$query}/>
  <JSON object={doc}/>
  {#if doc}
    <input bind:value={$doc.data.text}/>
    <button on:click={() => doc.save()}>Save</button>
  {/if}
</div>

<style type="text/scss">
</style>
