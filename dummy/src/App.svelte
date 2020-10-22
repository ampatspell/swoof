<script>
  import { swoof, state, setGlobal } from 'swoof';
  import Index from './Index.svelte';

  let { firebase } = process.env.CONFIG;

  let config = {
    firebase,
    firestore: {
      enablePersistence: true
    }
  };

  swoof.configure('main', config);
  let store = swoof.create('main', 'main');
  setGlobal({ store });
  setGlobal({ state });
</script>

<Index/>

<style>
</style>
