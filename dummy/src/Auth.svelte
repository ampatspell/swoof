<script>
  import { swoof, JSON, Model, writable, setGlobal } from 'swoof';

  let store = swoof.store('main');

  class Auth extends Model {

    constructor() {
      super();
    }

    get serialized() {
      return {
        ok: true
      };
    }

  }

  let auth = store.auth;

  let model = writable(new Auth());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <JSON object={$model}/>
</div>

<div class="row">
  <JSON object={$auth}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
