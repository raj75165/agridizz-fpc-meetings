/**
 * storage.js – LocalStorage helpers for FPO Accounting
 * All data is persisted as JSON in localStorage.
 */

const KEYS = {
  MEMBERS:      'fpo_members',
  PROCUREMENT:  'fpo_procurement',
  SALES:        'fpo_sales',
  EXPENSES:     'fpo_expenses',
  INCOME:       'fpo_income',
  FPO_INFO:     'fpo_info',
};

/** Generic get (returns parsed array or empty array) */
function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Generic set (serialize and store) */
function storageSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Generic get for single-object storage (e.g. FPO info) */
function storageGetObj(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

/** Generate a unique ID */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Format a number as Indian currency string */
function formatCurrency(amount) {
  const n = parseFloat(amount) || 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format date string to readable */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Today's date as YYYY-MM-DD */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ===== MEMBERS ===== */
const Members = {
  getAll: () => storageGet(KEYS.MEMBERS),
  save: (list) => storageSet(KEYS.MEMBERS, list),
  add(member) {
    const list = this.getAll();
    const item = { ...member, id: generateId(), createdAt: todayStr() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, changes) {
    const list = this.getAll().map(m => m.id === id ? { ...m, ...changes } : m);
    this.save(list);
  },
  remove(id) {
    this.save(this.getAll().filter(m => m.id !== id));
  },
  getById: (id) => storageGet(KEYS.MEMBERS).find(m => m.id === id),
};

/* ===== PROCUREMENT ===== */
const Procurement = {
  getAll: () => storageGet(KEYS.PROCUREMENT),
  save: (list) => storageSet(KEYS.PROCUREMENT, list),
  add(entry) {
    const list = this.getAll();
    const item = { ...entry, id: generateId(), createdAt: todayStr() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, changes) {
    const list = this.getAll().map(p => p.id === id ? { ...p, ...changes } : p);
    this.save(list);
  },
  remove(id) {
    this.save(this.getAll().filter(p => p.id !== id));
  },
  totalAmount() {
    return this.getAll().reduce((s, p) => s + (parseFloat(p.totalAmount) || 0), 0);
  },
  totalPaid() {
    return this.getAll().reduce((s, p) => s + (parseFloat(p.paidAmount) || 0), 0);
  },
};

/* ===== SALES ===== */
const Sales = {
  getAll: () => storageGet(KEYS.SALES),
  save: (list) => storageSet(KEYS.SALES, list),
  add(entry) {
    const list = this.getAll();
    const item = { ...entry, id: generateId(), createdAt: todayStr() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, changes) {
    const list = this.getAll().map(s => s.id === id ? { ...s, ...changes } : s);
    this.save(list);
  },
  remove(id) {
    this.save(this.getAll().filter(s => s.id !== id));
  },
  totalRevenue() {
    return this.getAll().reduce((s, sale) => s + (parseFloat(sale.totalAmount) || 0), 0);
  },
  totalReceived() {
    return this.getAll().reduce((s, sale) => s + (parseFloat(sale.receivedAmount) || 0), 0);
  },
};

/* ===== EXPENSES ===== */
const Expenses = {
  getAll: () => storageGet(KEYS.EXPENSES),
  save: (list) => storageSet(KEYS.EXPENSES, list),
  add(entry) {
    const list = this.getAll();
    const item = { ...entry, id: generateId(), createdAt: todayStr() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, changes) {
    const list = this.getAll().map(e => e.id === id ? { ...e, ...changes } : e);
    this.save(list);
  },
  remove(id) {
    this.save(this.getAll().filter(e => e.id !== id));
  },
  total() {
    return this.getAll().reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  },
};

/* ===== OTHER INCOME ===== */
const Income = {
  getAll: () => storageGet(KEYS.INCOME),
  save: (list) => storageSet(KEYS.INCOME, list),
  add(entry) {
    const list = this.getAll();
    const item = { ...entry, id: generateId(), createdAt: todayStr() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, changes) {
    const list = this.getAll().map(i => i.id === id ? { ...i, ...changes } : i);
    this.save(list);
  },
  remove(id) {
    this.save(this.getAll().filter(i => i.id !== id));
  },
  total() {
    return this.getAll().reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  },
};

/* ===== FPO INFO ===== */
const FpoInfo = {
  defaults: {
    name: 'Agridizz FPC',
    regNo: '',
    address: '',
    phone: '',
    email: '',
    financialYear: (() => {
      const now = new Date();
      const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return startYear + '-' + (startYear + 1);
    })(),
  },
  get() { return storageGetObj(KEYS.FPO_INFO, this.defaults); },
  save(info) { storageSet(KEYS.FPO_INFO, info); },
};
