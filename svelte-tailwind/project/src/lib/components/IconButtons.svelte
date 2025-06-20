<script lang="ts">
  import { ThumbsUp, CircleHelp as HelpCircle, ThumbsDown } from 'lucide-svelte';
  
  export let selectedButton: 'like' | 'question' | 'dislike' | null = null;
  export let onSelectionChange: (selection: 'like' | 'question' | 'dislike' | null) => void = () => {};
  export let size: 'small' | 'large' = 'small'; // 新增 size 属性
  
  function handleClick(button: 'like' | 'question' | 'dislike') {
    const newSelection = selectedButton === button ? null : button;
    selectedButton = newSelection;
    onSelectionChange(newSelection);
  }
  
  // 根据 size 属性决定样式
  $: iconSize = size === 'large' ? 24 : 16;
  $: buttonPadding = size === 'large' ? 'p-3' : 'p-1.5';
  $: buttonSpacing = size === 'large' ? 'space-x-4' : 'space-x-2';
  $: buttonRadius = size === 'large' ? 'rounded-xl' : 'rounded-full';
  $: buttonShadow = size === 'large' ? 'shadow-lg hover:shadow-xl' : '';
  $: buttonTransform = size === 'large' ? 'transform hover:scale-110' : 'hover:scale-110';
</script>

<div class="flex {buttonSpacing}">
  <button
    class="icon-btn icon-btn-like {selectedButton === 'like' ? 'active-like' : ''} {buttonPadding} {buttonRadius} {buttonShadow} {buttonTransform} transition-all duration-200"
    on:click={() => handleClick('like')}
    title="Like"
  >
    <ThumbsUp size={iconSize} />
  </button>
  
  <button
    class="icon-btn icon-btn-question {selectedButton === 'question' ? 'active-question' : ''} {buttonPadding} {buttonRadius} {buttonShadow} {buttonTransform} transition-all duration-200"
    on:click={() => handleClick('question')}
    title="Question"
  >
    <HelpCircle size={iconSize} />
  </button>
  
  <button
    class="icon-btn icon-btn-dislike {selectedButton === 'dislike' ? 'active-dislike' : ''} {buttonPadding} {buttonRadius} {buttonShadow} {buttonTransform} transition-all duration-200"
    on:click={() => handleClick('dislike')}
    title="Dislike"
  >
    <ThumbsDown size={iconSize} />
  </button>
</div>