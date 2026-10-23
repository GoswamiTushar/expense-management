import { useState, useEffect } from 'react';
import { calculateSplitShare } from '../services/engine/splitEngine';

export const useExpenseForm = (property, currentUser, onSubmit, onClose, visible) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(''); // No default — mandatory selection
  const [date, setDate] = useState(''); // No default — mandatory selection
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [receiptUrls, setReceiptUrls] = useState([]); // array of image URIs
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [paidBy, setPaidByState] = useState(currentUser?._id || currentUser?.id || '');
  const [payerName, setPayerNameState] = useState(currentUser?.name || 'You');

  const setPayer = (id, name) => {
    setPaidByState(id);
    setPayerNameState(name || 'Member');
  };

  // Reset whenever the modal opens (visible flips to true) or the property changes
  useEffect(() => {
    if (visible === false) return; // Don't reset on close, only on open or property change
    setTitle('');
    setAmount('');
    setCategory('');
    setDate('');
    setPaidByState(currentUser?._id || currentUser?.id || '');
    setPayerNameState(currentUser?.name || 'You');
    setSelectedMembers(property?.managers || []);
    setReceiptUrls([]);
    setNotes('');
    setSubmitting(false);
  }, [property, visible, currentUser]);

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      if (selectedMembers.length > 1) setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
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

  const executeSubmit = async () => {
    if (!title.trim() || parsedAmount <= 0) return alert('Enter a title and valid amount.');
    if (!category || !category.trim()) return alert('Please select an expense category.');
    if (!date || !date.trim()) return alert('Please select the expense date.');
    setSubmitting(true);
    try {
      const effectivePaidBy = paidBy || currentUser?._id || currentUser?.id;
      const effectivePayerName = payerName || currentUser?.name || 'Member';
      const actorId = currentUser?._id || currentUser?.id;
      const actorName = currentUser?.name || 'Member';

      await onSubmit({
        propertyId: property._id,
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim(),
        paidBy: effectivePaidBy,
        payerName: effectivePayerName,
        loggedBy: actorId,
        loggedByName: actorName,
        splitAmong: selectedMembers,
        sharePerPerson,
        receiptUrl: receiptUrls[0] || '', // backward-compat: first image as primary
        receiptUrls, // full array for new consumers
        notes: notes.trim(),
        date: date.trim(),
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to create expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    amount,
    setAmount,
    category,
    setCategory,
    date,
    setDate,
    selectedMembers,
    toggleMember,
    receiptUrls,
    addReceiptUrls,
    removeReceiptUrl,
    notes,
    setNotes,
    parsedAmount,
    sharePerPerson,
    submitting,
    paidBy,
    payerName,
    setPayer,
    handleSubmit: executeSubmit,
    executeSubmit,
  };
};
