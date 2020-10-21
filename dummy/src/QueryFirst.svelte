<script>
  import { JSON, swoof, Bindable, writable, computed, setGlobal } from 'swoof';

  const {
    attr,
  } = computed;

  let store = swoof.store('main');

  class QueryFirst extends Bindable {

    constructor() {
      super();
      this.property('name', attr('first'));
      this.property('first', attr(() => {
        let { name } = this;
        if(!name) {
          return;
        }
        return store.collection('messages').where('name', '==', name).limit(1).query({ type: 'single' });
      }).dependencies('name'));
    }

    get serialized() {
      let { name, first } = this;
      return {
        name,
        first: first && first.content
      };
    }

  }

  let model = writable(new QueryFirst());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <input bind:value={$model.name}/>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .row {
    margin-bottom: 5px;
  }
</style>
