import { writable } from 'svelte/store';

export interface PageFeedback {
  mainContent: 'like' | 'question' | 'dislike' | null;
  comments: Record<number, 'like' | 'question' | 'dislike' | null>;
}

export interface FeedbackState {
  [pageNumber: number]: PageFeedback;
}

// 生成会话ID
function generateSessionId(): string {
  return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
}

// 创建反馈状态存储
function createFeedbackStore() {
  const { subscribe, set, update } = writable<FeedbackState>({});
  
  // 生成并存储会话ID
  const sessionId = generateSessionId();

  return {
    subscribe,
    sessionId,
    // 设置主内容的反馈
    setMainContentFeedback: (page: number, feedback: 'like' | 'question' | 'dislike' | null) => {
      update(state => {
        if (!state[page]) {
          state[page] = { mainContent: null, comments: {} };
        }
        state[page].mainContent = feedback;
        return state;
      });
    },
    // 设置评论的反馈
    setCommentFeedback: (page: number, commentId: number, feedback: 'like' | 'question' | 'dislike' | null) => {
      update(state => {
        if (!state[page]) {
          state[page] = { mainContent: null, comments: {} };
        }
        state[page].comments[commentId] = feedback;
        return state;
      });
    },
    // 获取页面的反馈状态
    getPageFeedback: (page: number, state: FeedbackState): PageFeedback => {
      return state[page] || { mainContent: null, comments: {} };
    },
    // 检查页面是否有完整反馈
    isPageComplete: (page: number, state: FeedbackState, commentIds: number[]): boolean => {
      const pageFeedback = state[page];
      if (!pageFeedback || pageFeedback.mainContent === null) {
        return false;
      }
      
      for (const commentId of commentIds) {
        if (!pageFeedback.comments[commentId]) {
          return false;
        }
      }
      
      return true;
    },
    // 找到第一个未完成的页面
    findFirstIncompletePage: (state: FeedbackState, totalPages: number, pageCommentIds: Record<number, number[]>): number | null => {
      for (let page = 1; page <= totalPages; page++) {
        const commentIds = pageCommentIds[page] || [];
        if (!feedbackStore.isPageComplete(page, state, commentIds)) {
          return page;
        }
      }
      return null;
    },
    // 转换为提交格式
    convertToSubmissionFormat: (state: FeedbackState): any[] => {
      const result: any[] = [];
      
      for (const [pageId, pageFeedback] of Object.entries(state)) {
        const pageNum = parseInt(pageId);
        
        // 添加页面主内容反馈
        if (pageFeedback.mainContent) {
          result.push({
            session_id: sessionId,
            page_id: pageNum,
            page_like: pageFeedback.mainContent === 'like',
            page_dislike: pageFeedback.mainContent === 'dislike',
            page_confused: pageFeedback.mainContent === 'question'
          });
        }
        
        // 添加评论反馈
        for (const [commentId, feedback] of Object.entries(pageFeedback.comments)) {
          if (feedback) {
            result.push({
              session_id: sessionId,
              page_id: pageNum,
              comment_id: parseInt(commentId),
              comment_like: feedback === 'like',
              comment_dislike: feedback === 'dislike',
              comment_confused: feedback === 'question'
            });
          }
        }
      }
      
      return result;
    }
  };
}

export const feedbackStore = createFeedbackStore();