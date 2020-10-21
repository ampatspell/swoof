<script>
  import { JSON, Bindable, writable, setGlobal } from 'swoof';

  class Models extends Bindable {

    constructor() {
      super();
    }

    get serialized() {
      return {
        ok: true
      };
    }

  }

  let model = writable(new Models());
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
