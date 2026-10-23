export const categories = [
  { id: 'Food', label: 'Food & Dining', icon: 'restaurant', color: '#F97316' },
  { id: 'Fuel', label: 'Fuel & Gas', icon: 'speedometer', color: '#EA580C' },
  { id: 'Travel', label: 'Travel & Transport', icon: 'airplane', color: '#0EA5E9' },
  { id: 'Groceries', label: 'Groceries & Mart', icon: 'cart', color: '#059669' },
  { id: 'Rent', label: 'Stay & Rent', icon: 'bed', color: '#E06D53' },
  { id: 'Electricity', label: 'Bills & Utilities', icon: 'flash', color: '#F59E0B' },
  { id: 'Entertainment', label: 'Activities & Outings', icon: 'film', color: '#8B5CF6' },
  { id: 'Shopping', label: 'Shopping & Gear', icon: 'bag-handle', color: '#EC4899' },
  { id: 'Medical', label: 'Medical & Care', icon: 'medkit', color: '#EF4444' },
  { id: 'Cleaning', label: 'Cleaning & Household', icon: 'sparkles', color: '#10B981' },
  { id: 'Maintenance', label: 'Maintenance & Repairs', icon: 'construct', color: '#3B82F6' },
  { id: 'Amenities', label: 'Amenities & Linens', icon: 'layers', color: '#A855F7' },
  { id: 'Supplies', label: 'General Supplies', icon: 'basket', color: '#6366F1' },
  { id: 'Other', label: 'General / Other', icon: 'ellipsis-horizontal-circle', color: '#6B7280' },
];

export const getCategoryById = (id) => {
  if (!id) return categories[categories.length - 1];
  const normalized = String(id).trim().toLowerCase();

  // Alias mappings for backward compatibility
  const aliasMap = {
    'food': 'Food',
    'dining': 'Food',
    'meals': 'Food',
    'fuel': 'Fuel',
    'petrol': 'Fuel',
    'diesel': 'Fuel',
    'gas': 'Fuel',
    'groceries': 'Groceries',
    'grocery': 'Groceries',
    'mart': 'Groceries',
    'travel': 'Travel',
    'transport': 'Travel',
    'transit': 'Travel',
    'flight': 'Travel',
    'cab': 'Travel',
    'stay': 'Rent',
    'rent': 'Rent',
    'hotel': 'Rent',
    'electricity': 'Electricity',
    'bills': 'Electricity',
    'utilities': 'Electricity',
    'cleaning': 'Cleaning',
    'maid': 'Cleaning',
    'maintenance': 'Maintenance',
    'repairs': 'Maintenance',
    'amenities': 'Amenities',
    'linens': 'Amenities',
    'supplies': 'Supplies',
    'shopping': 'Shopping',
    'newly shopped': 'Shopping',
    'newly_shopped': 'Shopping',
    'purchases': 'Shopping',
    'entertainment': 'Entertainment',
    'activities': 'Entertainment',
    'medical': 'Medical',
    'health': 'Medical',
    'other': 'Other',
  };

  const targetId = aliasMap[normalized] || id;
  return (
    categories.find((c) => c.id === targetId || c.id.toLowerCase() === normalized) ||
    categories[categories.length - 1]
  );
};

