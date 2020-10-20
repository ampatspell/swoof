<script>
  import { setGlobal, swoof } from 'swoof';
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
</script>

<Index/>

<style>
</style>
