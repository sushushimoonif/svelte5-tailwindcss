import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface FeedbackItem {
  session_id: string;
  page_id: number;
  page_like?: boolean;
  page_dislike?: boolean;
  page_confused?: boolean;
  comment_id?: number;
  comment_like?: boolean;
  comment_dislike?: boolean;
  comment_confused?: boolean;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const feedbackData: FeedbackItem[] = await request.json();
    
    // 验证数据格式
    if (!Array.isArray(feedbackData)) {
      return json({ error: 'Invalid data format: expected array' }, { status: 400 });
    }
    
    if (feedbackData.length === 0) {
      return json({ error: 'No feedback data provided' }, { status: 400 });
    }
    
    // 验证每个反馈项
    for (const item of feedbackData) {
      if (!item.session_id || typeof item.session_id !== 'string') {
        return json({ error: 'Missing or invalid session_id' }, { status: 400 });
      }
      
      if (typeof item.page_id !== 'number' || item.page_id < 1) {
        return json({ error: 'Missing or invalid page_id' }, { status: 400 });
      }
      
      // 验证反馈类型
      const hasPageFeedback = item.page_like !== undefined || item.page_dislike !== undefined || item.page_confused !== undefined;
      const hasCommentFeedback = item.comment_id !== undefined && (item.comment_like !== undefined || item.comment_dislike !== undefined || item.comment_confused !== undefined);
      
      if (!hasPageFeedback && !hasCommentFeedback) {
        return json({ error: 'Invalid feedback item: no feedback provided' }, { status: 400 });
      }
    }
    
    // 模拟随机错误（用于测试错误处理）
    if (Math.random() < 0.03) { // 3% 概率模拟服务器错误
      return json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // 模拟保存到数据库
    console.log('Received feedback data:', JSON.stringify(feedbackData, null, 2));
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
    
    return json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      received_items: feedbackData.length,
      session_id: feedbackData[0]?.session_id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    
    if (error instanceof SyntaxError) {
      return json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};