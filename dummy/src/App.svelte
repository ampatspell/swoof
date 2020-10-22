<script>
  import { swoof, state, setGlobal } from 'swoof';
  import Index from './Index.svelte';

  let { firebase } = process.env.CONFIG;

  let store = swoof.create('main', {
    firebase,
    firestore: {
      enablePersistence: true
    }
  });

  setGlobal({ store });
  setGlobal({ state });
</script>

<Index/>

<style>
</style>
