// =============================================
// DATA.JS — Static config, categories, seed data
// =============================================

const CATEGORIES = [
  { id: 'food',       label: 'Food & Drink',   icon: '🍜', color: '#f0a050' },
  { id: 'transport',  label: 'Transport',       icon: '🚌', color: '#50b4f0' },
  { id: 'shopping',   label: 'Shopping',        icon: '🛍️', color: '#c850f0' },
  { id: 'health',     label: 'Health',          icon: '💊', color: '#f05090' },
  { id: 'utilities',  label: 'Utilities',       icon: '💡', color: '#f0d050' },
  { id: 'entertain',  label: 'Entertainment',   icon: '🎬', color: '#7b5ea7' },
  { id: 'education',  label: 'Education',       icon: '📚', color: '#50f0b0' },
  { id: 'other',      label: 'Other',           icon: '📦', color: '#9090a8' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PAYMENT_ICONS = {
  'Cash': '💵',
  'Card': '💳',
  'Mobile Pay': '📱',
  'Bank Transfer': '🏦',
};

// Seed expenses for demo (stored in localStorage on first load)
const SEED_EXPENSES = [
  { id: 'e1',  desc: 'Lunch at Cargills',        cat: 'food',      amount: 1850,  date: '2025-04-14', payment: 'Card',     tags: ['lunch','work'],      note: '' },
  { id: 'e2',  desc: 'Uber to Colombo Fort',      cat: 'transport', amount: 680,   date: '2025-04-13', payment: 'Mobile Pay', tags: ['commute'],          note: '' },
  { id: 'e3',  desc: 'Dialog Monthly Bill',        cat: 'utilities', amount: 2500,  date: '2025-04-12', payment: 'Bank Transfer', tags: ['recurring'],      note: 'Internet + mobile' },
  { id: 'e4',  desc: 'Netflix Subscription',       cat: 'entertain', amount: 1550,  date: '2025-04-11', payment: 'Card',     tags: ['streaming'],          note: '' },
  { id: 'e5',  desc: 'Pharmacy — vitamins',        cat: 'health',    amount: 3200,  date: '2025-04-10', payment: 'Cash',     tags: ['health','essential'], note: '' },
  { id: 'e6',  desc: 'Odel clothing',              cat: 'shopping',  amount: 7800,  date: '2025-04-09', payment: 'Card',     tags: ['clothes'],            note: 'Shirt + jeans' },
  { id: 'e7',  desc: 'Coursera subscription',      cat: 'education', amount: 4200,  date: '2025-04-08', payment: 'Card',     tags: ['learning'],           note: '' },
  { id: 'e8',  desc: 'Supermarket groceries',      cat: 'food',      amount: 5600,  date: '2025-04-07', payment: 'Cash',     tags: ['grocery','essential'],note: '' },
  { id: 'e9',  desc: 'Electricity bill',           cat: 'utilities', amount: 3800,  date: '2025-04-06', payment: 'Bank Transfer', tags: ['essential'],      note: '' },
  { id: 'e10', desc: 'Movie tickets',              cat: 'entertain', amount: 1200,  date: '2025-04-05', payment: 'Card',     tags: ['weekend'],            note: 'Avengers with friends' },
  { id: 'e11', desc: 'Breakfast bakery',           cat: 'food',      amount: 420,   date: '2025-04-04', payment: 'Cash',     tags: ['breakfast'],          note: '' },
  { id: 'e12', desc: 'Bus pass',                   cat: 'transport', amount: 900,   date: '2025-04-03', payment: 'Cash',     tags: ['monthly','commute'],  note: '' },
  { id: 'e13', desc: 'Doctor consultation',        cat: 'health',    amount: 2000,  date: '2025-04-02', payment: 'Cash',     tags: ['health'],             note: '' },
  { id: 'e14', desc: 'Amazon book order',          cat: 'education', amount: 3100,  date: '2025-04-01', payment: 'Card',     tags: ['books'],              note: '' },
  { id: 'e15', desc: 'Street food dinner',         cat: 'food',      amount: 650,   date: '2025-03-31', payment: 'Cash',     tags: ['dinner'],             note: '' },
];

const SEED_BUDGETS = [
  { id: 'b1', name: 'Food & Dining', cat: 'food',      limit: 20000, spent: 8520 },
  { id: 'b2', name: 'Transport',     cat: 'transport', limit: 5000,  spent: 1580 },
  { id: 'b3', name: 'Entertainment', cat: 'entertain', limit: 6000,  spent: 2750 },
  { id: 'b4', name: 'Shopping',      cat: 'shopping',  limit: 15000, spent: 7800 },
  { id: 'b5', name: 'Health',        cat: 'health',    limit: 8000,  spent: 5200 },
  { id: 'b6', name: 'Utilities',     cat: 'utilities', limit: 10000, spent: 6300 },
];

const SEED_RECURRING = [
  { id: 'r1', name: 'Netflix',      cat: 'entertain', amount: 1550,  cycle: 'Monthly',  icon: '🎬', nextDate: '2025-05-11' },
  { id: 'r2', name: 'Dialog Bill',  cat: 'utilities', amount: 2500,  cycle: 'Monthly',  icon: '📡', nextDate: '2025-05-12' },
  { id: 'r3', name: 'Coursera',     cat: 'education', amount: 4200,  cycle: 'Monthly',  icon: '📚', nextDate: '2025-05-08' },
  { id: 'r4', name: 'Gym',          cat: 'health',    amount: 3500,  cycle: 'Monthly',  icon: '💪', nextDate: '2025-05-01' },
];

// Monthly spending mock for charts (last 6 months)
const MONTHLY_SPEND = [
  { month: 'Nov', total: 42000 },
  { month: 'Dec', total: 67000 },
  { month: 'Jan', total: 38500 },
  { month: 'Feb', total: 51000 },
  { month: 'Mar', total: 44200 },
  { month: 'Apr', total: 29800 },
];

// Daily mock for this month
const DAILY_SPEND = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  amount: Math.floor(Math.random() * 8000 + 500),
}));
