<script>
  import { JSON, swoof, state, setGlobal } from 'swoof';
  import { Bindable, writable, computed } from 'swoof';

  const {
    attr,
  } = computed;

  let show = true;

  class Base extends Bindable {

    constructor() {
      super();
      this.property('name', attr('hey there'));
      this.property('array', attr(swoof.store('main').collection('messages').query()));
      this.property('first', attr(swoof.store('main').collection('messages').limit(1).query({ type: 'single' })));
    }

    get serialized() {
      let { name, array, first } = this;
      return {
        name,
        first: first.content,
        array: array.content
      };
    }

  }

  $: base = null;

  $: {
    base = show ? writable(new Base()) : null;
    setGlobal({ base: base && base.model });
  }

</script>

<div class="row">
  {$base} <input bind:value={$base.name}/>
</div>

<div class="row">
  <button on:click={() => show = !show}>Toggle</button>
</div>

{#if base}
  <div class="row">
    <JSON object={$base}/>
  </div>
{/if}

<div class="state">
  <div class="group">
    <div class="label">Roots</div>
    {#each $state.roots as model}
      <div>{model}</div>
    {/each}
  </div>
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
