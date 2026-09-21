/**
 * Calculates equal share per person among selectively checked members.
 */
export const calculateSplitShare = (totalAmount, selectedMembers = []) => {
  const count = Math.max(1, selectedMembers.length);
  const amount = Number(totalAmount) || 0;
  return Math.round((amount / count) * 100) / 100;
};
