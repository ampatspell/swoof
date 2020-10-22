<script>
  import { swoof, Model, writable, computed, setGlobal } from 'swoof';
  import JSON from './JSON.svelte';

  const {
    attr,
    models,
    tap,
    logger
  } = computed;

  let store = swoof.store('main');

  class Message extends Model {

    constructor(doc) {
      super();
      this.property('doc', tap(doc)); // doesn't bind, just forwards change notifications in this context
      this.property('name', attr(() => this.doc.data.name).dependencies('doc'));
      this.property('logger', logger());
    }

    get toStringExtension() {
      return this.doc.id;
    }

    get serialized() {
      let { doc, name } = this;
      return {
        doc: doc.data.name,
        name
      };
    }

  }

  class Models extends Model {

    constructor() {
      super();
      this.property('query', attr(store.collection('messages').query()));
      this.property('models', models('query.content', doc => new Message(doc)));
      this.property('logger', logger());
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
