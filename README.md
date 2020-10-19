# swoof

Experimental Firestore library for Svelte.

``` svelte
// App.svelte
<script>
  import { stores } from 'swoof';
  import Whatever from './Whatever.svelte';

  let config = {
    firebase: {
      apiKey: "...",
      authDomain: "...",
      databaseURL: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    },
    firestore: {
      enablePersistence: true
    }
  };

  let ready = stores.configure('main', config);
  let store = stores.create('main', 'main');
</script>

{#await ready}
  <div class="loading">Loading…</div>
{:then}
  <Whatever/>
{/await}

<style>
</style>
```

``` svelte
// Whatever.svelte
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

<input bind:value={id}/>

<input bind:value={$doc.data.text}/>
<button on:click={() => save()}>Save</button>

<JSON object={$doc}/>

<style>
</style>
```
