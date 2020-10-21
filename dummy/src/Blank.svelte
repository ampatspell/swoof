<script>
  import { JSON, swoof, state, setGlobal, objectToJSON } from 'swoof';
  import { Bindable, writable } from 'swoof';

  class Base extends Bindable {

    constructor() {
      super();
      this.property('query');
    }

    get serialized() {
      return {
        query: objectToJSON(this.query)
      }
    }
  }

  let show = true;

  let query = swoof.store('main').collection('messages').query();
  let base = writable(new Base());

  $: {
    base.model.query = show ? query : null;
    setGlobal({ base: base.model });
  }

</script>

<div class="row">
  {$base} {$base.query}
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
