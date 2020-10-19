<script>
  import { setGlobal, stores } from 'swoof';
  import Index from './Index.svelte';

  let { firebase } = process.env.CONFIG;

  let config = {
    firebase,
    firestore: {
      enablePersistence: true
    }
  };

  let ready = stores.configure('main', config);
  let store = stores.create('main', 'main');
  setGlobal({ store });
</script>

{#await ready}
  <div class="loading">Loading…</div>
{:then}
  <div class="application">
    <Index/>
  </div>
{/await}

<style>
  .loading {
    padding: 10px;
    font-size: 12px;
  }
</style>