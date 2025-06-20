export interface PageData {
  id: number;
  title: string;
  description: string;
  content: string;
  image_urls: string[];
  comments: Array<{
    id: number;
    content: string;
  }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchPageData(pageId: number): Promise<PageData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(`/api/page/${pageId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError('页面不存在', response.status, 'PAGE_NOT_FOUND');
      } else if (response.status === 500) {
        throw new ApiError('服务器内部错误，请稍后重试', response.status, 'SERVER_ERROR');
      } else if (response.status >= 400 && response.status < 500) {
        throw new ApiError('请求参数错误', response.status, 'CLIENT_ERROR');
      } else {
        throw new ApiError(`请求失败 (${response.status})`, response.status, 'HTTP_ERROR');
      }
    }

    const data = await response.json();
    
    // 验证返回数据的完整性
    if (!data || typeof data !== 'object') {
      throw new ApiError('服务器返回数据格式错误', 0, 'INVALID_DATA');
    }

    if (!data.id || !data.title || !data.content || !Array.isArray(data.image_urls) || !Array.isArray(data.comments)) {
      throw new ApiError('服务器返回数据不完整', 0, 'INCOMPLETE_DATA');
    }

    return data;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('请求超时，请检查网络连接', 0, 'TIMEOUT');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new ApiError('网络连接失败，请检查网络设置', 0, 'NETWORK_ERROR');
      } else if (error.message.includes('JSON')) {
        throw new ApiError('服务器返回数据格式错误', 0, 'PARSE_ERROR');
      }
    }

    throw new ApiError('加载页面数据时发生未知错误', 0, 'UNKNOWN_ERROR');
  }
}

export async function submitFeedback(feedbackData: any[]): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    const response = await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(feedbackData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        throw new ApiError('提交的数据格式不正确', response.status, 'INVALID_DATA');
      } else if (response.status === 500) {
        throw new ApiError('服务器处理错误，请稍后重试', response.status, 'SERVER_ERROR');
      } else if (response.status === 413) {
        throw new ApiError('提交的数据过大', response.status, 'PAYLOAD_TOO_LARGE');
      } else if (response.status >= 400 && response.status < 500) {
        throw new ApiError('请求被拒绝，请检查数据', response.status, 'CLIENT_ERROR');
      } else {
        throw new ApiError(`提交失败 (${response.status})`, response.status, 'HTTP_ERROR');
      }
    }

    const result = await response.json();
    
    if (!result || typeof result !== 'object') {
      throw new ApiError('服务器返回数据格式错误', 0, 'INVALID_RESPONSE');
    }

    return result;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('提交超时，请检查网络连接后重试', 0, 'TIMEOUT');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new ApiError('网络连接失败，请检查网络设置后重试', 0, 'NETWORK_ERROR');
      } else if (error.message.includes('JSON')) {
        throw new ApiError('服务器返回数据格式错误', 0, 'PARSE_ERROR');
      }
    }

    throw new ApiError('提交反馈时发生未知错误', 0, 'UNKNOWN_ERROR');
  }
}