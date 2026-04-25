// =============================================
// STORE.JS — State management via localStorage
// =============================================

const Store = (() => {

  const KEYS = {
    expenses:  'nx_expenses',
    budgets:   'nx_budgets',
    recurring: 'nx_recurring',
  };

  // ── Bootstrap ────────────────────────────
  function init() {
    if (!localStorage.getItem(KEYS.expenses)) {
      localStorage.setItem(KEYS.expenses,  JSON.stringify(SEED_EXPENSES));
    }
    if (!localStorage.getItem(KEYS.budgets)) {
      localStorage.setItem(KEYS.budgets,   JSON.stringify(SEED_BUDGETS));
    }
    if (!localStorage.getItem(KEYS.recurring)) {
      localStorage.setItem(KEYS.recurring, JSON.stringify(SEED_RECURRING));
    }
  }

  // ── Generic getters / setters ─────────────
  function get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }

  function set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── Expenses ─────────────────────────────
  function getExpenses() { return get(KEYS.expenses); }

  function addExpense(expense) {
    const list = getExpenses();
    const entry = { ...expense, id: 'e' + Date.now() };
    list.unshift(entry);
    set(KEYS.expenses, list);
    // Update matching budget
    updateBudgetSpent(entry.cat, entry.amount);
    return entry;
  }

  function deleteExpense(id) {
    const list = getExpenses().filter(e => e.id !== id);
    set(KEYS.expenses, list);
  }

  function updateExpense(id, patch) {
    const list = getExpenses().map(e => e.id === id ? { ...e, ...patch } : e);
    set(KEYS.expenses, list);
  }

  // ── Budgets ───────────────────────────────
  function getBudgets() { return get(KEYS.budgets); }

  function addBudget(budget) {
    const list = getBudgets();
    list.push({ ...budget, id: 'b' + Date.now(), spent: 0 });
    set(KEYS.budgets, list);
  }

  function updateBudgetSpent(cat, amount) {
    const list = getBudgets().map(b =>
      b.cat === cat ? { ...b, spent: b.spent + amount } : b
    );
    set(KEYS.budgets, list);
  }

  function deleteBudget(id) {
    const list = getBudgets().filter(b => b.id !== id);
    set(KEYS.budgets, list);
  }

  // ── Recurring ─────────────────────────────
  function getRecurring() { return get(KEYS.recurring); }

  function addRecurring(item) {
    const list = getRecurring();
    list.push({ ...item, id: 'r' + Date.now() });
    set(KEYS.recurring, list);
  }

  function deleteRecurring(id) {
    const list = getRecurring().filter(r => r.id !== id);
    set(KEYS.recurring, list);
  }

  // ── Analytics helpers ─────────────────────
  function getTotalThisMonth() {
    const now = new Date();
    return getExpenses()
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }

  function getTotalLastMonth() {
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return getExpenses()
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }

  function getCategoryTotals() {
    const map = {};
    getExpenses().forEach(e => {
      map[e.cat] = (map[e.cat] || 0) + e.amount;
    });
    return map;
  }

  function getTopCategory() {
    const totals = getCategoryTotals();
    let top = null, max = 0;
    for (const [cat, val] of Object.entries(totals)) {
      if (val > max) { max = val; top = cat; }
    }
    return { cat: top, amount: max };
  }

  function generateInsight() {
    const expenses = getExpenses();
    const totals   = getCategoryTotals();
    const thisMonth = getTotalThisMonth();
    const lastMonth = getTotalLastMonth();
    const diff = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0) : 0;

    const top = getTopCategory();
    const topCat = CATEGORIES.find(c => c.id === top.cat);

    const insights = [
      `Your spending is ${diff > 0 ? diff + '% higher' : Math.abs(diff) + '% lower'} than last month. ${diff > 5 ? 'Consider reviewing discretionary expenses.' : 'Great discipline!'}`,
      topCat ? `${topCat.icon} ${topCat.label} is your biggest expense category this period at LKR ${top.amount.toLocaleString()}.` : '',
      expenses.length > 0 ? `You've made ${expenses.length} transactions so far. Average spend per transaction: LKR ${Math.round(expenses.reduce((s,e)=>s+e.amount,0)/expenses.length).toLocaleString()}.` : '',
      `Monthly total stands at LKR ${thisMonth.toLocaleString()}. Keep tracking to stay on budget.`,
    ].filter(Boolean);

    return insights[Math.floor(Math.random() * insights.length)];
  }

  return {
    init,
    getExpenses, addExpense, deleteExpense, updateExpense,
    getBudgets,  addBudget,  deleteBudget,
    getRecurring, addRecurring, deleteRecurring,
    getTotalThisMonth, getTotalLastMonth,
    getCategoryTotals, getTopCategory,
    generateInsight,
  };
})();
