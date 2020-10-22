<script>
  import { state } from 'swoof';
</script>

<div class="state">
  <div class="group">
    <div class="label">Roots</div>
    {#each $state.roots as model}
      <div>{model}</div>
    {:else}
      <div>No roots</div>
    {/each}
  </div>
  <div class="group">
    <div class="label">Bound</div>
    {#each $state.bound as model}
      <div>{model}</div>
    {:else}
      <div>No bound models</div>
    {/each}
  </div>
  <div class="group">
    <div class="label">Snapshots</div>
    {#each $state.snapshots as snapshot}
      <div>{snapshot}</div>
    {:else}
      <div>No onSnapshot listeners</div>
    {/each}
  </div>
</div>

<style type="text/scss">
  .state {
    font-size: 11px;
    > .group {
      margin-bottom: 10px;
      > .label {
        font-weight: 600;
      }
    }
  }
</style>
