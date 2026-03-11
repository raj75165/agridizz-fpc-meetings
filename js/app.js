/**
 * app.js – FPO Accounting Software main application
 * Handles routing, rendering, and user interactions.
 */

/* ===== NAVIGATION ===== */
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
      // close sidebar on mobile
      document.querySelector('.sidebar').classList.remove('open');
    });
  });

  // Menu toggle for mobile
  const toggleBtn = document.getElementById('menuToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'dashboard':   renderDashboard(); break;
    case 'members':     renderMembers(); break;
    case 'procurement': renderProcurement(); break;
    case 'sales':       renderSales(); break;
    case 'expenses':    renderExpenses(); break;
    case 'income':      renderIncome(); break;
    case 'reports':     renderReports(); break;
    case 'settings':    renderSettings(); break;
  }
}

/* ===== TOAST ===== */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'alert alert-' + type;
  toast.style.display = 'flex';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

/* ===== MODAL ===== */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

/* ===== DASHBOARD ===== */
function renderDashboard() {
  const totalProcurementCost = Procurement.totalAmount();
  const totalSalesRevenue    = Sales.totalRevenue();
  const totalExpenses        = Expenses.total();
  const otherIncome          = Income.total();
  const grossProfit          = totalSalesRevenue - totalProcurementCost;
  const netProfit            = grossProfit + otherIncome - totalExpenses;
  const totalMembers         = Members.getAll().length;
  const pendingPayments      = Procurement.totalAmount() - Procurement.totalPaid();
  const pendingReceivables   = Sales.totalRevenue() - Sales.totalReceived();

  setHTML('dash-total-revenue',    formatCurrency(totalSalesRevenue));
  setHTML('dash-total-procurement',formatCurrency(totalProcurementCost));
  setHTML('dash-total-expenses',   formatCurrency(totalExpenses));
  setHTML('dash-net-profit',       formatCurrency(netProfit));
  setHTML('dash-members',          totalMembers);
  setHTML('dash-pending-payments', formatCurrency(pendingPayments));
  setHTML('dash-pending-recv',     formatCurrency(pendingReceivables));

  const profitEl = document.getElementById('dash-net-profit');
  if (profitEl) {
    profitEl.className = 'stat-value ' + (netProfit >= 0 ? 'text-green' : 'text-red');
  }

  renderDashboardChart();
  renderRecentTransactions();
}

