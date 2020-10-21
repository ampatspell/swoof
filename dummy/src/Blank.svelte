<script>
  import { JSON, swoof, state, setGlobal, objectToJSON } from 'swoof';
  import { Bindable, writable, computed } from 'swoof';

  const {
    observed,
    array
  } = computed;

  let show = true;

  // class Base extends Bindable {

  //   constructor() {
  //     super();
  //     this.property('query');
  //   }

  //   get serialized() {
  //     return {
  //       docs: objectToJSON(this.query.content)
  //     }
  //   }
  // }

  // let query = swoof.store('main').collection('messages').query();
  // let base = writable(new Base());

  // $: {
  //   base.model.query = show ? query : null;
  //   setGlobal({ base: base.model });
  // }

  class Base extends Bindable {

    constructor(names) {
      super();
      this.property('name', observed('hey there'));
      this.property('names', array(names));
    }

    get serialized() {
      let { names } = this;
      return {
        names
      };
    }

  }

  let base = writable(new Base([ 'a' ]));
  setGlobal({ base: base.model });

</script>

<div class="row">
  {$base} <input bind:value={$base.name}/>
</div>
<div class="row">
  <button on:click={() => show = !show}>Toggle</button>
</div>
<div class="row">
  <JSON object={$base}/>
</div>

<div class="state">
  <div class="group">
    <div class="label">Bound</div>
    {#each $state.bound as model}
      <div>{model}</div>
    {/each}
  </div>
  <div class="group">
    <div class="label">Snapshots</div>
    {#each $state.snapshots as snapshot}
      <div>{snapshot}</div>
    {/each}
  </div>
</div>

<style>
  .row {
    margin-bottom: 5px;
  }

  .state {
    margin-top: 50px;
    font-size: 11px;
  }

  .state > .group {
    margin-bottom: 15px;
  }

  .state > .group > .label {
    font-weight: 600;
  }

</style>
