<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  
  export let photos: string[] = [];
  
  let currentIndex = 0;
  $: canScrollLeft = currentIndex > 0;
  $: canScrollRight = currentIndex + 3 < photos.length;
  
  function scrollLeft() {
    if (canScrollLeft) {
      currentIndex--;
    }
  }
  
  function scrollRight() {
    if (canScrollRight) {
      currentIndex++;
    }
  }
  
  $: visiblePhotos = photos.slice(currentIndex, currentIndex + 3);
  $: currentPage = currentIndex + 1;
  $: totalPages = Math.max(1, photos.length - 2);
</script>

<div class="relative">
  <!-- 图片展示区域 -->
  <div class="flex space-x-2 justify-center">
    {#each visiblePhotos as photo, index}
      <div class="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex-1">
        <img 
          src={photo} 
          alt="Gallery image {currentIndex + index + 1}"
          class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </div>
    {/each}
  </div>
  
  <!-- 悬浮控制按钮 -->
  {#if photos.length > 3}
    <!-- 左侧切换按钮 -->
    <button
      class="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
      on:click={scrollLeft}
      disabled={!canScrollLeft}
      title="上一组"
    >
      <ChevronLeft size={16} />
    </button>
    
    <!-- 右侧切换按钮 -->
    <button
      class="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
      on:click={scrollRight}
      disabled={!canScrollRight}
      title="下一组"
    >
      <ChevronRight size={16} />
    </button>
    
    <!-- 页码指示器 -->
    <div class="absolute bottom-1 left-1/2 -translate-x-1/2">
      <span class="bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
        {currentPage} / {totalPages}
      </span>
    </div>
  {:else}
    <!-- 当图片少于等于3张时的页码指示器 -->
    <div class="absolute bottom-1 left-1/2 -translate-x-1/2">
      <span class="bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
        1 / 1
      </span>
    </div>
  {/if}
</div>