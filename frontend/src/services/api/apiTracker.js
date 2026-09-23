/**
 * apiTracker — Global network activity & slow-request tracker for Render backend.
 * Broadcasts state changes to subscribers (e.g. GlobalApiLoader).
 */
class ApiTracker {
  constructor() {
    this.activeCount = 0;
    this.isSlow = false;
    this.slowTimer = null;
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    // Send current state immediately upon subscription
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  getState() {
    return {
      activeCount: this.activeCount,
      isLoading: this.activeCount > 0,
      isSlow: this.isSlow,
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('ApiTracker listener error:', err);
      }
    });
  }

  startRequest() {
    this.activeCount += 1;

    // Start slow-request timer if not already running
    if (!this.slowTimer) {
      this.slowTimer = setTimeout(() => {
        if (this.activeCount > 0) {
          this.isSlow = true;
          this.notify();
        }
      }, 2000); // 2s threshold for Render cold-start or slow network notice
    }

    this.notify();
  }

  endRequest() {
    this.activeCount = Math.max(0, this.activeCount - 1);

    if (this.activeCount === 0) {
      if (this.slowTimer) {
        clearTimeout(this.slowTimer);
        this.slowTimer = null;
      }
      this.isSlow = false;
    }

    this.notify();
  }
}

export const apiTracker = new ApiTracker();
