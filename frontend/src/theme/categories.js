export const categories = [
  { id: 'Rent', label: 'Rent', icon: 'home', color: '#FF385C' },
  { id: 'Electricity', label: 'Electricity & Bills', icon: 'flash', color: '#F59E0B' },
  { id: 'Cleaning', label: 'Cleaning & Maid', icon: 'sparkles', color: '#10B981' },
  { id: 'Maintenance', label: 'Maintenance & Repairs', icon: 'construct', color: '#3B82F6' },
  { id: 'Amenities', label: 'Amenities & Linens', icon: 'bed', color: '#8B5CF6' },
  { id: 'Supplies', label: 'Supplies & Groceries', icon: 'basket', color: '#EC4899' },
  { id: 'Other', label: 'Other Expenses', icon: 'ellipsis-horizontal-circle', color: '#6B7280' },
];

export const getCategoryById = (id) =>
  categories.find((c) => c.id === id) || categories[categories.length - 1];
