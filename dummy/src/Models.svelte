<script>
  import { JSON, setGlobal } from 'swoof';
  import Messages from './messages';

  let messages = new Messages();
  setGlobal({ messages });

</script>

<div class="json">
  <input bind:value={$messages.name}/>
  <JSON object={$messages}/>
  {#each $messages.models as model}
    <div>
      {model}
      <input bind:value={model.name}/>
      <input bind:value={model.message}/>
    </div>
  {/each}
  <div>{$messages.names}</div>
  <div>{$messages.messages}</div>
</div>

<style>
  .json {
    margin-top: 15px;
  }
</style>
