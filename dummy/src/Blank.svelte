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

    subscribeChild(parent, ...args) {
      this.parent = parent;
      return this.subscribe(...args);
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
      this.cancel = model.subscribeChild(this, model => {
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
    onStart() {
      console.log(this.parent+'');
    }
    onStop() {
    }
  }

  // swoof: has internal listeners of some sort which starts/stops onSnapshot stuff
  // have a writable wrapper for it
  // that would also mean documents and queries are not stores

  // let models new Models();
  // let writable = wrap(models); // starts on 1st subscription, stops on last

  let model = new Model();
  let models = new Models(model);

  let c1 = models.subscribe(() => {});
  c1();

</script>

Blank
