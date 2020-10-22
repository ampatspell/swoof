<script>
  export let object;
  $: string = JSON.stringify(object, null, 2);
</script>

<style>
  .json {
    font-size: 13px;
    white-space: pre-wrap;
  }
</style>

<div class="json">{string}</div>
