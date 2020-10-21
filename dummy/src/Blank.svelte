<script>
  import { writable } from 'svelte/store';

  class Base {
    constructor() {
      this.writable = writable(this, () => {
        console.log('onStart', this+'');
        this.started = true;
        this.onStart();
        return () => {
          console.log('onStop', this+'');
          this.onStop();
          this.started = false;
        };
      });
    }

    subscribe(...args) {
      return this.writable.subscribe(...args);
    }

    toString() {
      return `<${this.constructor.name}>`;
    }
  }

  class Models extends Base {
    constructor(model) {
      super();
      this.model = model;
    }
    onStart() {
      this.cancel = model.subscribe(model => {
        console.log(`models: model did change`);
      });
    }
    onStop() {
      this.cancel();
    }
  }

  class Model extends Base {
    constructor() {
      super();
    }
    bindModels() {
      if(this.cancel) {
        this.cancel();
      }
      this.models = models;
      this.cancel = this.models.subscribe(models => {
      });
    }
    onStart() {
    }
    onStop() {
      this.cancel();
    }
  }

  let model = new Model();
  let models = new Models(model);
  model.bindModels(models);

  let c1 = models.subscribe(() => {});
  let c2 = model.subscribe(() => {});
  c1();
  c2();

</script>

Blank
