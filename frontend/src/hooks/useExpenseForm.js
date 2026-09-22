import { useState, useEffect } from 'react';
import { calculateSplitShare } from '../services/engine/splitEngine';

export const useExpenseForm = (property, currentUser, onSubmit, onClose) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [receiptUrls, setReceiptUrls] = useState([]);  // ← now an array
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setTitle(''); setAmount(''); setCategory('Rent');
    setSelectedMembers(property?.managers || []); setReceiptUrls([]); setNotes('');
  }, [property]);

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      if (selectedMembers.length > 1) setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else { setSelectedMembers([...selectedMembers, id]); }
  };

  /** Append new URIs (from camera or gallery), avoiding duplicates */
  const addReceiptUrls = (newUris) => {
    const toAdd = Array.isArray(newUris) ? newUris : [newUris];
    setReceiptUrls((prev) => {
      const merged = [...prev, ...toAdd.filter((u) => u && !prev.includes(u))];
      return merged;
    });
  };

  /** Remove a single image by its URI */
  const removeReceiptUrl = (uri) => {
    setReceiptUrls((prev) => prev.filter((u) => u !== uri));
  };

  const parsedAmount = parseFloat(amount) || 0;
  const sharePerPerson = calculateSplitShare(parsedAmount, selectedMembers);

  const handleSubmit = () => {
    if (!title.trim() || parsedAmount <= 0) return alert('Enter a title and valid amount.');
    onSubmit({
      propertyId: property._id, title: title.trim(), amount: parsedAmount, category,
      paidBy: currentUser?._id, payerName: currentUser?.name || 'Manager',
      splitAmong: selectedMembers, sharePerPerson,
      receiptUrl: receiptUrls[0] || '',   // backward-compat: first image as primary
      receiptUrls,                         // full array for new consumers
      notes: notes.trim(), date: new Date().toISOString(),
    });
    onClose();
  };

  return {
    title, setTitle, amount, setAmount, category, setCategory,
    selectedMembers, toggleMember,
    receiptUrls, addReceiptUrls, removeReceiptUrl,
    notes, setNotes, parsedAmount, sharePerPerson, handleSubmit,
  };
};
