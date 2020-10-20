<script>
  import { JSON, setGlobal } from 'swoof';
  import Messages from './messages';

  let messages = new Messages();
  setGlobal({ messages });

</script>

<div class="json">
  <JSON object={$messages}/>
  <JSON object={$messages.models}/>
  {#each $messages.models as model}
    <div>{model}</div>
  {/each}
</div>

<style>
  .json {
    margin-top: 15px;
  }
</style>
