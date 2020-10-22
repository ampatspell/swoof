<script>
  import { swoof, state, setGlobal, toString, User } from 'swoof';
  import Index from './Index.svelte';

  class DummyUser extends User {

    toString() {
      let { user: { uid, email } } = this;
      return toString(this, `${email || uid}`);
    }

  }

  let { firebase } = process.env.CONFIG;

  let store = swoof.create('main', {
    firebase,
    firestore: {
      enablePersistence: true
    },
    swoof: {
      User: DummyUser
    }
  });

  setGlobal({ store });
  setGlobal({ state });
</script>

<Index/>

<style>
</style>
