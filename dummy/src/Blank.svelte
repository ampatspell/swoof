<script>
  import { state } from 'swoof';
</script>

<div class="snapshots">
  {#each $state.snapshots as snapshot}
    <div>{snapshot}</div>
  {/each}
</div>
