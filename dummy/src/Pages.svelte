<script>
  import { Router, Route, Link } from "svelte-routing";

  import Index from "./pages/Index.svelte";
  import Auth from "./pages/Auth.svelte";
  import Blank from "./pages/Blank.svelte";
  import Document from "./pages/Document.svelte";
  import Models from "./pages/Models.svelte";
  import QueryArray from "./pages/QueryArray.svelte";
  import QueryFirst from "./pages/QueryFirst.svelte";
  import Storage from "./pages/Storage.svelte";
  import Lazy from "./pages/Lazy.svelte";

  let routes = [
    { label: 'Index', path: '/', component: Index },
    { label: 'Document', path: '/document', component: Document },
    { label: 'Query First', path: '/query/first', component: QueryFirst },
    { label: 'Query Array', path: '/query/array', component: QueryArray },
    { label: 'Models', path: '/models', component: Models },
    { label: 'Lazy', path: '/lazy', component: Lazy },
    { label: 'Auth', path: '/auth', component: Auth },
    { label: 'Storage', path: '/storage', component: Storage },
    { label: 'Blank', path: '/blank', component: Blank }
  ];

</script>

<Router>
  <div class="header">
    <div class="items">
      {#each routes as { label, path }}
        <Link to={path}>{label}</Link>
      {/each}
    </div>
  </div>
  <div class="content">
    {#each routes as { path, component }}
      <Route path={path} component={component}/>
    {/each}
  </div>
</Router>

<style type="text/scss">
  .header {
    border-bottom: 1px solid #eee;
    padding: 10px 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    > .items {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex: 1;
      > :global(a) {
        display: block;
        margin: 0 20px 0 0;
        text-decoration: none;
        &[aria-current="page"] {
          font-weight: 600;
        }
      }
    }
  }
  .content {
    padding: 10px;
  }
</style>