<script lang="ts">
  import IconButtons from './IconButtons.svelte';
  import { feedbackStore } from '$lib/stores/feedback';
  
  export let comments: Array<{id: number, content: string}> = [];
  export let currentPage: number;
  
  $: feedbackState = $feedbackStore;
  $: pageFeedback = feedbackStore.getPageFeedback(currentPage, feedbackState);
  
  function handleCommentFeedback(commentId: number, feedback: 'like' | 'question' | 'dislike' | null) {
    feedbackStore.setCommentFeedback(currentPage, commentId, feedback);
  }
</script>

<div class="space-y-4 overflow-y-auto h-full custom-scrollbar">
  {#each comments as comment}
    <div class="border-b border-gray-700 pb-3 last:border-b-0">
      <div class="flex items-start justify-between gap-3">
        <p class="text-gray-200 flex-1 leading-relaxed text-sm">
          {comment.content}
        </p>
        <div class="flex-shrink-0">
          <IconButtons 
            selectedButton={pageFeedback.comments[comment.id] || null}
            onSelectionChange={(selection) => handleCommentFeedback(comment.id, selection)}
          />
        </div>
      </div>
    </div>
  {/each}
</div>