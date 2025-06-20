<script lang="ts">
  import { ChevronLeft, ChevronRight, Send } from 'lucide-svelte';
  
  export let currentPage: number;
  export let totalPages: number;
  export let onNavigate: (direction: 'prev' | 'next') => void;
  export let onSubmit: () => void;
  
  $: canGoPrev = currentPage > 1;
  $: canGoNext = currentPage < totalPages;
  $: isLastPage = currentPage === totalPages;
</script>

<div class="fixed bottom-4 right-4 flex space-x-2">
  {#if isLastPage}
    <button
      class="btn-transition bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-1.5 font-semibold text-sm"
      on:click={onSubmit}
    >
      <Send size={16} />
      <span>Submit</span>
    </button>
  {:else}
    {#if canGoPrev}
      <button
        class="btn-transition bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg"
        on:click={() => onNavigate('prev')}
        title="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
    {/if}
    
    {#if canGoNext}
      <button
        class="btn-transition bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg"
        on:click={() => onNavigate('next')}
        title="Next page"
      >
        <ChevronRight size={18} />
      </button>
    {/if}
  {/if}
</div>

<!-- Page indicator -->
<div class="fixed bottom-4 left-4 bg-gray-900 text-white px-2.5 py-1.5 rounded-full shadow-lg">
  <span class="text-xs font-medium">
    Page {currentPage} of {totalPages}
  </span>
</div>