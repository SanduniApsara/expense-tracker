// =============================================
// UI.JS — DOM rendering helpers
// =============================================

const UI = (() => {

  // ── Toast ────────────────────────────────
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ── Format helpers ────────────────────────
  function formatLKR(n) {
    return 'LKR ' + n.toLocaleString('en-LK');
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getCat(id) {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  }

  // ── KPI Row ───────────────────────────────
  function renderKPIs() {
    const thisMonth = Store.getTotalThisMonth();
    const lastMonth = Store.getTotalLastMonth();
    const diff = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;
    const budgets  = Store.getBudgets();
    const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0);
    const expenses = Store.getExpenses();
    const avg = expenses.length ? Math.round(expenses.reduce((s,e)=>s+e.amount,0)/expenses.length) : 0;

    const top = Store.getTopCategory();
    const topCat = getCat(top.cat);

    const kpis = [
      {
        label: 'This Month',
        value: formatLKR(thisMonth),
        sub: diff >= 0 ? `▲ ${diff}% vs last month` : `▼ ${Math.abs(diff)}% vs last month`,
        badge: diff >= 0 ? { text: '▲ ' + diff + '%', type: 'down' } : { text: '▼ ' + Math.abs(diff) + '%', type: 'up' },
        color: 'green',
      },
      {
        label: 'Total Budget',
        value: formatLKR(budgetTotal),
        sub: `${budgets.length} active budgets`,
        badge: null,
        color: 'violet',
      },
      {
        label: 'Avg. Transaction',
        value: formatLKR(avg),
        sub: `${expenses.length} total transactions`,
        badge: null,
        color: 'blue',
      },
      {
        label: 'Top Category',
        value: topCat ? `${topCat.icon} ${topCat.label}` : '—',
        sub: top.amount ? formatLKR(top.amount) : '',
        badge: null,
        color: 'red',
      },
    ];

    const row = document.getElementById('kpiRow');
    row.innerHTML = kpis.map(k => `
      <div class="kpi-card ${k.color}">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">
          ${k.badge ? `<span class="kpi-badge ${k.badge.type}">${k.badge.text}</span>` : ''}
          ${k.sub}
        </div>
      </div>
    `).join('');
  }

  // ── Recent Activity ───────────────────────
  function renderRecentActivity() {
    const expenses = Store.getExpenses().slice(0, 6);
    const list = document.getElementById('recentList');
    if (!list) return;

    if (!expenses.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No expenses yet</p></div>`;
      return;
    }

    list.innerHTML = expenses.map(e => {
      const cat = getCat(e.cat);
      return `
        <li class="activity-item">
          <div class="activity-icon" style="background:${cat.color}22">${cat.icon}</div>
          <div class="activity-desc">
            <div class="activity-name">${e.desc}</div>
            <div class="activity-meta">${formatDate(e.date)} · ${e.payment}</div>
          </div>
          <div class="activity-amount amount-negative">${formatLKR(e.amount)}</div>
        </li>
      `;
    }).join('');
  }

  // ── Expense Table ──────────────────────────
  function renderExpenseTable(filter = 'all', sort = 'date-desc', search = '') {
    let expenses = Store.getExpenses();

    if (filter !== 'all') expenses = expenses.filter(e => e.cat === filter);
    if (search)          expenses = expenses.filter(e =>
      e.desc.toLowerCase().includes(search.toLowerCase()) ||
      (e.tags && e.tags.join(' ').toLowerCase().includes(search.toLowerCase()))
    );

    expenses.sort((a, b) => {
      if (sort === 'date-desc')   return new Date(b.date) - new Date(a.date);
      if (sort === 'date-asc')    return new Date(a.date) - new Date(b.date);
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });

    const tbody = document.getElementById('expenseTableBody');
    if (!tbody) return;

    if (!expenses.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🔍</div><p>No expenses found</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = expenses.map(e => {
      const cat = getCat(e.cat);
      const tags = (e.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join(' ');
      return `
        <tr data-id="${e.id}">
          <td>
            <span style="font-weight:600">${e.desc}</span>
            ${e.note ? `<br><span style="font-size:0.72rem;color:var(--text-3)">${e.note}</span>` : ''}
          </td>
          <td>
            <span class="cat-badge" style="background:${cat.color}22;color:${cat.color}">
              ${cat.icon} ${cat.label}
            </span>
          </td>
          <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-2)">${formatDate(e.date)}</td>
          <td class="amount-negative">${formatLKR(e.amount)}</td>
          <td>${tags}</td>
          <td>
            <div class="row-actions">
              <button class="btn-icon" onclick="App.editExpense('${e.id}')" title="Edit">✎</button>
              <button class="btn-icon" style="color:var(--accent-3)" onclick="App.deleteExpense('${e.id}')" title="Delete">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ── Filter Chips ──────────────────────────
  function renderFilterChips(activeFilter, onSelect) {
    const wrap = document.getElementById('filterChips');
    if (!wrap) return;

    const all = [{ id: 'all', label: 'All', icon: '◈' }, ...CATEGORIES];
    wrap.innerHTML = all.map(c => `
      <button class="chip ${activeFilter === c.id ? 'active' : ''}" data-cat="${c.id}">
        ${c.icon || ''} ${c.label}
      </button>
    `).join('');

    wrap.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => onSelect(btn.dataset.cat));
    });
  }

  // ── Category Picker (modal) ───────────────
  function renderCategoryPicker(selected) {
    const wrap = document.getElementById('categoryPicker');
    if (!wrap) return;

    wrap.innerHTML = CATEGORIES.map(c => `
      <button class="cat-pick-btn ${selected === c.id ? 'selected' : ''}"
              data-cat="${c.id}"
              style="color:${c.color};border-color:${selected === c.id ? c.color : 'var(--border)'}">
        ${c.icon} ${c.label}
      </button>
    `).join('');

    wrap.querySelectorAll('.cat-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.cat-pick-btn').forEach(b => {
          const cat = getCat(b.dataset.cat);
          b.classList.remove('selected');
          b.style.borderColor = 'var(--border)';
        });
        btn.classList.add('selected');
        const cat = getCat(btn.dataset.cat);
        btn.style.borderColor = cat.color;
      });
    });
  }

  // ── Budgets ───────────────────────────────
  function renderBudgets() {
    const budgets = Store.getBudgets();
    const grid = document.getElementById('budgetGrid');
    if (!grid) return;

    if (!budgets.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">💰</div><p>No budgets set yet</p></div>`;
      return;
    }

    grid.innerHTML = budgets.map(b => {
      const cat  = getCat(b.cat);
      const pct  = Math.min(100, Math.round((b.spent / b.limit) * 100));
      const over = pct >= 100;
      const warn = pct >= 80;
      const barColor = over ? 'var(--accent-3)' : warn ? '#f0a050' : 'var(--accent)';

      return `
        <div class="budget-card">
          <div class="budget-top">
            <div>
              <div class="budget-name">${cat.icon} ${b.name}</div>
              <div class="budget-limit">Limit: ${formatLKR(b.limit)}</div>
            </div>
            <button class="btn-icon" style="color:var(--accent-3)" onclick="App.deleteBudget('${b.id}')">✕</button>
          </div>
          <div class="budget-progress-wrap">
            <div class="budget-progress-bar" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <div class="budget-stats">
            <span>Spent: ${formatLKR(b.spent)}</span>
            <span style="color:${over?'var(--accent-3)':'var(--text-3)'}">${pct}%${over?' ⚠ OVER':''}</span>
            <span>Left: ${formatLKR(Math.max(0, b.limit - b.spent))}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Recurring ─────────────────────────────
  function renderRecurring() {
    const items = Store.getRecurring();
    const grid = document.getElementById('recurringGrid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">↻</div><p>No recurring expenses</p></div>`;
      return;
    }

    grid.innerHTML = items.map(r => {
      const cat = getCat(r.cat);
      return `
        <div class="recurring-card">
          <div class="recurring-icon" style="background:${cat.color}22">${r.icon}</div>
          <div class="recurring-info">
            <div class="recurring-name">${r.name}</div>
            <div class="recurring-cycle">${r.cycle} · Next: ${formatDate(r.nextDate)}</div>
          </div>
          <div class="recurring-amount">${formatLKR(r.amount)}</div>
          <button class="btn-icon" style="color:var(--accent-3)" onclick="App.deleteRecurring('${r.id}')">✕</button>
        </div>
      `;
    }).join('');
  }

  // ── Mood meter ────────────────────────────
  function updateMoodMeter() {
    const thisMonth = Store.getTotalThisMonth();
    const budgetTotal = Store.getBudgets().reduce((s, b) => s + b.limit, 0);
    const pct = budgetTotal > 0 ? Math.min(100, (thisMonth / budgetTotal) * 100) : 50;
    const invPct = 100 - pct;

    const bar = document.getElementById('moodBar');
    const emoji = document.getElementById('moodEmoji');
    if (!bar || !emoji) return;

    bar.style.width = invPct + '%';
    bar.style.background = invPct > 60 ? 'var(--accent)' : invPct > 30 ? '#f0a050' : 'var(--accent-3)';
    emoji.textContent = invPct > 70 ? '😄' : invPct > 40 ? '😐' : '😰';
  }

  // ── Insight ───────────────────────────────
  function renderInsight() {
    const el = document.getElementById('insightBody');
    if (!el) return;
    setTimeout(() => {
      el.innerHTML = `<p>${Store.generateInsight()}</p>`;
    }, 1200);
  }

  return {
    toast, formatLKR, formatDate, getCat,
    renderKPIs, renderRecentActivity, renderExpenseTable,
    renderFilterChips, renderCategoryPicker,
    renderBudgets, renderRecurring, updateMoodMeter, renderInsight,
  };
})();
