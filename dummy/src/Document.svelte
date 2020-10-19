<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let id = 'first';

  $: doc = store.doc(`foobar/${id}`).existing();
  $: setGlobal({ doc });

  let save = () => {
    doc.data.updatedAt = store.serverTimestamp;
    console.log('save', doc.serialized.data);
    doc.save();
  };

</script>

<div class="single">

  <div class="id">
    <input bind:value={id}/>
  </div>

  <div class="content">
    <div class="status">
      {#await $doc.promise}
        Loading…
      {:then}
        Loaded
      {/await}
    </div>
    <div class="text">
      <input bind:value={$doc.data.text}/>
    </div>
    <div class="actions">
      <button on:click={() => save()}>Save</button>
    </div>
  </div>

  <JSON object={store}/>
  <JSON object={$doc}/>
</div>

<style>
  .id {
    margin-bottom: 20px;
  }
  .status {
    margin-bottom: 10px;
  }
  .content {
    margin-bottom: 10px;
  }
  .text {
    margin-bottom: 10px;
  }
</style>