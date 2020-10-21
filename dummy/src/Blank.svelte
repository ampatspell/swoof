<script>
  import { state, setGlobal } from 'swoof';
  import { Bindable, writable } from 'swoof';

  class Base extends Bindable {
    constructor(nested) {
      super();
      this.property('nested', nested);
    }
  }

  class Nested extends Bindable {
    constructor() {
      super();
    }
  }

  let base = null;
  let show = true;

  $: {
    base = show ? writable(new Base(new Nested())) : null;
    setGlobal({ base: base && base.model, Nested });
  }

</script>

<div class="row">
  {$base} {$base.nested}
</div>
<div class="row">
  <button on:click={() => show = !show}>Toggle</button>
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
