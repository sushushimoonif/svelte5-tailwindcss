import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    // 添加toast
    add: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        duration: 4000,
        ...toast
      };

      update(toasts => [...toasts, newToast]);

      // 自动移除
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          toastStore.remove(id);
        }, newToast.duration);
      }

      return id;
    },
    // 移除toast
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    // 清空所有toast
    clear: () => {
      update(() => []);
    },
    // 便捷方法
    success: (title: string, message?: string, duration?: number) => {
      return toastStore.add({ type: 'success', title, message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
      return toastStore.add({ type: 'error', title, message, duration });
    },
    warning: (title: string, message?: string, duration?: number) => {
      return toastStore.add({ type: 'warning', title, message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
      return toastStore.add({ type: 'info', title, message, duration });
    }
  };
}

export const toastStore = createToastStore();