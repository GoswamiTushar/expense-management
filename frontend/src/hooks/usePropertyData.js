import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../services/api/propertyApi';
import { getExpensesByProperty } from '../services/api/expenseApi';
import { getSettlementsByProperty } from '../services/api/settlementApi';
import { getDeviceUserProfile } from '../services/storage/sessionStore';
import { computeBalances } from '../services/engine/balanceEngine';

export const usePropertyData = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchDetails = async (propId) => {
    if (!propId) { setExpenses([]); setSettlements([]); return; }
    const [e, s] = await Promise.all([getExpensesByProperty(propId), getSettlementsByProperty(propId)]);
    setExpenses(e); setSettlements(s);
  };

  const loadData = async () => {
    const user = await getDeviceUserProfile();
    setCurrentUser(user);
    const props = await getProperties();
    setProperties(props);
    const initial = props[0] || null;
    setActiveProperty(initial);
    if (initial?._id) await fetchDetails(initial._id);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeProperty?._id) fetchDetails(activeProperty._id); }, [activeProperty?._id]);

  const refresh = useCallback(async () => {
    if (!activeProperty?._id) return;
    setRefreshing(true);
    await fetchDetails(activeProperty._id);
    setRefreshing(false);
  }, [activeProperty]);

  const balanceData = activeProperty && currentUser ? computeBalances(expenses, settlements, activeProperty.managers || [], currentUser._id) : null;

  return {
    refreshing, refresh, properties, setProperties, activeProperty, setActiveProperty,
    expenses, setExpenses, settlements, setSettlements, currentUser, setCurrentUser,
    balanceData, reload: loadData,
  };
};
