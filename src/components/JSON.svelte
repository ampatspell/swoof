<script>
  export let object;
  $: string = JSON.stringify(object, null, 2);
</script>

<style>
  .json {
    font-family: 'Menlo';
    font-size: 12px;
    white-space: pre-wrap;
  }
</style>

<div class="json">{string}</div>