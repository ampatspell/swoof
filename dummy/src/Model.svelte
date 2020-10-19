<script>
  import { JSON, stores, setGlobal } from 'swoof';
  import Message from './message';

  let message = new Message();
  setGlobal({ message });

</script>

<div class="single">
  <JSON object={$message}/>
</div>

<style>
</style>
