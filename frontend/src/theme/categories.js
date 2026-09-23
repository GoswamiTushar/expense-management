export const categories = [
  { id: 'Rent', label: 'Rent', icon: 'home', color: '#FF385C' },
  { id: 'Electricity', label: 'Electricity & Bills', icon: 'flash', color: '#F59E0B' },
  { id: 'Cleaning', label: 'Cleaning & Maid', icon: 'sparkles', color: '#10B981' },
  { id: 'Maintenance', label: 'Maintenance & Repairs', icon: 'construct', color: '#3B82F6' },
  { id: 'Amenities', label: 'Amenities & Linens', icon: 'bed', color: '#8B5CF6' },
  { id: 'Supplies', label: 'Supplies & Groceries', icon: 'basket', color: '#EC4899' },
  { id: 'Shopping', label: 'Shopping & New Purchases', icon: 'cart', color: '#06B6D4' },
  { id: 'Other', label: 'Other Expenses', icon: 'ellipsis-horizontal-circle', color: '#6B7280' },
];

export const getCategoryById = (id) => {
  if (!id) return categories[categories.length - 1];
  const normalized = String(id).trim().toLowerCase();
  if (normalized === 'newly shopped' || normalized === 'newly_shopped' || normalized === 'shopping' || normalized === 'purchases') {
    return categories.find((c) => c.id === 'Shopping');
  }
  return (
    categories.find((c) => c.id === id || c.id.toLowerCase() === normalized) ||
    categories[categories.length - 1]
  );
};
