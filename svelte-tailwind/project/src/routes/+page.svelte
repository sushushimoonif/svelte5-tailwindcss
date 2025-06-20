<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import PhotoWall from '$lib/components/PhotoWall.svelte';
  import IconButtons from '$lib/components/IconButtons.svelte';
  import DescriptionSection from '$lib/components/DescriptionSection.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import { feedbackStore } from '$lib/stores/feedback';
  import { toastStore } from '$lib/stores/toast';
  import { fetchPageData, submitFeedback, type PageData, ApiError } from '$lib/api';

  let currentPage = 1;
  const totalPages = 10;
  let pageData: PageData | null = null;
  let loading = true;
  let error: string | null = null;
  let retryCount = 0;
  const maxRetries = 3;

  $: feedbackState = $feedbackStore;
  $: pageFeedback = pageData ? feedbackStore.getPageFeedback(currentPage, feedbackState) : { mainContent: null, comments: {} };

  // 加载页面数据
  async function loadPageData(pageId: number, isRetry = false) {
    try {
      if (!isRetry) {
        loading = true;
        error = null;
        retryCount = 0;
      }
      
      pageData = await fetchPageData(pageId);
      error = null;
      retryCount = 0;
    } catch (err) {
      console.error('Error loading page data:', err);
      
      if (err instanceof ApiError) {
        error = err.message;
        
        // 根据错误类型显示不同的Toast
        switch (err.code) {
          case 'NETWORK_ERROR':
            toastStore.error('网络连接失败', '请检查您的网络连接是否正常', 6000);
            break;
          case 'TIMEOUT':
            toastStore.error('请求超时', '网络响应较慢，请稍后重试', 5000);
            break;
          case 'PAGE_NOT_FOUND':
            toastStore.error('页面不存在', `第 ${pageId} 页不存在或已被删除`, 5000);
            break;
          case 'SERVER_ERROR':
            toastStore.error('服务器错误', '服务器暂时无法处理请求，请稍后重试', 6000);
            break;
          case 'INVALID_DATA':
          case 'INCOMPLETE_DATA':
            toastStore.error('数据错误', '服务器返回的数据不完整，请刷新页面重试', 5000);
            break;
          default:
            toastStore.error('加载失败', err.message, 5000);
        }
      } else {
        error = '加载页面数据失败';
        toastStore.error('加载失败', '发生未知错误，请刷新页面重试', 5000);
      }
    } finally {
      loading = false;
    }
  }

  // 重试加载数据
  async function retryLoadData() {
    if (retryCount < maxRetries) {
      retryCount++;
      toastStore.info('重试中...', `正在进行第 ${retryCount} 次重试`, 3000);
      await loadPageData(currentPage, true);
    } else {
      toastStore.error('重试失败', '已达到最大重试次数，请检查网络后手动刷新', 6000);
    }
  }

  // 页面加载时获取数据
  onMount(() => {
    loadPageData(currentPage);
  });

  function handleNavigation(direction: 'prev' | 'next') {
    if (direction === 'prev' && currentPage > 1) {
      currentPage--;
      goto(`/page/${currentPage}`);
    } else if (direction === 'next' && currentPage < totalPages) {
      currentPage++;
      goto(`/page/${currentPage}`);
    }
  }

  async function handleSubmit() {
    if (!pageData) {
      toastStore.error('提交失败', '页面数据未加载完成，请稍后重试', 5000);
      return;
    }
    
    // 显示提交中的提示
    const loadingToastId = toastStore.info('提交中...', '正在提交您的反馈，请稍候', 0);
    
    try {
      // 构建页面评论ID映射
      const pageCommentIds: Record<number, number[]> = {};
      
      // 需要获取所有页面的评论ID来检查完整性
      for (let i = 1; i <= totalPages; i++) {
        try {
          const data = await fetchPageData(i);
          pageCommentIds[i] = data.comments.map(c => c.id);
        } catch (err) {
          console.error(`Failed to load page ${i} for validation:`, err);
          // 如果无法加载某页数据，显示警告但继续
          if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
            toastStore.remove(loadingToastId);
            toastStore.error('网络错误', '无法验证所有页面数据，请检查网络连接', 5000);
            return;
          }
          pageCommentIds[i] = [];
        }
      }
      
      const incompletePage = feedbackStore.findFirstIncompletePage(feedbackState, totalPages, pageCommentIds);
      
      if (incompletePage !== null) {
        toastStore.remove(loadingToastId);
        toastStore.warning(
          '反馈未完成', 
          `请完成第 ${incompletePage} 页的所有反馈后再提交！`,
          5000
        );
        if (incompletePage === 1) {
          goto('/');
        } else {
          goto(`/page/${incompletePage}`);
        }
        return;
      }
      
      const submissionData = feedbackStore.convertToSubmissionFormat(feedbackState);
      
      if (submissionData.length === 0) {
        toastStore.remove(loadingToastId);
        toastStore.warning('没有反馈数据', '请至少完成一项反馈后再提交', 5000);
        return;
      }
      
      await submitFeedback(submissionData);
      
      toastStore.remove(loadingToastId);
      toastStore.success(
        '提交成功！', 
        `成功提交了 ${submissionData.length} 项反馈，感谢您的参与！`,
        6000
      );
      
    } catch (err) {
      console.error('Submit error:', err);
      toastStore.remove(loadingToastId);
      
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'NETWORK_ERROR':
            toastStore.error('网络连接失败', '无法连接到服务器，请检查网络后重试', 6000);
            break;
          case 'TIMEOUT':
            toastStore.error('提交超时', '网络响应较慢，请稍后重试', 5000);
            break;
          case 'INVALID_DATA':
            toastStore.error('数据格式错误', '提交的数据格式不正确，请刷新页面重试', 5000);
            break;
          case 'SERVER_ERROR':
            toastStore.error('服务器错误', '服务器暂时无法处理请求，请稍后重试', 6000);
            break;
          case 'PAYLOAD_TOO_LARGE':
            toastStore.error('数据过大', '提交的反馈数据过大，请联系管理员', 5000);
            break;
          default:
            toastStore.error('提交失败', err.message, 5000);
        }
      } else {
        toastStore.error('提交失败', '发生未知错误，请稍后重试', 5000);
      }
    }
  }

  function handleMainContentFeedback(feedback: 'like' | 'question' | 'dislike' | null) {
    feedbackStore.setMainContentFeedback(currentPage, feedback);
  }