function renderDashboardChart() {
  // Monthly revenue vs procurement for last 6 months
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('en-IN', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
  }

  const salesData = Sales.getAll();
  const procData  = Procurement.getAll();

  const revenues = months.map(m =>
    salesData.filter(s => { const d = new Date(s.date); return d.getFullYear() === m.year && d.getMonth() === m.month; })
             .reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0)
  );
  const costs = months.map(m =>
    procData.filter(p => { const d = new Date(p.date); return d.getFullYear() === m.year && d.getMonth() === m.month; })
            .reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0)
  );

  const maxVal = Math.max(...revenues, ...costs, 1);

  const container = document.getElementById('barChart');
  if (!container) return;
  container.innerHTML = '';

  months.forEach((m, i) => {
    const revH = Math.round((revenues[i] / maxVal) * 140);
    const cosH = Math.round((costs[i]    / maxVal) * 140);
    container.innerHTML += `
      <div class="bar-col">
        <div class="bar-val">${revenues[i] > 0 ? '₹' + shortNum(revenues[i]) : ''}</div>
        <div style="display:flex;gap:3px;align-items:flex-end;flex:1">
          <div class="bar-fill" style="height:${revH}px;background:#1a5276;flex:1" title="Revenue: ${formatCurrency(revenues[i])}"></div>
          <div class="bar-fill" style="height:${cosH}px;background:#f6c90e;flex:1" title="Procurement: ${formatCurrency(costs[i])}"></div>
        </div>
        <div class="bar-label">${m.label}</div>
      </div>`;
  });

  // Legend
  document.getElementById('chartLegend').innerHTML =
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;margin-right:12px">
       <span style="display:inline-block;width:12px;height:12px;background:#1a5276;border-radius:2px"></span> Revenue
     </span>
     <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem">
       <span style="display:inline-block;width:12px;height:12px;background:#f6c90e;border-radius:2px"></span> Procurement Cost
     </span>`;
}

function shortNum(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
  if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function renderRecentTransactions() {
  const allTxns = [
    ...Sales.getAll().map(s => ({ date: s.date, label: 'Sale – ' + s.buyer, amount: s.totalAmount, type: 'credit' })),
    ...Procurement.getAll().map(p => ({ date: p.date, label: 'Procurement – ' + p.commodity, amount: p.totalAmount, type: 'debit' })),
    ...Expenses.getAll().map(e => ({ date: e.date, label: 'Expense – ' + e.category, amount: e.amount, type: 'debit' })),
    ...Income.getAll().map(i => ({ date: i.date, label: 'Income – ' + i.source, amount: i.amount, type: 'credit' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const el = document.getElementById('recentTxns');
  if (!el) return;
  if (allTxns.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>No transactions yet.</p></div>';
    return;
  }
  el.innerHTML = allTxns.map(t => `
    <div class="txn-item">
      <div>
        <div class="txn-label">${t.label}</div>
        <div style="font-size:0.72rem;color:#a0aec0">${formatDate(t.date)}</div>
      </div>
      <div class="txn-amount ${t.type}">${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    </div>`).join('');
}

/* ===== MEMBERS ===== */
function renderMembers() {
  const members = Members.getAll();
  const searchVal = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(searchVal) ||
    (m.village || '').toLowerCase().includes(searchVal) ||
    (m.memberId || '').toLowerCase().includes(searchVal)
  );

  const tbody = document.getElementById('membersTable');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="empty-state"><div class="empty-icon">👨‍🌾</div><p>No members found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((m, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${m.memberId || '—'}</td>
      <td><strong>${m.name}</strong></td>
      <td>${m.phone || '—'}</td>
      <td>${m.village || '—'}</td>
      <td>${m.landHolding ? m.landHolding + ' acres' : '—'}</td>
      <td>
        <span class="badge badge-${m.status === 'Active' ? 'success' : 'gray'}">${m.status || 'Active'}</span>
      </td>
      <td class="text-right no-wrap">
        <button class="btn btn-sm btn-outline" onclick="editMember('${m.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember('${m.id}')" style="margin-left:4px">🗑️</button>
      </td>
    </tr>`).join('');

  setHTML('memberCount', members.length + ' members');
}

function editMember(id) {
  const m = Members.getById(id);
  if (!m) return;
  fillForm('memberForm', m);
  document.getElementById('memberFormTitle').textContent = 'Edit Member';
  document.getElementById('memberFormId').value = id;
  openModal('memberModal');
}

function deleteMember(id) {
  if (!confirm('Delete this member?')) return;
  Members.remove(id);
  showToast('Member deleted.');
  renderMembers();
}

function saveMember() {
  const form = document.getElementById('memberForm');
  const id   = document.getElementById('memberFormId').value;
  const data = getFormData(form);
  if (!data.name) { showToast('Member name is required.', 'danger'); return; }
  if (id) {
    Members.update(id, data);
    showToast('Member updated.');
  } else {
    Members.add(data);
    showToast('Member added.');
  }
  closeModal('memberModal');
  renderMembers();
}

