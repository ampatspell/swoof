<script>
  import { JSON, setGlobal } from 'swoof';
  import Messages from './messages';

  let messages = new Messages();
  setGlobal({ messages });

</script>

<div class="json">
  <JSON object={$messages}/>
  {#each $messages.models as model}
    <div>
      {model}
      <input bind:value={model.doc.data.name}/>
    </div>
  {/each}
  <div>{$messages.names}</div>
</div>

<style>
  .json {
    margin-top: 15px;
  }
</style>
