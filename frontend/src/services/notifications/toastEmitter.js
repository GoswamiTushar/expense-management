/**
 * In-app toast event emitter for real-time notification toasts.
 */
class ToastEmitter {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  emit(title, message, type = 'info') {
    this.listeners.forEach((cb) => {
      try {
        cb({ id: Date.now(), title, message, type });
      } catch (e) {
        console.error('Toast callback error:', e);
      }
    });
  }
}

export const toastEmitter = new ToastEmitter();