/* ===== PROCUREMENT ===== */
function renderProcurement() {
  const list  = Procurement.getAll();
  const tbody = document.getElementById('procurementTable');
  if (!tbody) return;

  const filterDate = document.getElementById('procFilterDate')?.value || '';
  const filterCom  = (document.getElementById('procFilterCom')?.value || '').toLowerCase();
  const filtered   = list.filter(p =>
    (!filterDate || p.date === filterDate) &&
    (!filterCom  || p.commodity.toLowerCase().includes(filterCom))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center"><div class="empty-state"><div class="empty-icon">🌾</div><p>No procurement records found.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(p => {
      const member = Members.getById(p.memberId);
      const due    = (parseFloat(p.totalAmount) || 0) - (parseFloat(p.paidAmount) || 0);
      return `
        <tr>
          <td>${formatDate(p.date)}</td>
          <td><strong>${p.commodity}</strong></td>
          <td>${member ? member.name : (p.farmerName || '—')}</td>
          <td class="text-right">${p.quantity} ${p.unit}</td>
          <td class="text-right">${formatCurrency(p.pricePerUnit)}</td>
          <td class="text-right font-bold">${formatCurrency(p.totalAmount)}</td>
          <td class="text-right text-green">${formatCurrency(p.paidAmount)}</td>
          <td class="text-right ${due > 0 ? 'text-red' : 'text-green'}">${formatCurrency(due)}</td>
          <td>
            <span class="badge badge-${due > 0 ? 'warning' : 'success'}">${due > 0 ? 'Pending' : 'Paid'}</span>
          </td>
          <td class="text-right no-wrap">
            <button class="btn btn-sm btn-outline" onclick="editProcurement('${p.id}')">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProcurement('${p.id}')" style="margin-left:4px">🗑️</button>
          </td>
        </tr>`;
    }).join('');
  }

  setHTML('procTotalCost', formatCurrency(Procurement.totalAmount()));
  setHTML('procTotalPaid', formatCurrency(Procurement.totalPaid()));
  const due = Procurement.totalAmount() - Procurement.totalPaid();
  setHTML('procTotalDue', formatCurrency(due));
  populateMemberSelect('procMemberId');
}

function editProcurement(id) {
  const p = Procurement.getAll().find(x => x.id === id);
  if (!p) return;
  fillForm('procurementForm', p);
  document.getElementById('procFormTitle').textContent = 'Edit Procurement';
  document.getElementById('procFormId').value = id;
  populateMemberSelect('procMemberId', p.memberId);
  openModal('procModal');
}

function deleteProcurement(id) {
  if (!confirm('Delete this procurement entry?')) return;
  Procurement.remove(id);
  showToast('Procurement record deleted.');
  renderProcurement();
}

function saveProcurement() {
  const form = document.getElementById('procurementForm');
  const id   = document.getElementById('procFormId').value;
  const data = getFormData(form);
  if (!data.commodity || !data.date) { showToast('Commodity and date are required.', 'danger'); return; }
  data.quantity     = parseFloat(data.quantity)     || 0;
  data.pricePerUnit = parseFloat(data.pricePerUnit) || 0;
  data.totalAmount  = parseFloat(data.totalAmount)  || (data.quantity * data.pricePerUnit);
  data.paidAmount   = parseFloat(data.paidAmount)   || 0;
  if (id) {
    Procurement.update(id, data);
    showToast('Procurement updated.');
  } else {
    Procurement.add(data);
    showToast('Procurement recorded.');
  }
  closeModal('procModal');
  renderProcurement();
}

/* Auto-calculate total in procurement form */
function calcProcTotal() {
  const qty   = parseFloat(document.getElementById('procQty')?.value)   || 0;
  const price = parseFloat(document.getElementById('procPrice')?.value) || 0;
  const totalEl = document.getElementById('procTotal');
  if (totalEl) totalEl.value = (qty * price).toFixed(2);
}

/* ===== SALES ===== */
function renderSales() {
  const list  = Sales.getAll();
  const tbody = document.getElementById('salesTable');
  if (!tbody) return;

  const filterDate = document.getElementById('saleFilterDate')?.value || '';
  const filtered   = list.filter(s => !filterDate || s.date === filterDate)
                         .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center"><div class="empty-state"><div class="empty-icon">💰</div><p>No sales records found.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(s => {
      const due = (parseFloat(s.totalAmount) || 0) - (parseFloat(s.receivedAmount) || 0);
      return `
        <tr>
          <td>${formatDate(s.date)}</td>
          <td><strong>${s.commodity}</strong></td>
          <td>${s.buyer || '—'}</td>
          <td class="text-right">${s.quantity} ${s.unit}</td>
          <td class="text-right">${formatCurrency(s.pricePerUnit)}</td>
          <td class="text-right font-bold">${formatCurrency(s.totalAmount)}</td>
          <td class="text-right text-green">${formatCurrency(s.receivedAmount)}</td>
          <td class="text-right ${due > 0 ? 'text-red' : 'text-green'}">${formatCurrency(due)}</td>
          <td>
            <span class="badge badge-${due > 0 ? 'warning' : 'success'}">${due > 0 ? 'Pending' : 'Received'}</span>
          </td>
          <td class="text-right no-wrap">
            <button class="btn btn-sm btn-outline" onclick="editSale('${s.id}')">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSale('${s.id}')" style="margin-left:4px">🗑️</button>
          </td>
        </tr>`;
    }).join('');
  }

  setHTML('salesTotalRev',  formatCurrency(Sales.totalRevenue()));
  setHTML('salesTotalRecv', formatCurrency(Sales.totalReceived()));
  const due = Sales.totalRevenue() - Sales.totalReceived();
  setHTML('salesTotalDue',  formatCurrency(due));
}

