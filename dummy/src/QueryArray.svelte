<script>
  import { JSON, swoof, Bindable, writable, computed, setGlobal } from 'swoof';

  const {
    attr,
  } = computed;

  let store = swoof.store('main');

  class QueryFirst extends Bindable {

    constructor() {
      super();
      this.property('query', attr(store.collection('messages').query()));
    }

    get serialized() {
      let { query } = this;
      return {
        name,
        query: query.content
      };
    }

  }

  let model = writable(new QueryFirst());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <JSON object={$model}/>
</div>

<style type="text/scss">
  .row {
    margin-bottom: 5px;
  }
</style>
