<script>
  import { setGlobal, stores } from 'swoof';
  import Index from './Index.svelte';

  let config = {
    firebase: {
      apiKey: "AIzaSyDwCGLTmvKCiCxIO9msehKyULJ_rilnEvw",
      authDomain: "quatsch-38adf.firebaseapp.com",
      databaseURL: "https://quatsch-38adf.firebaseio.com",
      projectId: "quatsch-38adf",
      storageBucket: "quatsch-38adf.appspot.com",
      messagingSenderId: "316370319143",
      appId: "1:316370319143:web:1ea76935876b7619"
    },
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
    font-size: 12px;
  }
</style>