import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../services/api/propertyApi';
import { getExpensesByProperty } from '../services/api/expenseApi';
import { getSettlementsByProperty } from '../services/api/settlementApi';
import { computeBalances } from '../services/engine/balanceEngine';

/**
 * usePropertyData — all data fetching is gated behind `currentUser`.
 * Pass the authenticated user object; pass null when logged out.
 * No API calls fire until currentUser is set.
 */
export const usePropertyData = (currentUser) => {
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const fetchDetails = async (propId) => {
    if (!propId) { setExpenses([]); setSettlements([]); return; }
    const [e, s] = await Promise.all([getExpensesByProperty(propId), getSettlementsByProperty(propId)]);
    setExpenses(e); setSettlements(s);
  };

  const loadData = useCallback(async () => {
    if (!currentUser?._id) return;  // ← guard: never fetch when unauthenticated
    const props = await getProperties();
    setProperties(props);
    const initial = props[0] || null;
    setActiveProperty(initial);
    if (initial?._id) await fetchDetails(initial._id);
  }, [currentUser?._id]);

  // Reset all data immediately when user logs out
  useEffect(() => {
    if (!currentUser) {
      setProperties([]);
      setActiveProperty(null);
      setExpenses([]);
      setSettlements([]);
      return;
    }
    loadData();
  }, [currentUser?._id]);

  useEffect(() => {
    if (activeProperty?._id && currentUser?._id) fetchDetails(activeProperty._id);
  }, [activeProperty?._id]);

  const refresh = useCallback(async () => {
    if (!activeProperty?._id || !currentUser?._id) return;
    setRefreshing(true);
    await fetchDetails(activeProperty._id);
    setRefreshing(false);
  }, [activeProperty, currentUser]);

  const balanceData = activeProperty && currentUser
    ? computeBalances(expenses, settlements, activeProperty.managers || [], currentUser._id)
    : null;

  return {
    refreshing, refresh, properties, setProperties, activeProperty, setActiveProperty,
    expenses, setExpenses, settlements, setSettlements,
    balanceData, reload: loadData,
  };
};
