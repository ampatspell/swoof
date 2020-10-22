<script>
  import { swoof, JSON, Model, writable, setGlobal, computed } from 'swoof';

  const {
    attr,
    logger
  } = computed;

  let store = swoof.store('main');

  class Auth extends Model {

    constructor() {
      super();
      this.property('auth', attr(store.auth));
      this.property('logger', logger());
    }

    get serialized() {
      return {
        ok: true
      };
    }

  }

  let model = writable(new Auth());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <JSON object={$model}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
