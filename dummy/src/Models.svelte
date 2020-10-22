<script>
  import { swoof, JSON, Model, writable, computed, setGlobal } from 'swoof';

  const {
    attr,
    models,
    tap
  } = computed;

  let store = swoof.store('main');

  class Message extends Model {

    constructor(doc) {
      super();
      this.property('doc', tap(doc)); // doesn't bind, just forwards change notifications in this context
      this.property('name', attr(() => this.doc.data.name).dependencies('doc'));
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
    }

    get serialized() {
      let { query, models } = this;
      return {
        query: query.content.length,
        models: models
      };
    }

  }

  let logger = ({ path }) => {
    if(!path) {
      return;
    }
    console.log(`→ ${path}`);
  };

  let model = writable(new Models(), { logger: logger });
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
