// =============================================
// APP.JS — Main controller & event binding
// =============================================

const App = (() => {

  let currentView    = 'dashboard';
  let activeFilter   = 'all';
  let activeSort     = 'date-desc';
  let editingId      = null;

  // ── Init ─────────────────────────────────
  function init() {
    Store.init();
    bindNav();
    bindModal();
    bindSearch();
    bindChartToggle();
    bindSortSelect();
    navigateTo('dashboard');
  }

  // ── Navigation ────────────────────────────
  function navigateTo(view) {
    currentView = view;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const viewEl = document.getElementById('view-' + view);
    if (viewEl) viewEl.classList.add('active');

    const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navEl) navEl.classList.add('active');

    document.getElementById('pageTitle').textContent =
      view.charAt(0).toUpperCase() + view.slice(1);

    renderView(view);

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  }

  function renderView(view) {
    switch (view) {
      case 'dashboard':
        UI.renderKPIs();
        UI.renderRecentActivity();
        UI.renderInsight();
        UI.updateMoodMeter();
        requestAnimationFrame(() => Charts.renderAll());
        break;

      case 'expenses':
        UI.renderFilterChips(activeFilter, (cat) => {
          activeFilter = cat;
          UI.renderFilterChips(activeFilter, arguments.callee);
          UI.renderExpenseTable(activeFilter, activeSort, document.getElementById('searchInput').value);
        });
        UI.renderExpenseTable(activeFilter, activeSort, document.getElementById('searchInput').value);
        break;

      case 'budgets':
        UI.renderBudgets();
        break;

      case 'analytics':
        requestAnimationFrame(() => Charts.renderAnalytics());
        break;

      case 'recurring':
        UI.renderRecurring();
        break;
    }
  }

  // ── Nav binding ───────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(item.dataset.view);
      });
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // ── Modal ─────────────────────────────────
  function openModal(id = null) {
    editingId = id;
    const modal  = document.getElementById('expenseModal');
    const title  = document.getElementById('modalTitle');

    // Reset form
    document.getElementById('expDesc').value    = '';
    document.getElementById('expAmount').value  = '';
    document.getElementById('expDate').value    = new Date().toISOString().split('T')[0];
    document.getElementById('expPayment').value = 'Cash';
    document.getElementById('expTags').value    = '';
    document.getElementById('expNote').value    = '';

    let selectedCat = 'food';

    if (id) {
      const exp = Store.getExpenses().find(e => e.id === id);
      if (exp) {
        title.textContent = 'Edit Expense';
        document.getElementById('expDesc').value    = exp.desc;
        document.getElementById('expAmount').value  = exp.amount;
        document.getElementById('expDate').value    = exp.date;
        document.getElementById('expPayment').value = exp.payment;
        document.getElementById('expTags').value    = (exp.tags || []).join(', ');
        document.getElementById('expNote').value    = exp.note || '';
        selectedCat = exp.cat;
      }
    } else {
      title.textContent = 'New Expense';
    }

    UI.renderCategoryPicker(selectedCat);
    modal.classList.add('open');
  }

  function closeModal() {
    document.getElementById('expenseModal').classList.remove('open');
    editingId = null;
  }

  function saveExpense() {
    const desc    = document.getElementById('expDesc').value.trim();
    const amount  = parseFloat(document.getElementById('expAmount').value);
    const date    = document.getElementById('expDate').value;
    const payment = document.getElementById('expPayment').value;
    const tagsRaw = document.getElementById('expTags').value;
    const note    = document.getElementById('expNote').value.trim();
    const catBtn  = document.querySelector('.cat-pick-btn.selected');
    const cat     = catBtn ? catBtn.dataset.cat : 'other';

    if (!desc)           { UI.toast('Please enter a description', 'error'); return; }
    if (!amount || amount <= 0) { UI.toast('Please enter a valid amount', 'error'); return; }
    if (!date)           { UI.toast('Please select a date', 'error'); return; }

    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { desc, amount, date, payment, tags, note, cat };

    if (editingId) {
      Store.updateExpense(editingId, payload);
      UI.toast('Expense updated ✓');
    } else {
      Store.addExpense(payload);
      UI.toast('Expense added ✓');
    }

    closeModal();
    renderView(currentView);
  }

  function bindModal() {
    document.getElementById('addExpenseBtn').addEventListener('click', () => openModal());
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);

    // Click outside to close
    document.getElementById('expenseModal').addEventListener('click', e => {
      if (e.target === document.getElementById('expenseModal')) closeModal();
    });

    // Budget modal (simple prompt)
    document.getElementById('addBudgetBtn')?.addEventListener('click', () => {
      const name  = prompt('Budget name:');
      if (!name) return;
      const limit = parseFloat(prompt('Monthly limit (LKR):'));
      if (!limit || limit <= 0) { UI.toast('Invalid limit', 'error'); return; }
      const catId = prompt('Category ID (food, transport, shopping, health, utilities, entertain, education, other):');
      Store.addBudget({ name, limit, cat: catId || 'other' });
      UI.renderBudgets();
      UI.toast('Budget created ✓');
    });

    // Recurring modal (simple prompt)
    document.getElementById('addRecurringBtn')?.addEventListener('click', () => {
      const name   = prompt('Name (e.g. Netflix):');
      if (!name) return;
      const amount = parseFloat(prompt('Amount (LKR):'));
      if (!amount) return;
      const cycle  = prompt('Cycle (Monthly / Weekly / Yearly):') || 'Monthly';
      const icon   = prompt('Icon emoji (e.g. 🎬):') || '📦';
      const cat    = prompt('Category (food, transport, entertain, health, utilities, education, other):') || 'other';
      const next   = prompt('Next date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];
      Store.addRecurring({ name, amount, cycle, icon, cat, nextDate: next });
      UI.renderRecurring();
      UI.toast('Recurring added ✓');
    });
  }

  // ── Search ────────────────────────────────
  function bindSearch() {
    const input = document.getElementById('searchInput');
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (currentView !== 'expenses') navigateTo('expenses');
        UI.renderExpenseTable(activeFilter, activeSort, input.value);
      }, 280);
    });
  }

  // ── Sort ──────────────────────────────────
  function bindSortSelect() {
    document.getElementById('sortSelect')?.addEventListener('change', e => {
      activeSort = e.target.value;
      UI.renderExpenseTable(activeFilter, activeSort, document.getElementById('searchInput').value);
    });
  }

  // ── Chart toggle ─────────────────────────
  function bindChartToggle() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.chart-btn');
      if (!btn) return;
      document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Charts.renderSpendingChart(btn.dataset.chart);
    });
  }

  // ── Public actions (called from inline HTML) ──
  function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    Store.deleteExpense(id);
    UI.toast('Expense deleted', 'error');
    renderView(currentView);
  }

  function editExpense(id) {
    openModal(id);
  }

  function deleteBudget(id) {
    if (!confirm('Delete this budget?')) return;
    Store.deleteBudget(id);
    UI.renderBudgets();
    UI.toast('Budget deleted', 'error');
  }

  function deleteRecurring(id) {
    if (!confirm('Delete this recurring item?')) return;
    Store.deleteRecurring(id);
    UI.renderRecurring();
    UI.toast('Removed', 'error');
  }

  // ── Start ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return { deleteExpense, editExpense, deleteBudget, deleteRecurring };
})();
