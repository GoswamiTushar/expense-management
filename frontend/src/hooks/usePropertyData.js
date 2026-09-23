import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../services/api/propertyApi';
import { getExpensesByProperty } from '../services/api/expenseApi';
import { getSettlementsByProperty } from '../services/api/settlementApi';
import {
  getNotificationsByProperty,
  markNotificationsRead,
} from '../services/api/notificationApi';
import { computeBalances } from '../services/engine/balanceEngine';
import { triggerSystemNotification } from '../services/notifications/pushService';
import { toastEmitter } from '../services/notifications/toastEmitter';

/**
 * usePropertyData — all data fetching is gated behind `currentUser`.
 * Pass the authenticated user object; pass null when logged out.
 * No API calls fire until currentUser is set.
 */
export const usePropertyData = (currentUser) => {
  const [loading, setLoading] = useState(Boolean(currentUser?._id));
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const currentUserId = String(currentUser?._id || currentUser?.id || '');

  const fetchDetails = async (propId) => {
    if (!propId) {
      setExpenses([]);
      setSettlements([]);
      setNotifications([]);
      return;
    }
    setLoadingDetails(true);
    try {
      const [e, s, notifs] = await Promise.all([
        getExpensesByProperty(propId),
        getSettlementsByProperty(propId),
        getNotificationsByProperty(propId),
      ]);
      setExpenses(e);
      setSettlements(s);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching property details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!currentUser?._id && !currentUser?.id) return; // ← guard: never fetch when unauthenticated
    setLoading(true);
    try {
      const props = await getProperties();
      setProperties(props);
      const initial = props[0] || null;
      setActiveProperty(initial);
      if (initial?._id || initial?.id) {
        await fetchDetails(initial._id || initial.id);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, currentUser?.id]);

  // Reset all data immediately when user logs out
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setProperties([]);
      setActiveProperty(null);
      setExpenses([]);
      setSettlements([]);
      setNotifications([]);
      return;
    }
    loadData();
  }, [currentUser?._id, currentUser?.id]);

  useEffect(() => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (propId && (currentUser?._id || currentUser?.id)) {
      fetchDetails(propId);
    }
  }, [activeProperty?._id, activeProperty?.id]);

  const refresh = useCallback(async () => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (!propId || (!currentUser?._id && !currentUser?.id)) return;
    setRefreshing(true);
    await fetchDetails(propId);
    setRefreshing(false);
  }, [activeProperty, currentUser]);

  // Periodic lightweight notification sync (every 25s) to capture events from partners
  useEffect(() => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (!propId || (!currentUser?._id && !currentUser?.id)) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await getNotificationsByProperty(propId);
        setNotifications((prev) => {
          // If a new notification has arrived that was created by another manager, alert!
          if (fresh.length > prev.length && prev.length > 0) {
            const newest = fresh[0];
            if (newest && String(newest.actorId) !== currentUserId) {
              triggerSystemNotification(newest.title, newest.body);
              toastEmitter.emit(newest.title, newest.body, newest.type || 'info');
            }
          }
          return fresh;
        });
      } catch (_) {}
    }, 25000);

    return () => clearInterval(interval);
  }, [activeProperty?._id, activeProperty?.id, currentUserId]);

  const markNotificationsAsRead = async () => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (!propId) return;
    await markNotificationsRead(propId);
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        readBy: Array.from(new Set([...(n.readBy || []), currentUserId])),
      }))
    );
  };

  const unreadCount = notifications.filter(
    (n) => !(n.readBy || []).includes(currentUserId)
  ).length;

  const balanceData =
    activeProperty && currentUser
      ? computeBalances(
          expenses,
          settlements,
          activeProperty.managers || [],
          currentUser._id || currentUser.id
        )
      : null;

  return {
    loading,
    loadingDetails,
    refreshing,
    refresh,
    properties,
    setProperties,
    activeProperty,
    setActiveProperty,
    expenses,
    setExpenses,
    settlements,
    setSettlements,
    notifications,
    setNotifications,
    unreadCount,
    markNotificationsAsRead,
    balanceData,
    reload: loadData,
  };
};
