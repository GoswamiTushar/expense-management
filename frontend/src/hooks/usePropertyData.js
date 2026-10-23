import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../services/api/propertyApi';
import { getExpensesByProperty, getExpensesPaginated } from '../services/api/expenseApi';
import {
  getSettlementsByProperty,
  getSettlementsPaginated,
  getPropertyBalances,
} from '../services/api/settlementApi';
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
  const [totalExpenseCount, setTotalExpenseCount] = useState(0);
  const [hasMoreExpenses, setHasMoreExpenses] = useState(false);
  const [loadingMoreExpenses, setLoadingMoreExpenses] = useState(false);

  const [settlements, setSettlements] = useState([]);
  const [totalSettlementCount, setTotalSettlementCount] = useState(0);
  const [hasMoreSettlements, setHasMoreSettlements] = useState(false);
  const [loadingMoreSettlements, setLoadingMoreSettlements] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [serverBalances, setServerBalances] = useState(null);

  const currentUserId = String(currentUser?._id || currentUser?.id || '');

  const fetchDetails = async (propId) => {
    if (!propId) {
      setExpenses([]);
      setTotalExpenseCount(0);
      setHasMoreExpenses(false);
      setSettlements([]);
      setTotalSettlementCount(0);
      setHasMoreSettlements(false);
      setNotifications([]);
      setServerBalances(null);
      return;
    }
    setLoadingDetails(true);
    try {
      const [expPage, setPage, notifs, balances] = await Promise.all([
        getExpensesPaginated(propId, 0, 15),
        getSettlementsPaginated(propId, 'all', 0, 15),
        getNotificationsByProperty(propId),
        getPropertyBalances(propId).catch(() => null),
      ]);
      setExpenses(expPage.items || []);
      setTotalExpenseCount(expPage.total || 0);
      setHasMoreExpenses(Boolean(expPage.hasMore));

      setSettlements(setPage.items || []);
      setTotalSettlementCount(setPage.total || 0);
      setHasMoreSettlements(Boolean(setPage.hasMore));

      setNotifications(notifs || []);
      if (balances) {
        setServerBalances(balances);
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadMoreExpenses = async () => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (!propId || loadingMoreExpenses || !hasMoreExpenses) return;
    setLoadingMoreExpenses(true);
    try {
      const next = await getExpensesPaginated(propId, expenses.length, 15);
      setExpenses((prev) => {
        const existingIds = new Set(prev.map((e) => e._id || e.id));
        const filteredNew = (next.items || []).filter((e) => !existingIds.has(e._id || e.id));
        return [...prev, ...filteredNew];
      });
      setHasMoreExpenses(Boolean(next.hasMore));
      setTotalExpenseCount(next.total || expenses.length);
    } catch (err) {
      console.error('Error loading more expenses:', err);
    } finally {
      setLoadingMoreExpenses(false);
    }
  };

  const loadMoreSettlements = async (statusFilter = 'all') => {
    const propId = activeProperty?._id || activeProperty?.id;
    if (!propId || loadingMoreSettlements || !hasMoreSettlements) return;
    setLoadingMoreSettlements(true);
    try {
      const next = await getSettlementsPaginated(propId, statusFilter, settlements.length, 15);
      setSettlements((prev) => {
        const existingIds = new Set(prev.map((s) => s._id || s.id));
        const filteredNew = (next.items || []).filter((s) => !existingIds.has(s._id || s.id));
        return [...prev, ...filteredNew];
      });
      setHasMoreSettlements(Boolean(next.hasMore));
      setTotalSettlementCount(next.total || settlements.length);
    } catch (err) {
      console.error('Error loading more settlements:', err);
    } finally {
      setLoadingMoreSettlements(false);
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
    serverBalances ||
    (activeProperty && currentUser
      ? computeBalances(
          expenses,
          settlements,
          activeProperty.managers || [],
          currentUser._id || currentUser.id
        )
      : null);

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
    totalExpenseCount,
    setTotalExpenseCount,
    hasMoreExpenses,
    loadingMoreExpenses,
    loadMoreExpenses,
    settlements,
    setSettlements,
    totalSettlementCount,
    setTotalSettlementCount,
    hasMoreSettlements,
    loadingMoreSettlements,
    loadMoreSettlements,
    notifications,
    setNotifications,
    unreadCount,
    markNotificationsAsRead,
    balanceData,
    reload: loadData,
  };
};