// Smart Category Suggestion Engine based on title/topic keywords
const KEYWORD_RULES = [
  {
    categoryId: 'Fuel',
    keywords: [
      'fuel', 'petrol', 'diesel', 'cng', 'gas station', 'shell', 'hpcl', 'ioc',
      'bpcl', 'gasoline', 'mileage', 'pump', 'tank full', 'oil change', 'speed petrol',
      'power petrol', 'autogas', 'ev charging', 'charging',
    ],
  },
  {
    categoryId: 'Food',
    keywords: [
      'food', 'dinner', 'lunch', 'breakfast', 'meal', 'meals', 'cafe', 'restaurant',
      'pizza', 'burger', 'biryani', 'zomato', 'swiggy', 'snack', 'snacks', 'coffee',
      'chai', 'tea', 'drinks', 'beer', 'wine', 'bar', 'pub', 'dessert', 'icecream',
      'bakery', 'subway', 'mcdonalds', 'kfc', 'starbucks', 'dhaba', 'eating', 'cocktail',
      'juice', 'pastry', 'shawarma', 'roti', 'paratha', 'dosa', 'samosa',
    ],
  },
  {
    categoryId: 'Groceries',
    keywords: [
      'grocery', 'groceries', 'supermarket', 'blinkit', 'zepto', 'instamart', 'bigbasket',
      'dmart', 'milk', 'bread', 'veggies', 'vegetables', 'fruits', 'ration', 'eggs',
      'egg', 'curd', 'butter', 'cheese', 'atta', 'rice', 'dal', 'paneer', 'kirana',
      'reliance fresh', 'nature basket',
    ],
  },
  {
    categoryId: 'Travel',
    keywords: [
      'flight ticket', 'train ticket', 'bus ticket', 'flight', 'flights', 'train',
      'cab', 'taxi', 'uber', 'ola', 'auto', 'bus', 'metro', 'toll', 'parking',
      'ride', 'scooty', 'rental car', 'fastag', 'irctc', 'indigo', 'air india',
      'airasia', 'spicejet', 'commute', 'driver', 'fare', 'yulu', 'rapido', 'ferry', 'boat',
    ],
  },
  {
    categoryId: 'Supplies',
    keywords: [
      'tissue', 'soap', 'shampoo', 'detergent', 'biscuits', 'provisions', 'kitchen',
      'water bottle', 'dustbin', 'foil', 'garbage bag', 'cleaning liquid', 'harpic',
      'scrub', 'sponge', 'household', 'supplies',
    ],
  },
  {
    categoryId: 'Rent',
    keywords: [
      'rent', 'hotel', 'stay', 'resort', 'hostel', 'pg', 'room', 'villa', 'airbnb',
      'deposit', 'advance', 'lease', 'accommodation', 'cabin', 'homestay', 'flat rent',
      'oyo', 'booking', 'campsite', 'tent',
    ],
  },
  {
    categoryId: 'Electricity',
    keywords: [
      'electricity', 'bill', 'wifi', 'internet', 'broadband', 'power', 'recharge',
      'water bill', 'gas cylinder', 'lpg', 'subscription', 'ott', 'netflix', 'spotify',
      'airtel', 'jio', 'bescom', 'tneb', 'mseb', 'piped gas', 'dth',
    ],
  },
  {
    categoryId: 'Entertainment',
    keywords: [
      'movie tickets', 'entry ticket', 'event ticket', 'show tickets', 'movie',
      'cinema', 'theatre', 'museum', 'trek', 'rafting', 'amusement', 'concert',
      'show', 'club', 'party', 'entry fee', 'sightseeing', 'game', 'bowling',
      'monument', 'scuba', 'safari', 'waterpark', 'arcade', 'tickets',
    ],
  },
  {
    categoryId: 'Cleaning',
    keywords: [
      'cleaning', 'maid', 'sweeper', 'laundry', 'wash', 'dry clean', 'housekeeping',
      'garbage', 'vacuum', 'dusting', 'mop', 'cook', 'deep clean',
    ],
  },
  {
    categoryId: 'Maintenance',
    keywords: [
      'repair', 'repairs', 'maintenance', 'plumber', 'electrician', 'paint', 'ac service',
      'tap', 'fix', 'hardware', 'carpenter', 'pest control', 'bulb', 'wire', 'fitting',
      'servicing', 'ro service',
    ],
  },
  {
    categoryId: 'Amenities',
    keywords: [
      'linen', 'linens', 'towel', 'towels', 'bedsheet', 'blanket', 'pillow', 'amenity',
      'amenities', 'curtains', 'duvet', 'mattress',
    ],
  },
  {
    categoryId: 'Shopping',
    keywords: [
      'shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'mall', 'gift',
      'gifts', 'gear', 'electronics', 'apparel', 'souvenir', 'tshirt',
    ],
  },
  {
    categoryId: 'Medical',
    keywords: [
      'doctor', 'medicine', 'medicines', 'pharmacy', 'hospital', 'clinic', 'tablet',
      'bandage', 'first aid', 'pills', 'apollo', 'medplus', 'health', 'consultation',
    ],
  },
];

/**
 * Smart suggestion: inspects topic/title text and returns the matching category
 * or null if no strong match.
 */
export const suggestCategoryFromTitle = (title) => {
  if (!title || typeof title !== 'string') return null;
  const clean = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (kw.includes(' ')) {
        // Multi-word phrase check (e.g. 'entry fee', 'ac service', 'flat rent')
        if (clean.includes(kw)) {
          return categories.find((c) => c.id === rule.categoryId) || null;
        }
      } else {
        // Single word exact or prefix match
        if (words.some((w) => w === kw || (kw.length > 3 && w.startsWith(kw)))) {
          return categories.find((c) => c.id === rule.categoryId) || null;
        }
      }
    }
  }

  return null;
};
