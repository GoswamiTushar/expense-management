import { Platform, AppState } from 'react-native';
import { CONFIG } from '../../config/urls';
import { toastEmitter } from '../notifications/toastEmitter';

class NotificationSocketManager {
  constructor() {
    this.ws = null;
    this.currentPropertyId = null;
    this.currentUserId = null;
    this.listeners = new Set();
    this.pingTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.isExplicitlyClosed = false;

    this.setupAppStateListener();
  }

  setupAppStateListener() {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.disconnect();
        } else {
          this.reconnectAttempts = 0;
          this.connect();
        }
      });
    } else {
      AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          this.reconnectAttempts = 0;
          this.connect();
        } else {
          this.disconnect();
        }
      });
    }
  }

  subscribe(propertyId, userId, onNotification) {
    this.currentPropertyId = propertyId;
    this.currentUserId = userId;
    this.isExplicitlyClosed = false;

    if (onNotification) {
      this.listeners.add(onNotification);
    }

    this.connect();

    return () => {
      if (onNotification) {
        this.listeners.delete(onNotification);
      }
      if (this.listeners.size === 0) {
        this.isExplicitlyClosed = true;
        this.disconnect();
      }
    };
  }

  connect() {
    if (!this.currentPropertyId || this.isExplicitlyClosed) return;

    // Close any previous socket cleanly
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);

    try {
      const baseWsUrl = CONFIG.API_URL.replace(/^http/, 'ws');
      const url = `${baseWsUrl}/notifications/ws/${this.currentPropertyId}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        // Keep-alive heartbeat: ping every 30s to prevent Render 100s idle termination
        this.pingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'new_notification' && payload.data) {
            const notif = payload.data;

            // Trigger in-app toast if created by another co-manager
            if (String(notif.actorId) !== String(this.currentUserId)) {
              toastEmitter.emit(notif.title, notif.body, notif.type || 'info');
            }

            // Notify all registered UI listeners (e.g. usePropertyData)
            this.listeners.forEach((listener) => {
              try {
                listener(notif);
              } catch (_) {}
            });
          }
        } catch (_) {}
      };

      this.ws.onerror = () => {
        // Handled in onclose
      };

      this.ws.onclose = () => {
        clearInterval(this.pingTimer);
        this.ws = null;

        // Auto reconnect with exponential backoff if not closed on purpose
        if (!this.isExplicitlyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 20000);
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (err) {
      console.warn('[NotificationSocket] Connection initialization error:', err.message);
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
  }
}

export const notificationSocket = new NotificationSocketManager();