function editSale(id) {
  const s = Sales.getAll().find(x => x.id === id);
  if (!s) return;
  fillForm('salesForm', s);
  document.getElementById('saleFormTitle').textContent = 'Edit Sale';
  document.getElementById('saleFormId').value = id;
  openModal('saleModal');
}

function deleteSale(id) {
  if (!confirm('Delete this sale?')) return;
  Sales.remove(id);
  showToast('Sale deleted.');
  renderSales();
}

function saveSale() {
  const form = document.getElementById('salesForm');
  const id   = document.getElementById('saleFormId').value;
  const data = getFormData(form);
  if (!data.commodity || !data.date) { showToast('Commodity and date are required.', 'danger'); return; }
  data.quantity       = parseFloat(data.quantity)       || 0;
  data.pricePerUnit   = parseFloat(data.pricePerUnit)   || 0;
  data.totalAmount    = parseFloat(data.totalAmount)    || (data.quantity * data.pricePerUnit);
  data.receivedAmount = parseFloat(data.receivedAmount) || 0;
  if (id) {
    Sales.update(id, data);
    showToast('Sale updated.');
  } else {
    Sales.add(data);
    showToast('Sale recorded.');
  }
  closeModal('saleModal');
  renderSales();
}

function calcSaleTotal() {
  const qty   = parseFloat(document.getElementById('saleQty')?.value)   || 0;
  const price = parseFloat(document.getElementById('salePrice')?.value) || 0;
  const totalEl = document.getElementById('saleTotal');
  if (totalEl) totalEl.value = (qty * price).toFixed(2);
}

