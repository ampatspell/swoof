<script>
  import Document from './Document.svelte';
  import QueryFirst from './QueryFirst.svelte';
  import QueryArray from './QueryArray.svelte';
  import Blank from './Blank.svelte';
  import { state } from 'swoof';

  let show = true;
  let toggle = () => show = !show;

  let routes = [
    { label: 'Document', component: Document },
    { label: 'Query First', component: QueryFirst },
    { label: 'Query Array', component: QueryArray },
    { label: 'Blank', component: Blank },
  ];

  let selected = routes[0];

  let select = route => selected = route;

</script>

<div class="index">
  <div class="header">
    <div class="items">
      {#each routes as route}
        <div class="item" class:selected={route === selected} on:click={() => select(route)}>{route.label}</div>
      {/each}
    </div>
    <button class="toggle" on:click={toggle}>Toggle</button>
  </div>
  {#if show}
    <div class="content">
      <svelte:component this={selected.component}/>
    </div>
  {/if}
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
</div>

<style type="text/scss">
  .header {
    border-bottom: 1px solid #eee;
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    > .items {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex: 1;
      > .item {
        margin: 0 20px 0 0;
        cursor: pointer;
        &.selected {
          font-weight: 600;
        }
      }
    }
  }
  .content {
    padding: 10px 10px 20px 10px;
  }
  .state {
    padding: 10px;
    font-size: 11px;
    > .group {
      margin-bottom: 10px;
      > .label {
        font-weight: 600;
      }
    }
  }
</style>
