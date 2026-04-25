// =============================================
// CHARTS.JS — Chart.js renderers
// =============================================

const Charts = (() => {

  // Chart defaults
  Chart.defaults.color = '#9090a8';
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size   = 11;

  const CHART_COLORS = CATEGORIES.map(c => c.color);
  let spendingChart, categoryChart, monthlyChart, heatmapChart, trendChart;

  // ── Spending Bar / Line ───────────────────
  function renderSpendingChart(type = 'bar') {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;
    if (spendingChart) spendingChart.destroy();

    const expenses = Store.getExpenses();
    // Group by day for current month
    const dayMap = {};
    const now = new Date();
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === now.getMonth()) {
        const day = d.getDate();
        dayMap[day] = (dayMap[day] || 0) + e.amount;
      }
    });

    const labels = Object.keys(dayMap).sort((a,b)=>a-b).map(d => `Apr ${d}`);
    const values = Object.keys(dayMap).sort((a,b)=>a-b).map(d => dayMap[d]);

    spendingChart = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [{
          label: 'LKR Spent',
          data: values,
          backgroundColor: type === 'bar'
            ? 'rgba(200,240,80,0.25)'
            : 'rgba(200,240,80,0.1)',
          borderColor: '#c8f050',
          borderWidth: type === 'bar' ? 0 : 2,
          borderRadius: type === 'bar' ? 6 : 0,
          fill: type === 'line',
          tension: 0.45,
          pointBackgroundColor: '#c8f050',
          pointRadius: type === 'line' ? 4 : 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a24',
            borderColor: '#35354a',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` LKR ${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false },
            ticks: { callback: v => 'LKR ' + (v/1000).toFixed(0) + 'K' },
          },
        },
      },
    });
  }

  // ── Category Donut ────────────────────────
  function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    if (categoryChart) categoryChart.destroy();

    const totals = Store.getCategoryTotals();
    const cats   = CATEGORIES.filter(c => totals[c.id]);
    const labels = cats.map(c => c.label);
    const data   = cats.map(c => totals[c.id]);
    const colors = cats.map(c => c.color);

    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + '33'),
          borderColor:     colors,
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a24',
            borderColor: '#35354a',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` LKR ${ctx.parsed.toLocaleString()}`,
            },
          },
        },
      },
    });

    // Render legend
    const legend = document.getElementById('categoryLegend');
    if (legend) {
      legend.innerHTML = cats.map((c, i) => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${c.color}"></span>
          <span class="legend-label">${c.label}</span>
          <span class="legend-val">LKR ${data[i].toLocaleString()}</span>
        </div>
      `).join('');
    }
  }

  // ── Monthly Comparison ────────────────────
  function renderMonthlyChart() {
    const ctx = document.getElementById('monthlyCompareChart');
    if (!ctx) return;
    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTHLY_SPEND.map(m => m.month),
        datasets: [{
          label: 'Total Spent',
          data: MONTHLY_SPEND.map(m => m.total),
          backgroundColor: MONTHLY_SPEND.map((m, i) =>
            i === MONTHLY_SPEND.length - 1 ? 'rgba(200,240,80,0.5)' : 'rgba(123,94,167,0.4)'
          ),
          borderColor: MONTHLY_SPEND.map((m, i) =>
            i === MONTHLY_SPEND.length - 1 ? '#c8f050' : '#7b5ea7'
          ),
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a24', borderColor: '#35354a', borderWidth: 1 } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false }, ticks: { callback: v => 'LKR ' + (v/1000) + 'K' } },
        },
      },
    });
  }

  // ── Category Trend (line multi) ───────────
  function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    if (trendChart) trendChart.destroy();

    const months = ['Nov','Dec','Jan','Feb','Mar','Apr'];
    // Mock data per category
    const catData = {
      food:      [12000, 15000, 11000, 14000, 13000, 8520],
      transport: [3000,  4200,  2800,  3500,  3200,  1580],
      entertain: [5000,  8000,  4000,  6000,  5500,  2750],
      shopping:  [8000,  18000, 6000,  9000,  7000,  7800],
    };

    const datasets = Object.entries(catData).map(([catId, data]) => {
      const cat = CATEGORIES.find(c => c.id === catId);
      return {
        label: cat.label,
        data,
        borderColor: cat.color,
        backgroundColor: cat.color + '18',
        borderWidth: 2,
        tension: 0.45,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: cat.color,
      };
    });

    trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels: months, datasets },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { boxWidth: 12, padding: 16, color: '#9090a8' },
          },
          tooltip: { backgroundColor: '#1a1a24', borderColor: '#35354a', borderWidth: 1 },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false }, ticks: { callback: v => 'LKR ' + (v/1000) + 'K' } },
        },
      },
    });
  }

  // ── Heat map (bar of days) ─────────────────
  function renderHeatmapChart() {
    const ctx = document.getElementById('heatmapChart');
    if (!ctx) return;
    if (heatmapChart) heatmapChart.destroy();

    const labels = DAILY_SPEND.map(d => `Apr ${d.day}`);
    const values = DAILY_SPEND.map(d => d.amount);
    const maxVal = Math.max(...values);

    heatmapChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Daily Spend',
          data: values,
          backgroundColor: values.map(v => {
            const intensity = v / maxVal;
            if (intensity > 0.75) return 'rgba(240,80,80,0.7)';
            if (intensity > 0.5)  return 'rgba(240,160,80,0.6)';
            return 'rgba(80,180,240,0.5)';
          }),
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a1a24', borderColor: '#35354a', borderWidth: 1, callbacks: { label: c => ` LKR ${c.parsed.y.toLocaleString()}` } },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 45 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false }, ticks: { callback: v => 'LKR ' + (v/1000) + 'K' } },
        },
      },
    });
  }

  // ── Public: render all ────────────────────
  function renderAll() {
    renderSpendingChart('bar');
    renderCategoryChart();
  }

  function renderAnalytics() {
    renderMonthlyChart();
    renderHeatmapChart();
    renderTrendChart();
  }

  return { renderAll, renderAnalytics, renderSpendingChart, renderCategoryChart };
})();
