<script>
  import { JSON, Model, writable, setGlobal } from 'swoof';

  class Storage extends Model {

    constructor() {
      super();
    }

    get serialized() {
      return {
        ok: true
      };
    }

  }

  let model = writable(new Storage());
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
