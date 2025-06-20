<script lang="ts">
  import '../app.css';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
</script>

<main class="min-h-screen bg-gray-800">
  <slot />
</main>

<!-- Toast Container -->
<ToastContainer />