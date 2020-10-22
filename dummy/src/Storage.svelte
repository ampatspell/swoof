<script>
  import { swoof, JSON, Model, writable, setGlobal, computed, objectToJSON } from 'swoof';

  const {
    attr
  } = computed;

  let store = swoof.store('main');

  class Storage extends Model {

    constructor() {
      super();
      this.property('files', attr(null));
      this.property('task', attr(null))
    }

    async upload() {
      let { files } = this;
      this.files = null;

      let task;
      if(files) {
        let file = files[0];
        task = store.storage.ref('hello').put({
          type: 'data',
          data: file,
          metadata: {
            contentType: file.type
          }
        });
      } else {
        task = store.storage.ref('hello').put({
          type: 'string',
          format: 'raw',
          data: 'hey there',
          metadata: {
            contentType: 'text/plain'
          }
        });
      }

      this.task = task;
    }

    get serialized() {
      let { files, task } = this;
      return {
        files: objectToJSON(files),
        task: objectToJSON(task)
      };
    }

  }

  let model = writable(new Storage());
  setGlobal({ model: model.value });

</script>

<div class="row">
  <input type="file" bind:files={$model.files}/>
</div>
<div class="row">
  <input type="button" value="Upload" on:click={() => $model.upload()}/>
</div>

<div class="row">
  <JSON object={$model}/>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }
</style>
