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

  stores.configure('main', config);
  let store = stores.create('main', 'main');
  setGlobal({ store });
</script>

<Index/>

<style>
</style>