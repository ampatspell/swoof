<script>
  import { JSON, Model, writable, setGlobal } from 'swoof';

  class Blank extends Model {

    constructor() {
      super();
    }

    get serialized() {
      return {
        ok: true
      };
    }

  }

  let model = writable(new Blank());
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
