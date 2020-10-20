<script>
  import { JSON } from 'swoof';
  import Messages from './messages';

  let messages = new Messages();

</script>

<div class="json">
  <JSON object={$messages}/>
</div>

<style>
  .json {
    margin-top: 15px;
  }
</style>
