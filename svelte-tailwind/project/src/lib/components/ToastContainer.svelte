<script lang="ts">
  import { toastStore } from '$lib/stores/toast';
  import Toast from './Toast.svelte';
  import { fly } from 'svelte/transition';
  
  $: toasts = $toastStore;
</script>

<!-- Toast Container -->
<div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
  {#each toasts as toast (toast.id)}
    <div 
      in:fly={{ x: 300, duration: 300 }}
      out:fly={{ x: 300, duration: 200 }}
      class="pointer-events-auto"
    >
      <Toast {toast} />
    </div>
  {/each}
</div>