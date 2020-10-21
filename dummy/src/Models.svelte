<script>
  import { swoof, JSON, Bindable, writable, computed, setGlobal } from 'swoof';

  const {
    attr,
    models
  } = computed;

  let store = swoof.store('main');

  class Message extends Bindable {
    constructor(doc) {
      super();
      this.doc = doc;
    }
  }

  class Models extends Bindable {

    constructor() {
      super();
      this.property('query', attr(store.collection('messages').query()));
      this.property('models', models('query.content', doc => new Message(doc)));
    }

    get serialized() {
      let { query, models } = this;
      return {
        query: query.content.length,
        models: models
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
