<script>
  import { swoof, Model, writable, setGlobal, properties, objectToJSON } from 'swoof';
  import JSON from '../components/JSON.svelte';

  export let location; !location;

  const {
    attr,
    alias,
    logger
  } = properties;

  let store = swoof.store('main');

  class Auth extends Model {

    constructor() {
      super();
      this.property('logger', logger());
      this.property('store', attr(store).readOnly());
      this.property('auth', alias('store.auth').readOnly());
      this.property('user', alias('auth.user').readOnly());
    }

    get serialized() {
      let { user } = this;
      return {
        user: objectToJSON(user)
      };
    }

  }

  let model = writable(new Auth());
  setGlobal({ model: model.value });

  let email;
  let password;

</script>

{#await $model.auth.promise}
  Loading…
{/await}

<div class="row">
  <div class="label">Anonymous</div>
  <input type="button" value="Sign in" on:click={() => $model.auth.methods.anonymous.signIn()}/>
</div>

<div class="row">
  <div class="label">Email</div>
  <input placeholder="email" bind:value={email}/>
  <input placeholder="password" bind:value={password}/>
  <input type="button" value="Sign in" on:click={() => $model.auth.methods.email.signIn(email, password)}/>
  <input type="button" value="Sign up" on:click={() => $model.auth.methods.email.signUp(email, password)}/>
  <input type="button" value="Forgot password" disabled={!email} on:click={() => $model.auth.methods.email.sendPasswordReset(email)}/>
</div>

<div class="row">
  <input type="button" value="Sign out" on:click={() => $model.auth.signOut()}/>
  <input type="button" value="Delete" disabled={!$model.auth.user} on:click={() => $model.auth.user.delete()}/>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .row {
    > .label {
      font-size: 11px;
      margin-bottom: 5px;
    }
    margin-bottom: 15px;
  }
</style>