/* ===== EXPENSES ===== */
function renderExpenses() {
  const list = Expenses.getAll().sort((a, b) => new Date(b.date) - new Date(a.date));
  const tbody = document.getElementById('expensesTable');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center"><div class="empty-state"><div class="empty-icon">📋</div><p>No expenses recorded.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = list.map(e => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td><span class="badge badge-info">${e.category}</span></td>
        <td>${e.description || '—'}</td>
        <td class="text-right font-bold text-red">${formatCurrency(e.amount)}</td>
        <td>${e.paymentMode || '—'}</td>
        <td class="text-right no-wrap">
          <button class="btn btn-sm btn-outline" onclick="editExpense('${e.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteExpense('${e.id}')" style="margin-left:4px">🗑️</button>
        </td>
      </tr>`).join('');
  }

  setHTML('expensesTotal', formatCurrency(Expenses.total()));
}

function editExpense(id) {
  const e = Expenses.getAll().find(x => x.id === id);
  if (!e) return;
  fillForm('expenseForm', e);
  document.getElementById('expFormTitle').textContent = 'Edit Expense';
  document.getElementById('expFormId').value = id;
  openModal('expenseModal');
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  Expenses.remove(id);
  showToast('Expense deleted.');
  renderExpenses();
}

function saveExpense() {
  const form = document.getElementById('expenseForm');
  const id   = document.getElementById('expFormId').value;
  const data = getFormData(form);
  if (!data.amount || !data.date || !data.category) {
    showToast('Amount, date and category are required.', 'danger'); return;
  }
  data.amount = parseFloat(data.amount) || 0;
  if (id) {
    Expenses.update(id, data);
    showToast('Expense updated.');
  } else {
    Expenses.add(data);
    showToast('Expense added.');
  }
  closeModal('expenseModal');
  renderExpenses();
}

/* ===== OTHER INCOME ===== */
function renderIncome() {
  const list = Income.getAll().sort((a, b) => new Date(b.date) - new Date(a.date));
  const tbody = document.getElementById('incomeTable');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center"><div class="empty-state"><div class="empty-icon">💵</div><p>No income entries recorded.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = list.map(i => `
      <tr>
        <td>${formatDate(i.date)}</td>
        <td><span class="badge badge-success">${i.source}</span></td>
        <td>${i.description || '—'}</td>
        <td class="text-right font-bold text-green">${formatCurrency(i.amount)}</td>
        <td>${i.paymentMode || '—'}</td>
        <td class="text-right no-wrap">
          <button class="btn btn-sm btn-outline" onclick="editIncome('${i.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteIncome('${i.id}')" style="margin-left:4px">🗑️</button>
        </td>
      </tr>`).join('');
  }

  setHTML('incomeTotal', formatCurrency(Income.total()));
}

function editIncome(id) {
  const i = Income.getAll().find(x => x.id === id);
  if (!i) return;
  fillForm('incomeForm', i);
  document.getElementById('incFormTitle').textContent = 'Edit Income';
  document.getElementById('incFormId').value = id;
  openModal('incomeModal');
}

function deleteIncome(id) {
  if (!confirm('Delete this income entry?')) return;
  Income.remove(id);
  showToast('Income entry deleted.');
  renderIncome();
}

function saveIncome() {
  const form = document.getElementById('incomeForm');
  const id   = document.getElementById('incFormId').value;
  const data = getFormData(form);
  if (!data.amount || !data.date || !data.source) {
    showToast('Amount, date and source are required.', 'danger'); return;
  }
  data.amount = parseFloat(data.amount) || 0;
  if (id) {
    Income.update(id, data);
    showToast('Income entry updated.');
  } else {
    Income.add(data);
    showToast('Income entry added.');
  }
  closeModal('incomeModal');
  renderIncome();
}

/* ===== REPORTS ===== */
function renderReports() {
  const reportType = document.getElementById('reportType')?.value || 'pl';
  const reportEl   = document.getElementById('reportContent');
  if (!reportEl) return;

  if (reportType === 'pl')      reportEl.innerHTML = buildPLReport();
  else if (reportType === 'bs') reportEl.innerHTML = buildBalanceSheet();
  else if (reportType === 'ledger') reportEl.innerHTML = buildLedger();
  else if (reportType === 'member-stmt') reportEl.innerHTML = buildMemberStatement();
}

function buildPLReport() {
  const salesRev   = Sales.totalRevenue();
  const procCost   = Procurement.totalAmount();
  const grossProfit= salesRev - procCost;
  const otherInc   = Income.total();
  const totalInc   = grossProfit + otherInc;
  const expTotal   = Expenses.total();
  const netProfit  = totalInc - expTotal;
  const fpo        = FpoInfo.get();

  const expBreakdown = groupBy(Expenses.getAll(), 'category');
  const incBreakdown = groupBy(Income.getAll(), 'source');

  return `
    <div style="max-width:680px;margin:0 auto">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="font-size:1.2rem;font-weight:700;color:#1a5276">${fpo.name}</h2>
        <p style="font-size:0.85rem;color:#718096">Profit &amp; Loss Statement | FY ${fpo.financialYear}</p>
      </div>
      <div class="report-summary">
        <div class="card mb-0">
          <div class="card-title">Income</div>
          <div class="report-row"><span>Sales Revenue</span><span class="text-green">${formatCurrency(salesRev)}</span></div>
          ${Object.entries(incBreakdown).map(([k,v]) => `<div class="report-row text-muted" style="padding-left:16px"><span>${k}</span><span>${formatCurrency(v)}</span></div>`).join('')}
          <div class="report-row"><span>Other Income</span><span class="text-green">${formatCurrency(otherInc)}</span></div>
          <div class="report-row total"><span>Total Income</span><span>${formatCurrency(salesRev + otherInc)}</span></div>
        </div>
        <div class="card mb-0">
          <div class="card-title">Expenditure</div>
          <div class="report-row"><span>Procurement Cost</span><span class="text-red">${formatCurrency(procCost)}</span></div>
          ${Object.entries(expBreakdown).map(([k,v]) => `<div class="report-row text-muted" style="padding-left:16px"><span>${k}</span><span>${formatCurrency(v)}</span></div>`).join('')}
          <div class="report-row total"><span>Total Expenditure</span><span>${formatCurrency(procCost + expTotal)}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="report-row net ${netProfit >= 0 ? 'positive' : 'negative'}">
          <span>${netProfit >= 0 ? '✅ Net Profit' : '⚠️ Net Loss'}</span>
          <span>${formatCurrency(Math.abs(netProfit))}</span>
        </div>
      </div>
    </div>`;
}

function buildBalanceSheet() {
  const cashIn  = Sales.totalReceived() + Income.total();
  const cashOut = Procurement.totalPaid() + Expenses.total();
  const cashBal = cashIn - cashOut;
  const recvProcurement = Procurement.totalAmount() - Procurement.totalPaid();
  const recvSales       = Sales.totalRevenue() - Sales.totalReceived();
  const fpo = FpoInfo.get();

  return `
    <div style="max-width:680px;margin:0 auto">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="font-size:1.2rem;font-weight:700;color:#1a5276">${fpo.name}</h2>
        <p style="font-size:0.85rem;color:#718096">Balance Sheet (Cash Basis) | As of ${formatDate(todayStr())}</p>
      </div>
      <div class="report-summary">
        <div class="card mb-0">
          <div class="card-title">Assets</div>
          <div class="report-row"><span>Cash &amp; Bank Balance</span><span class="text-green">${formatCurrency(cashBal)}</span></div>
          <div class="report-row"><span>Receivables from Buyers</span><span>${formatCurrency(recvSales)}</span></div>
          <div class="report-row total"><span>Total Assets</span><span>${formatCurrency(cashBal + recvSales)}</span></div>
        </div>
        <div class="card mb-0">
          <div class="card-title">Liabilities</div>
          <div class="report-row"><span>Payable to Farmers</span><span class="text-red">${formatCurrency(recvProcurement)}</span></div>
          <div class="report-row total"><span>Total Liabilities</span><span>${formatCurrency(recvProcurement)}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="report-row net ${cashBal - recvProcurement >= 0 ? 'positive' : 'negative'}">
          <span>Net Position (Assets − Liabilities)</span>
          <span>${formatCurrency(cashBal + recvSales - recvProcurement)}</span>
        </div>
      </div>
    </div>`;
}

function buildLedger() {
  const allTxns = [
    ...Sales.getAll().map(s => ({ date: s.date, description: `Sale – ${s.commodity} to ${s.buyer}`, debit: 0, credit: parseFloat(s.totalAmount) || 0 })),
    ...Procurement.getAll().map(p => {
      const farmerLabel = p.memberId ? (Members.getById(p.memberId)?.name || p.farmerName) : p.farmerName;
      const desc = farmerLabel ? `Procurement – ${p.commodity} (${farmerLabel})` : `Procurement – ${p.commodity}`;
      return { date: p.date, description: desc, debit: parseFloat(p.totalAmount) || 0, credit: 0 };
    }),
    ...Expenses.getAll().map(e => ({ date: e.date, description: `Expense – ${e.category}: ${e.description || ''}`, debit: parseFloat(e.amount) || 0, credit: 0 })),
    ...Income.getAll().map(i => ({ date: i.date, description: `Income – ${i.source}: ${i.description || ''}`, debit: 0, credit: parseFloat(i.amount) || 0 })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  let balance = 0;
  const rows = allTxns.map(t => {
    balance += t.credit - t.debit;
    return `<tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.description}</td>
      <td class="text-right text-red">${t.debit > 0 ? formatCurrency(t.debit) : '—'}</td>
      <td class="text-right text-green">${t.credit > 0 ? formatCurrency(t.credit) : '—'}</td>
      <td class="text-right font-bold ${balance >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(balance)}</td>
    </tr>`;
  });

  if (rows.length === 0) return `<div class="empty-state"><div class="empty-icon">📒</div><p>No transactions to display.</p></div>`;

  return `
    <div class="card">
      <div class="card-title">General Ledger</div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Date</th><th>Description</th><th class="text-right">Debit (₹)</th><th class="text-right">Credit (₹)</th><th class="text-right">Balance (₹)</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function buildMemberStatement() {
  const members = Members.getAll();
  if (members.length === 0) return `<div class="empty-state"><div class="empty-icon">👨‍🌾</div><p>No members registered.</p></div>`;

  const procList = Procurement.getAll();
  return members.map(m => {
    const procs = procList.filter(p => p.memberId === m.id);
    const totalSold = procs.reduce((s, p) => s + (parseFloat(p.totalAmount) || 0), 0);
    const totalPaid = procs.reduce((s, p) => s + (parseFloat(p.paidAmount) || 0), 0);
    const due = totalSold - totalPaid;
    return `
      <div class="card">
        <div class="card-title">${m.name} <span class="text-muted" style="font-weight:400;font-size:0.8rem">${m.memberId || ''} | ${m.village || ''}</span></div>
        ${procs.length === 0 ? '<p class="text-muted" style="font-size:0.85rem">No procurement transactions.</p>' : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Commodity</th><th class="text-right">Qty</th><th class="text-right">Total</th><th class="text-right">Paid</th><th class="text-right">Due</th></tr></thead>
            <tbody>
              ${procs.map(p => `<tr>
                <td>${formatDate(p.date)}</td><td>${p.commodity}</td>
                <td class="text-right">${p.quantity} ${p.unit}</td>
                <td class="text-right">${formatCurrency(p.totalAmount)}</td>
                <td class="text-right text-green">${formatCurrency(p.paidAmount)}</td>
                <td class="text-right ${(parseFloat(p.totalAmount)-parseFloat(p.paidAmount)) > 0 ? 'text-red' : 'text-green'}">${formatCurrency(parseFloat(p.totalAmount)-parseFloat(p.paidAmount))}</td>
              </tr>`).join('')}
              <tr style="background:#f7fafc;font-weight:700">
                <td colspan="3">Total</td>
                <td class="text-right">${formatCurrency(totalSold)}</td>
                <td class="text-right text-green">${formatCurrency(totalPaid)}</td>
                <td class="text-right ${due > 0 ? 'text-red' : 'text-green'}">${formatCurrency(due)}</td>
              </tr>
            </tbody>
          </table>
        </div>`}
      </div>`;
  }).join('');
}

/* ===== SETTINGS ===== */
function renderSettings() {
  const info = FpoInfo.get();
  fillForm('settingsForm', info);
}

function saveSettings() {
  const form = document.getElementById('settingsForm');
  const data = getFormData(form);
  FpoInfo.save(data);
  showToast('Settings saved successfully.');
}

function exportData() {
  const data = {
    members:     Members.getAll(),
    procurement: Procurement.getAll(),
    sales:       Sales.getAll(),
    expenses:    Expenses.getAll(),
    income:      Income.getAll(),
    fpoInfo:     FpoInfo.get(),
    exportedAt:  new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'fpo-accounting-backup-' + todayStr() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported successfully.');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.members)     Members.save(data.members);
      if (data.procurement) Procurement.save(data.procurement);
      if (data.sales)       Sales.save(data.sales);
      if (data.expenses)    Expenses.save(data.expenses);
      if (data.income)      Income.save(data.income);
      if (data.fpoInfo)     FpoInfo.save(data.fpoInfo);
      showToast('Data imported successfully! Refreshing...');
      setTimeout(() => location.reload(), 1200);
    } catch {
      showToast('Invalid backup file.', 'danger');
    }
  };
  reader.readAsText(file);
}

/* ===== HELPERS ===== */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function getFormData(form) {
  const data = {};
  new FormData(form).forEach((val, key) => { data[key] = val; });
  return data;
}

function fillForm(formId, obj) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.entries(obj).forEach(([key, val]) => {
    const el = form.querySelector(`[name="${key}"]`);
    if (el) el.value = val ?? '';
  });
}

function groupBy(list, key) {
  return list.reduce((acc, item) => {
    const k = item[key] || 'Other';
    acc[k] = (acc[k] || 0) + (parseFloat(item.amount) || 0);
    return acc;
  }, {});
}

function populateMemberSelect(selectId, selectedId = '') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const members = Members.getAll();
  sel.innerHTML = '<option value="">— Select Member —</option>' +
    members.map(m => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${m.name} (${m.memberId || m.village || ''})</option>`).join('');
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Update topbar date
  const dateEl = document.getElementById('topbarDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  // Load FPO name in sidebar
  const info = FpoInfo.get();
  const logoEl = document.getElementById('sidebarFpoName');
  if (logoEl) logoEl.textContent = info.name;

  // Default to dashboard
  navigateTo('dashboard');
});