</script>

<svelte:head>
  <title>{pageData?.title || 'Photo Gallery Explorer'} - Page {currentPage}</title>
</svelte:head>

<div class="h-screen bg-gray-800 flex flex-col max-w-[1424px] max-h-[978px] mx-auto overflow-hidden">
  <div class="container mx-auto px-3 py-3 flex-1 flex flex-col overflow-hidden max-w-full">
    {#if loading}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <div class="text-white text-sm">加载中...</div>
          <div class="text-gray-400 text-xs mt-1">正在获取页面数据</div>
        </div>
      </div>
    {:else if error}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center max-w-md">
          <div class="text-red-400 text-4xl mb-3">⚠️</div>
          <div class="text-red-400 text-lg mb-3">加载失败</div>
          <div class="text-gray-300 text-sm mb-4">{error}</div>
          <div class="space-x-3">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors duration-200 text-sm"
              on:click={() => loadPageData(currentPage)}
            >
              重新加载
            </button>
            {#if retryCount < maxRetries}
              <button
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg transition-colors duration-200 text-sm"
                on:click={retryLoadData}
              >
                自动重试 ({retryCount}/{maxRetries})
              </button>
            {/if}
          </div>
        </div>
      </div>
    {:else if pageData}
      <!-- Header Section -->
      <div class="mb-3 flex-shrink-0">
        <h1 class="text-3xl font-bold text-white mb-2 text-left">
          {pageData.title}
        </h1>
        <p class="text-sm text-gray-300 leading-tight text-left mb-2">
          {pageData.description}
        </p>
        <div class="w-full h-px bg-gray-600"></div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
        <!-- Left Section -->
        <div class="flex flex-col space-y-3 overflow-hidden min-h-0">
          <!-- Photo Wall -->
          <div class="flex-shrink-0">
            <PhotoWall photos={pageData.image_urls} />
          </div>

          <!-- Main Content Text -->
          <div class="bg-gray-900 rounded-lg p-4 shadow-xl flex-1 flex flex-col overflow-hidden min-h-0">
            <div class="text-gray-200 leading-relaxed mb-4 space-y-3 flex-1 text-sm overflow-y-auto custom-scrollbar">
              {#each pageData.content.split('\n\n') as paragraph}
                <p class="text-gray-200">{paragraph}</p>
              {/each}
            </div>
            
            <!-- Icon Buttons - 使用 large 尺寸 -->
            <div class="flex justify-center space-x-4 mt-auto flex-shrink-0">
              <IconButtons 
                selectedButton={pageFeedback.mainContent}
                onSelectionChange={handleMainContentFeedback}
                size="large"
              />
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="bg-gray-900 rounded-lg p-4 shadow-xl overflow-hidden min-h-0">
          <DescriptionSection 
            comments={pageData.comments} 
            {currentPage}
          />
        </div>
      </div>

      <!-- Navigation -->
      <Navigation 
        {currentPage} 
        {totalPages} 
        onNavigate={handleNavigation}
        onSubmit={handleSubmit}
      />
    {/if}
  </div>
</div>