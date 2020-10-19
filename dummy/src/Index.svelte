<script>
  import Document from './Document.svelte';
  import Query from './Query.svelte';
  import First from './First.svelte';

  let thing = true;
  let toggle = () => thing = !thing;

  let routes = [
    { label: 'Document', component: Document },
    { label: 'Query', component: Query },
    { label: 'First', component: First }
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
  {#if thing}
    <div class="route">{selected.label}</div>
    <div class="content">
      <svelte:component this={selected.component}/>
    </div>
  {/if}
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
        margin: 0 10px 0 0;
        cursor: pointer;
        &.selected {
          text-decoration: underline;
        }
      }
    }
  }
  .route {
    font-weight: 600;
    padding: 10px;
  }
  .content {
    padding: 10px;
  }
</style>