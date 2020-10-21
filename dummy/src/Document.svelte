<script>
  import { JSON, swoof, setGlobal, writable } from 'swoof';

  let store = swoof.store('main');

  let id = 'first';

  $: doc = writable(store.doc(`foobar/${id}`).existing());
  $: setGlobal({ doc });

  let save = () => {
    let { model } = doc;
    model.data.updatedAt = store.serverTimestamp;
    console.log('save', model.serialized.data);
    model.save();
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
