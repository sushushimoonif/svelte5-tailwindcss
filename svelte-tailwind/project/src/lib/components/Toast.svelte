<script lang="ts">
  import { CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, Info, X } from 'lucide-svelte';
  import { toastStore, type Toast } from '$lib/stores/toast';
  
  export let toast: Toast;
  
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };
  
  const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };
  
  const textColors = {
    success: 'text-green-50',
    error: 'text-red-50',
    warning: 'text-yellow-50',
    info: 'text-blue-50'
  };
  
  $: IconComponent = icons[toast.type];
  $: colorClass = colors[toast.type];
  $: textColorClass = textColors[toast.type];
  
  function handleClose() {
    toastStore.remove(toast.id);
  }
</script>

<div 
  class="flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 {colorClass} {textColorClass} backdrop-blur-sm bg-opacity-95 min-w-80 max-w-md transform transition-all duration-300 ease-in-out"
  role="alert"
>
  <!-- Icon -->
  <div class="flex-shrink-0 mt-0.5">
    <IconComponent size={20} class="text-current" />
  </div>
  
  <!-- Content -->
  <div class="flex-1 min-w-0">
    <h4 class="text-sm font-semibold text-current">
      {toast.title}
    </h4>
    {#if toast.message}
      <p class="mt-1 text-sm text-current opacity-90 leading-relaxed">
        {toast.message}
      </p>
    {/if}
  </div>
  
  <!-- Close button -->
  <button
    on:click={handleClose}
    class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-black hover:bg-opacity-10"
    aria-label="关闭通知"
  >
    <X size={16} />
  </button>
</div>