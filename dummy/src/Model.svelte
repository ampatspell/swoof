<script>
  import { JSON, stores, setGlobal } from 'swoof';
  import Message from './message';

  let message = new Message();
  setGlobal({ message });

</script>

<input bind:value={$message.doc.data.name}/>

<div class="json">
  <JSON object={$message}/>
</div>

<style>
  .json {
    margin-top: 15px;
  }
</style>
