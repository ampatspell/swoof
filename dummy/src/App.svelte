<script>
  import { swoof, state, setGlobal } from 'swoof';
  import { config, isDevelopment } from './lib/config';

  import Pages from './Pages.svelte';
  import State from './components/State.svelte';

  let store = swoof.create('main', config);

  if(isDevelopment) {
    setGlobal({ store });
    setGlobal({ state });
  }

</script>

<Pages/>

<div class="state">
  <State/>
</div>

<style type="text/scss">
  .state {
    border-top: 1px solid fade-out(#000, 0.95);
    margin-top: 25px;
    padding: 10px;
  }
</style>
