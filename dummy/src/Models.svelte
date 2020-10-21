<script>
  import { JSON, setGlobal } from 'swoof';
  import Messages from './messages';

  let messages = new Messages();
  setGlobal({ messages });

</script>

<input bind:value={$messages.foo}/>
<input bind:value={$messages.name}/>

<JSON object={$messages}/>

<!-- {#each $messages.query.content as doc}
  <div>
    <JSON object={doc.serialized}/>
  </div>
{/each} -->

<!-- <div class="json">
  {#each $messages.models as model}
    <div>
      <JSON object={model}/>
      <input bind:value={model.name}/>
      <input bind:value={model.message}/>
    </div>
  {/each}
</div> -->

<!-- <div>{$messages.names}</div>
<div>{$messages.messages}</div> -->


<style>
  .json {
    margin-top: 15px;
  }
</style>
