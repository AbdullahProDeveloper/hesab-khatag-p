/* =====================================================
   HesabKhata Enterprise Pro - Main Script v5.0
   Professional Grade • Secure • Performant
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, remove, update, get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ==================== FIREBASE INIT ==================== */
const firebaseConfig = {
  apiKey: "AIzaSyBiBGWukd3PNjxK6-gv_4qiCHmwAfO3GzQ",
  authDomain: "hesab-khata.firebaseapp.com",
  projectId: "hesab-khata",
  storageBucket: "hesab-khata.firebasestorage.app",
  messagingSenderId: "138943764760",
  appId: "1:138943764760:web:908c5abacc6122a55d266d",
  measurementId: "G-0HG3FJSS4X"
};

const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);

/* ==================== GLOBAL STATE ==================== */
const AppState = {
  currentUser: null,
  currentUserRole: 'Staff',
  currentUserData: {},
  currentUserShopName: '',
  currentUserAddress: '',
  currentUserFullName: '',
  inventory: [],
  customers: [],
  cart: [],
  lastSelectedProductId: null,
  currentCustomerDue: 0,
  currentCustomerId: null,
  myChart: null,
  expenseChart: null,
  categoryChart: null,
  paymentChart: null,
  monthlyReportChart: null,
  profitChart: null,
  allUsersCache: [],
  allSalesCache: [],
  allExpensesCache: [],
  activityLog: [],
  loginHistory: [],
  editingProductId: null,
  editingCustomerId: null,
  payingCustomerId: null,
  unsubscribers: [],
  dataLoaded: { inventory: false, customers: false, sales: false, expenses: false },
  userSettings: {},
  currentIP: '—',
  currentLocation: '—',
  impersonatingUser: null,
  originalAdminUid: null,
  selectedAdminUser: null
};

// Expose to window for inline onclick handlers
Object.keys(AppState).forEach(key => {
  Object.defineProperty(window, key, {
    get() { return AppState[key]; },
    set(v) { AppState[key] = v; },
    configurable: true
  });
});

/* ==================== CONSTANTS ==================== */
const DEFAULT_SETTINGS = Object.freeze({
  color: 'indigo',
  mode: 'light',
  radius: 16,
  fontSize: 100,
  compactMode: false,
  animations: true,
  sidebarCollapsed: false,
  notifStock: true,
  notifDue: true,
  notifDaily: true,
  soundEffect: false,
  saveHistory: true,
  autoLogout: false,
  sessionTrack: true
});

const LOW_STOCK_THRESHOLD = 5;
const MAX_ACTIVITY_LOG = 500;
const MAX_LOGIN_HISTORY_DISPLAY = 20;
const TOAST_DURATION = 2400;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/* ==================== UTILITIES ==================== */

/** Escape HTML to prevent XSS */
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/** Debounce function calls */
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Throttle function calls */
const throttle = (fn, limit = 100) => {
  let waiting = false;
  return (...args) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => { waiting = false; }, limit);
    }
  };
};

/** Format currency */
const formatCurrency = (n) => {
  const num = parseFloat(n) || 0;
  return num.toFixed(2);
};

/** Safe DOM text setter */
const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

/** Safe DOM HTML setter */
const setHtml = (id, html) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

/** Get element safely */
const $ = (id) => document.getElementById(id);

window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.setText = setText;
window.setHtml = setHtml;

/* ==================== DATE/TIME HELPERS ==================== */
function getDateBn(date) {
  try {
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return date.toLocaleDateString();
  }
}

function getTimeBn(date) {
  try {
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  } catch (e) {
    return date.toLocaleTimeString();
  }
}

window.getDateBn = getDateBn;
window.getTimeBn = getTimeBn;

window.formatDateBn = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

/* ==================== TOAST ==================== */
window.showToast = (type, title, message = '') => {
  const container = $('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast-pro ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-accent"></div>
    <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
    <div class="toast-progress"></div>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('slide-out');
    setTimeout(() => toast.remove(), 600);
  });

  container.appendChild(toast);

  if (AppState.userSettings.soundEffect) playSound(type);

  setTimeout(() => {
    if (!toast.parentElement) return;
    toast.classList.add('slide-out');
    setTimeout(() => toast.remove(), 600);
  }, TOAST_DURATION);
};

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'success' ? 800 : type === 'error' ? 300 : 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { /* silent */ }
}

window.getFirebaseErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে',
    'auth/invalid-email': 'ইমেইল সঠিক নয়',
    'auth/weak-password': 'পাসওয়ার্ড দুর্বল (কমপক্ষে ৬ অক্ষর)',
    'auth/user-not-found': 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই',
    'auth/wrong-password': 'পাসওয়ার্ড ভুল হয়েছে',
    'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ভুল',
    'auth/too-many-requests': 'অনেকবার চেষ্টা, কিছুক্ষণ পর করুন',
    'auth/network-request-failed': 'ইন্টারনেট সংযোগ নেই',
    'auth/missing-email': 'ইমেইল দিন',
    'auth/user-disabled': 'এই অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে',
    'auth/operation-not-allowed': 'Firebase Console-এ Email/Password লগইন চালু করুন'
  };
  return messages[code] || `সমস্যা: ${code || 'unknown'}`;
};

/* ==================== LOADER ==================== */
window.showLoader = (show, text = 'লোড হচ্ছে...') => {
  const el = $('loaderOverlay');
  if (!el) return;
  const sub = $('loaderSubtext');
  if (sub) sub.textContent = text;
  el.classList.toggle('show', show);
};

/* ==================== IP & DEVICE ==================== */
async function fetchIPInfo() {
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (!r.ok) throw new Error('Failed');
    const data = await r.json();
    AppState.currentIP = data.ip || '—';
    AppState.currentLocation = `${data.city || ''}${data.city && data.country_name ? ', ' : ''}${data.country_name || ''}` || '—';
    return { ip: AppState.currentIP, location: AppState.currentLocation, isp: data.org || '—' };
  } catch (e) {
    try {
      const r2 = await fetch('https://api.ipify.org?format=json');
      const d2 = await r2.json();
      AppState.currentIP = d2.ip || '—';
      AppState.currentLocation = '—';
      return { ip: AppState.currentIP, location: '—', isp: '—' };
    } catch (e2) {
      return { ip: '—', location: '—', isp: '—' };
    }
  }
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Unknown', browser = 'Unknown', os = 'Unknown';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

  if (/Mobile/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
  else device = 'Desktop';

  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return {
    device, browser, os,
    platform: navigator.platform || '—',
    language: navigator.language || '—'
  };
}

/* ==================== CONFIRM DIALOG ==================== */
window.showConfirm = (title, text, options = {}) => {
  return new Promise((resolve) => {
    const modalEl = $('confirmModal');
    if (!modalEl) {
      resolve(confirm(`${title}\n${text}`));
      return;
    }

    const modal = new bootstrap.Modal(modalEl);
    const iconEl = $('confirmIcon');
    const okBtn = $('confirmOk');
    const cancelBtn = $('confirmCancel');

    setText('confirmTitle', title || 'নিশ্চিত করুন');
    setText('confirmText', text || '');

    const type = options.type || 'question';
    const iconMap = {
      question: { icon: 'fas fa-question-circle', bg: 'var(--primary-soft)', color: 'var(--primary)' },
      warning:  { icon: 'fas fa-exclamation-triangle', bg: 'var(--warning-soft)', color: 'var(--warning)' },
      danger:   { icon: 'fas fa-trash', bg: 'var(--danger-soft)', color: 'var(--danger)' },
      success:  { icon: 'fas fa-check-circle', bg: 'var(--success-soft)', color: 'var(--success)' }
    };

    const style = iconMap[type] || iconMap.question;
    iconEl.innerHTML = `<i class="${style.icon}"></i>`;
    iconEl.style.background = style.bg;
    iconEl.style.color = style.color;

    okBtn.textContent = options.okText || 'হ্যাঁ, নিশ্চিত';
    cancelBtn.textContent = options.cancelText || 'বাতিল';
    okBtn.style.background = options.danger
      ? 'linear-gradient(135deg,var(--danger),#dc2626)'
      : 'linear-gradient(135deg,var(--primary),var(--primary-dark))';

    const handleOk = () => { cleanup(); resolve(true); modal.hide(); };
    const handleCancel = () => { cleanup(); resolve(false); modal.hide(); };

    function cleanup() {
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
    }

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.show();
  });
};

/* ==================== ACTIVITY LOG ==================== */
window.logActivity = (action, details, amount = null, extraData = {}) => {
  const now = new Date();
  const entry = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    action,
    details,
    amount: amount !== null ? parseFloat(amount) : null,
    date: now.toISOString().split('T')[0],
    time: getTimeBn(now),
    timestamp: now.getTime(),
    ...extraData
  };

  AppState.activityLog.unshift(entry);
  if (AppState.activityLog.length > MAX_ACTIVITY_LOG) {
    AppState.activityLog.pop();
  }

  try {
    localStorage.setItem(
      'hk_activity_' + (AppState.currentUser?.uid || 'guest'),
      JSON.stringify(AppState.activityLog)
    );
  } catch (e) { /* quota exceeded */ }

  renderActivityLog();
  renderActivityLogAdvanced();
  updateActivityStats();
  return entry;
};

window.loadActivityLog = () => {
  try {
    const saved = localStorage.getItem('hk_activity_' + (AppState.currentUser?.uid || 'guest'));
    if (saved) AppState.activityLog = JSON.parse(saved);
  } catch (e) {
    AppState.activityLog = [];
  }
};

window.renderActivityLog = () => {
  const c = $('activityLogList');
  if (!c) return;
  c.innerHTML = '';

  if (AppState.activityLog.length === 0) {
    c.innerHTML = `<div class="text-center text-muted py-4">
      <i class="fas fa-history fa-2x mb-2"></i>
      <p>কোনো কার্যক্রম নেই</p>
    </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  AppState.activityLog.slice(0, 10).forEach(a => {
    const meta = getActivityMeta(a.action);
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
      <div class="activity-icon ${meta.color}"><i class="${meta.icon}"></i></div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(a.action)}</div>
        <div class="activity-details">${escapeHtml(a.details)}</div>
        <div class="activity-time">
          <i class="fas fa-clock me-1"></i>${escapeHtml(a.date)} • ${escapeHtml(a.time)}
        </div>
      </div>
    `;
    fragment.appendChild(div);
  });
  c.appendChild(fragment);
};

function getActivityMeta(action) {
  if (action.includes('বিক্রয়') || action.includes('বিক্রি')) return { icon: 'fas fa-cart-plus', color: 'bg-success-soft', type: 'বিক্রয়' };
  if (action.includes('ক্রয়')) return { icon: 'fas fa-shopping-cart', color: 'bg-warning-soft', type: 'ক্রয়' };
  if (action.includes('পরিশোধ')) return { icon: 'fas fa-hand-holding-usd', color: 'bg-info-soft', type: 'পরিশোধ' };
  if (action.includes('খরচ')) return { icon: 'fas fa-receipt', color: 'bg-danger-soft', type: 'খরচ' };
  if (action.includes('কাস্টমার')) return { icon: 'fas fa-user', color: 'bg-info-soft', type: 'কাস্টমার' };
  if (action.includes('পণ্য')) return { icon: 'fas fa-box', color: 'bg-primary-soft', type: 'পণ্য' };
  if (action.includes('লগইন')) return { icon: 'fas fa-sign-in-alt', color: 'bg-primary-soft', type: 'লগইন' };
  if (action.includes('ডিলিট')) return { icon: 'fas fa-trash', color: 'bg-danger-soft', type: 'ডিলিট' };
  if (action.includes('ব্লক')) return { icon: 'fas fa-user-slash', color: 'bg-danger-soft', type: 'ব্লক' };
  return { icon: 'fas fa-info-circle', color: 'bg-primary-soft', type: 'অন্যান্য' };
}

window.updateActivityStats = () => {
  const sumBy = (predicate) =>
    AppState.activityLog.filter(predicate).reduce((s, a) => s + (a.amount || 0), 0);

  setText('actTotal', AppState.activityLog.length);
  setText('actSales', '৳' + sumBy(a => a.action.includes('বিক্রয়') && a.amount).toFixed(2));
  setText('actPurchase', '৳' + sumBy(a => a.action.includes('ক্রয়') && a.amount).toFixed(2));
  setText('actExpense', '৳' + sumBy(a => a.action.includes('খরচ') && a.amount).toFixed(2));
  setText('actPayment', '৳' + sumBy(a => a.action.includes('পরিশোধ') && a.amount).toFixed(2));
};

window.renderActivityLogAdvanced = () => {
  const c = $('activityTimelineList');
  if (!c) return;

  const q = ($('activitySearchInput')?.value || '').toLowerCase();
  const from = $('activityDateFrom')?.value || '';
  const to = $('activityDateTo')?.value || '';
  const type = $('activityTypeFilter')?.value || '';

  let filtered = [...AppState.activityLog];
  if (q) filtered = filtered.filter(a =>
    a.action.toLowerCase().includes(q) ||
    (a.details || '').toLowerCase().includes(q) ||
    (a.amount && String(a.amount).includes(q))
  );
  if (from) filtered = filtered.filter(a => a.date >= from);
  if (to) filtered = filtered.filter(a => a.date <= to);
  if (type) filtered = filtered.filter(a =>
    a.action.includes(type) || getActivityMeta(a.action).type === type
  );

  filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  c.innerHTML = '';
  if (filtered.length === 0) {
    c.innerHTML = `<div class="empty-state">
      <i class="fas fa-search"></i>
      <h5>কোনো ফলাফল নেই</h5>
      <p>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
    </div>`;
    return;
  }

  const grouped = {};
  filtered.forEach(a => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

  const fragment = document.createDocumentFragment();
  const sortedDates = Object.keys(grouped).sort().reverse();

  sortedDates.forEach(date => {
    const dayItems = grouped[date];
    const dayTotal = dayItems.filter(a => a.amount).reduce((s, a) => s + (a.amount || 0), 0);

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin:16px 0 10px;padding:8px 12px;background:var(--primary-soft);border-radius:10px;border-left:4px solid var(--primary);flex-wrap:wrap;';
    header.innerHTML = `
      <i class="fas fa-calendar-day text-primary"></i>
      <strong>${escapeHtml(window.formatDateBn(date))}</strong>
      <span class="tag tag-primary ms-auto">${dayItems.length} টি</span>
      ${dayTotal > 0 ? `<span class="tag tag-success">মোট: ৳${dayTotal.toFixed(2)}</span>` : ''}
    `;
    fragment.appendChild(header);

    dayItems.forEach(a => {
      const meta = getActivityMeta(a.action);
      let amountClass = '';
      if (a.action.includes('বিক্রয়')) amountClass = 'amount-sale';
      else if (a.action.includes('ক্রয়')) amountClass = 'amount-purchase';
      else if (a.action.includes('খরচ')) amountClass = 'amount-expense';
      else if (a.action.includes('পরিশোধ')) amountClass = 'amount-payment';

      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-icon ${meta.color}"><i class="${meta.icon}"></i></div>
        <div class="timeline-content">
          <div class="timeline-title">
            <span>${escapeHtml(a.action)}</span>
            ${a.amount ? `<span class="timeline-amount ${amountClass}">৳${a.amount.toFixed(2)}</span>` : ''}
          </div>
          <div class="timeline-desc">${escapeHtml(a.details || '—')}</div>
          <div class="timeline-meta">
            <span><i class="fas fa-calendar"></i> ${escapeHtml(a.date)}</span>
            <span><i class="fas fa-clock"></i> ${escapeHtml(a.time)}</span>
            ${a.invoiceNo ? `<span><i class="fas fa-file-invoice"></i> ${escapeHtml(a.invoiceNo)}</span>` : ''}
            ${a.customerName ? `<span><i class="fas fa-user"></i> ${escapeHtml(a.customerName)}</span>` : ''}
          </div>
        </div>
      `;
      fragment.appendChild(item);
    });
  });

  c.appendChild(fragment);
};

window.setActivityChip = (el) => {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const typeFilter = $('activityTypeFilter');
  if (typeFilter) typeFilter.value = el.dataset.type;
  renderActivityLogAdvanced();
};

window.resetActivityFilters = () => {
  ['activitySearchInput', 'activityDateFrom', 'activityDateTo', 'activityTypeFilter'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  renderActivityLogAdvanced();
};

window.exportActivityLog = () => {
  let c = 'তারিখ,সময়,কার্যক্রম,বিবরণ,পরিমাণ\n';
  AppState.activityLog.forEach(a => {
    c += `${a.date},${a.time},"${(a.action || '').replace(/"/g, '""')}","${(a.details || '').replace(/"/g, '""')}",${a.amount || 0}\n`;
  });
  downloadFile(c, `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('success', 'এক্সপোর্ট সফল', 'activity-log.csv');
};

window.clearActivityLog = async () => {
  const ok = await showConfirm('লগ ক্লিয়ার করবেন?', 'সব অ্যাক্টিভিটি লগ মুছে যাবে।', { type: 'danger', danger: true });
  if (!ok) return;

  AppState.activityLog = [];
  try {
    localStorage.removeItem('hk_activity_' + (AppState.currentUser?.uid || 'guest'));
  } catch (e) { /* silent */ }

  renderActivityLog();
  renderActivityLogAdvanced();
  updateActivityStats();
  showToast('success', 'লগ ক্লিয়ার হয়েছে');
};

/* ==================== FILE DOWNLOAD ==================== */
function downloadFile(content, filename, mime = 'text/csv') {
  const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
window.downloadFile = downloadFile;

/* ==================== THEME ==================== */
window.applySettings = (settings) => {
  AppState.userSettings = { ...DEFAULT_SETTINGS, ...settings };
  const s = AppState.userSettings;

  document.documentElement.setAttribute('data-color', s.color);

  const actualMode = s.mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : s.mode;
  document.documentElement.setAttribute('data-mode', actualMode);

  document.documentElement.style.setProperty('--radius', s.radius + 'px');
  document.documentElement.style.setProperty('--radius-sm', (s.radius - 4 > 4 ? s.radius - 4 : 4) + 'px');
  document.documentElement.style.setProperty('--font-size', s.fontSize + '%');

  document.body.classList.toggle('compact', s.compactMode);
  document.body.classList.toggle('no-anim', !s.animations);
  document.body.classList.toggle('sidebar-collapsed', s.sidebarCollapsed);
};

window.saveUserSettings = async () => {
  if (!AppState.currentUser) return;
  try {
    await update(ref(db, 'users/' + AppState.currentUser.uid), { settings: AppState.userSettings });
  } catch (e) {
    console.error('Save settings error:', e);
  }
};

window.loadUserSettings = (data) => {
  const saved = data?.settings || {};
  window.applySettings(saved);
  syncSettingsUI();
};

function syncSettingsUI() {
  const s = AppState.userSettings;

  document.querySelectorAll('.color-item').forEach(el =>
    el.classList.toggle('active', el.dataset.color === s.color)
  );
  document.querySelectorAll('.theme-mode-item').forEach(el =>
    el.classList.toggle('active', el.dataset.mode === s.mode)
  );

  const radiusEl = $('radiusSlider');
  const fontEl = $('fontSlider');
  if (radiusEl) radiusEl.value = s.radius;
  if (fontEl) fontEl.value = s.fontSize;

  setText('radiusValue', s.radius);
  setText('fontValue', s.fontSize);

  const map = {
    compactMode: 'compactMode',
    animationsToggle: 'animations',
    sidebarCollapse: 'sidebarCollapsed',
    notifStock: 'notifStock',
    notifDue: 'notifDue',
    notifDaily: 'notifDaily',
    soundEffect: 'soundEffect',
    saveHistory: 'saveHistory',
    autoLogout: 'autoLogout',
    sessionTrack: 'sessionTrack'
  };

  Object.keys(map).forEach(id => {
    const el = $(id);
    if (el) el.checked = !!s[map[id]];
  });
}

window.setThemeColor = (color, el) => {
  AppState.userSettings.color = color;
  document.querySelectorAll('.color-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.documentElement.setAttribute('data-color', color);
  saveUserSettings();
  showToast('success', 'কালার পরিবর্তন', color);
};

window.setThemeMode = (mode, el) => {
  AppState.userSettings.mode = mode;
  document.querySelectorAll('.theme-mode-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  const actual = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.setAttribute('data-mode', actual);
  saveUserSettings();
  showToast('success', 'মোড পরিবর্তন', mode);
};

window.setRadius = (v) => {
  AppState.userSettings.radius = parseInt(v);
  document.documentElement.style.setProperty('--radius', v + 'px');
  document.documentElement.style.setProperty('--radius-sm', (v - 4 > 4 ? v - 4 : 4) + 'px');
  setText('radiusValue', v);
  saveUserSettings();
};

window.setFontSize = (v) => {
  AppState.userSettings.fontSize = parseInt(v);
  document.documentElement.style.setProperty('--font-size', v + '%');
  setText('fontValue', v);
  saveUserSettings();
};

window.toggleCompact = (v) => {
  AppState.userSettings.compactMode = v;
  document.body.classList.toggle('compact', v);
  saveUserSettings();
};

window.toggleAnimations = (v) => {
  AppState.userSettings.animations = v;
  document.body.classList.toggle('no-anim', !v);
  saveUserSettings();
};

window.toggleSidebarCollapse = (v) => {
  AppState.userSettings.sidebarCollapsed = v;
  document.body.classList.toggle('sidebar-collapsed', v);
  saveUserSettings();
};

window.saveSetting = (key, v) => {
  AppState.userSettings[key] = v;
  saveUserSettings();
};

window.resetTheme = async () => {
  const ok = await showConfirm('ডিফল্টে ফিরবেন?', 'সব সেটিংস ডিফল্টে ফিরে যাবে।', { type: 'warning' });
  if (!ok) return;
  window.applySettings(DEFAULT_SETTINGS);
  syncSettingsUI();
  await saveUserSettings();
  showToast('success', 'ডিফল্টে ফিরে এসেছে');
};

window.switchSettingsTab = (tab, el) => {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const content = $('settings-' + tab);
  if (content) content.classList.add('active');
};

/* ==================== PASSWORD STRENGTH ==================== */
window.checkPasswordStrength = () => {
  const p = $('regPassword').value;
  const bar = $('strengthBar');
  const txt = $('strengthText');
  if (!bar || !txt) return;

  let s = 0;
  if (p.length >= 8) s++;
  if (p.match(/[a-z]+/)) s++;
  if (p.match(/[A-Z]+/)) s++;
  if (p.match(/[0-9]+/)) s++;
  if (p.match(/[$@#&!]+/)) s++;

  if (p.length === 0) {
    bar.style.width = '0%';
    bar.className = 'password-strength-bar';
    txt.textContent = 'পাসওয়ার্ড দিন';
    txt.style.color = 'rgba(255,255,255,0.5)';
  } else if (s <= 2) {
    bar.style.width = '20%';
    bar.className = 'password-strength-bar strength-weak';
    txt.textContent = 'দুর্বল';
    txt.style.color = '#ef4444';
  } else if (s === 3) {
    bar.style.width = '40%';
    bar.className = 'password-strength-bar strength-fair';
    txt.textContent = 'মাঝারি';
    txt.style.color = '#f59e0b';
  } else if (s === 4) {
    bar.style.width = '70%';
    bar.className = 'password-strength-bar strength-good';
    txt.textContent = 'ভালো';
    txt.style.color = '#3b82f6';
  } else {
    bar.style.width = '100%';
    bar.className = 'password-strength-bar strength-strong';
    txt.textContent = 'শক্তিশালী';
    txt.style.color = '#10b981';
  }
};

/* ==================== AUTH NAVIGATION ==================== */
window.showLogin = () => {
  $('loginForm').style.display = 'block';
  $('registerForm').style.display = 'none';
  $('forgotForm').style.display = 'none';
};

window.showRegister = () => {
  $('loginForm').style.display = 'none';
  $('registerForm').style.display = 'block';
  $('forgotForm').style.display = 'none';
};

window.showForgotPassword = () => {
  $('loginForm').style.display = 'none';
  $('registerForm').style.display = 'none';
  $('forgotForm').style.display = 'block';
};

window.togglePassword = (id, btn) => {
  const i = $(id);
  if (!i) return;
  if (i.type === 'password') {
    i.type = 'text';
    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    i.type = 'password';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
  }
};

/* ==================== LOGIN ==================== */
window.login = async () => {
  const email = $('loginEmail').value.trim();
  const pass = $('loginPassword').value;

  if (!email || !pass) {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন');
    return;
  }

  const btn = $('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>লগইন হচ্ছে...';
  showLoader(true, 'যাচাই করা হচ্ছে...');

  try {
    // Block check (non-blocking if rules prevent)
    let found = null;
    try {
      const usersSnap = await get(ref(db, 'users'));
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        found = Object.values(users).find(u => u.email === email);
      }
    } catch (blockCheckErr) {
      console.warn('Block check skipped (rules):', blockCheckErr.code);
    }

    if (found) {
      const status = found.status || 'Active';

      if (status === 'Blocked') {
        const blockUntil = found.blockUntil ? new Date(found.blockUntil) : null;
        if (!blockUntil || blockUntil > new Date()) {
          const untilText = blockUntil
            ? getDateBn(blockUntil) + ' ' + getTimeBn(blockUntil)
            : 'চিরতরে';
          showLoader(false);
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন';
          await Swal.fire({
            icon: 'error',
            title: 'অ্যাকাউন্ট ব্লক করা হয়েছে',
            html: `<div style="text-align:left;font-size:0.9rem;">
              <p><strong>কারণ:</strong> ${escapeHtml(found.blockReason || 'অ্যাডমিন কর্তৃক ব্লক করা হয়েছে')}</p>
              <p><strong>আনব্লক হবে:</strong> ${escapeHtml(untilText)}</p>
              <p class="text-muted small">সাহায্যের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
            </div>`,
            confirmButtonText: 'ঠিক আছে'
          });
          return;
        } else {
          try {
            await update(ref(db, 'users/' + found.uid), {
              status: 'Active',
              blockUntil: null,
              blockReason: null
            });
          } catch (e) { /* silent */ }
        }
      }

      if (status === 'Suspended') {
        showLoader(false);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন';
        await Swal.fire({
          icon: 'error',
          title: 'অ্যাকাউন্ট সাসপেন্ড',
          text: 'আপনার অ্যাকাউন্ট সাসপেন্ড করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।',
          confirmButtonText: 'ঠিক আছে'
        });
        return;
      }
    }

    await signInWithEmailAndPassword(auth, email, pass);
    showToast('success', 'লগইন সফল!', 'আপনার ড্যাশবোর্ডে স্বাগতম');
  } catch (e) {
    console.error('Login error:', e);
    showToast('error', 'লগইন ব্যর্থ', getFirebaseErrorMessage(e.code));
    showLoader(false);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন';
  }
};

/* ==================== REGISTER ==================== */
window.register = async () => {
  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim();
  const phone = $('regPhone').value.trim();
  const shopName = $('regShopName').value.trim();
  const address = $('regAddress').value.trim();
  const pass = $('regPassword').value;
  const cp = $('regConfirmPassword').value;
  const terms = $('termsCheck').checked;

  if (!name || !email || !phone || !shopName || !address || !pass || !cp) {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন');
    return;
  }
  if (!phone.match(/^01[3-9]\d{8}$/)) {
    showToast('error', 'ভুল মোবাইল', '01XXXXXXXXX ফরম্যাটে দিন');
    return;
  }
  if (pass.length < 6) {
    showToast('error', 'দুর্বল পাসওয়ার্ড', 'কমপক্ষে ৬ অক্ষর দিন');
    return;
  }
  if (pass !== cp) {
    showToast('error', 'পাসওয়ার্ড মিলছে না', 'দুটি পাসওয়ার্ড এক হতে হবে');
    return;
  }
  if (!terms) {
    showToast('warning', 'শর্তাবলী', 'শর্তাবলীতে সম্মত হন');
    return;
  }

  const btn = $('registerBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>রেজিস্ট্রেশন হচ্ছে...';
  showLoader(true, 'অ্যাকাউন্ট তৈরি হচ্ছে...');

  try {
    const ipInfo = await fetchIPInfo();
    const device = getDeviceInfo();
    const uc = await createUserWithEmailAndPassword(auth, email, pass);
    const user = uc.user;
    const now = new Date();

    await set(ref(db, 'users/' + user.uid), {
      uid: user.uid,
      fullName: name, email, phone, shopName, address,
      role: 'Staff', status: 'Active',
      createdAt: now.toISOString(),
      createdAtDate: now.toISOString().split('T')[0],
      createdAtTime: getTimeBn(now),
      registrationIp: ipInfo.ip || '—',
      registrationLocation: ipInfo.location || '—',
      registrationDevice: device.device,
      registrationBrowser: device.browser,
      registrationOS: device.os,
      settings: DEFAULT_SETTINGS
    });

    const histRef = push(ref(db, 'users/' + user.uid + '/loginHistory'));
    await set(histRef, {
      id: histRef.key,
      date: now.toISOString().split('T')[0],
      time: getTimeBn(now),
      timestamp: now.getTime(),
      ip: ipInfo.ip || '—',
      location: ipInfo.location || '—',
      device: device.device,
      browser: device.browser,
      os: device.os,
      action: 'রেজিস্ট্রেশন'
    });

    showToast('success', 'রেজিস্ট্রেশন সফল!', 'স্বাগতম');
    ['regName', 'regEmail', 'regPhone', 'regShopName', 'regAddress', 'regPassword', 'regConfirmPassword']
      .forEach(id => { const el = $(id); if (el) el.value = ''; });

    $('termsCheck').checked = false;
    $('strengthBar').style.width = '0%';
    $('strengthText').textContent = 'পাসওয়ার্ড দিন';
  } catch (e) {
    console.error('Register error:', e);
    showToast('error', 'রেজিস্ট্রেশন ব্যর্থ', getFirebaseErrorMessage(e.code));
    showLoader(false);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-rocket me-2"></i>রেজিস্টার করুন';
  }
};

/* ==================== RESET PASSWORD ==================== */
window.resetPassword = async () => {
  const email = $('resetEmail').value.trim();
  if (!email) {
    showToast('warning', 'সতর্কতা', 'ইমেইল লিখুন');
    return;
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন');
    return;
  }

  const btn = $('resetBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>পাঠানো হচ্ছে...';

  try {
    await sendPasswordResetEmail(auth, email);
    showToast('success', 'রিসেট লিংক পাঠানো হয়েছে!', `${email} এ চেক করুন`);
    $('resetEmail').value = '';
    setTimeout(showLogin, 1500);
  } catch (e) {
    showToast('error', 'ব্যর্থ', getFirebaseErrorMessage(e.code));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>রিসেট লিংক পাঠান';
};

/* ==================== LOGOUT ==================== */
window.logout = async () => {
  const ok = await showConfirm('লগ আউট করবেন?', 'আপনি সফলভাবে লগ আউট হবেন।', { type: 'question' });
  if (!ok) return;
  try {
    await signOut(auth);
    showToast('info', 'লগ আউট', 'আবার আসবেন!');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
};

/* ==================== AUTH STATE ==================== */
onAuthStateChanged(auth, async (user) => {
  // Cleanup previous listeners
  AppState.unsubscribers.forEach(unsub => {
    try { unsub(); } catch (e) { /* silent */ }
  });
  AppState.unsubscribers = [];
  AppState.dataLoaded = { inventory: false, customers: false, sales: false, expenses: false };

  if (!user) {
    AppState.currentUser = null;
    AppState.currentUserRole = 'Staff';
    AppState.impersonatingUser = null;
    document.body.classList.remove('impersonating');

    $('authScreen').style.display = 'flex';
    $('mainApp').style.display = 'none';
    showLogin();
    showLoader(false);

    const btn = $('loginBtn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন';
    }
    const rbtn = $('registerBtn');
    if (rbtn) {
      rbtn.disabled = false;
      rbtn.innerHTML = '<i class="fas fa-rocket me-2"></i>রেজিস্টার করুন';
    }
    return;
  }

  AppState.currentUser = user;
  showLoader(true, 'প্রোফাইল লোড হচ্ছে...');

  // Step 1: IP + Device
  let ipInfo = { ip: '—', location: '—' };
  try { ipInfo = await fetchIPInfo(); } catch (e) { /* silent */ }
  const device = getDeviceInfo();

  // Step 2: Load user data
  let data = null;
  try {
    const snap = await get(ref(db, 'users/' + user.uid));
    if (!snap.exists()) {
      const now = new Date();
      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        fullName: user.email.split('@')[0],
        email: user.email, phone: '', shopName: '', address: '',
        role: 'Staff', status: 'Active',
        createdAt: now.toISOString(),
        createdAtDate: now.toISOString().split('T')[0],
        createdAtTime: getTimeBn(now),
        registrationIp: ipInfo.ip || '—',
        registrationLocation: ipInfo.location || '—',
        settings: DEFAULT_SETTINGS
      });
      data = (await get(ref(db, 'users/' + user.uid))).val();
    } else {
      data = snap.val();
    }
  } catch (e) {
    console.error('❌ Failed to load user data:', e);
    showToast('error', 'প্রোফাইল লোড ব্যর্থ', e.message || 'Rules চেক করুন');
    showLoader(false);
    return;
  }

  // Step 3: Handle impersonation
  let activeData = data;
  let activeUser = user;

  if (AppState.impersonatingUser && AppState.impersonatingUser !== user.uid) {
    try {
      const targetSnap = await get(ref(db, 'users/' + AppState.impersonatingUser));
      if (targetSnap.exists()) {
        activeData = targetSnap.val();
        activeUser = { uid: AppState.impersonatingUser, email: activeData.email };
      }
    } catch (e) {
      console.warn('Impersonation load failed:', e);
    }
  }

  AppState.currentUserData = activeData;
  AppState.currentUserRole = activeData.role || 'Staff';
  AppState.currentUserShopName = activeData.shopName || '';
  AppState.currentUserAddress = activeData.address || '';
  AppState.currentUserFullName = activeData.fullName || 'User';

  const isAdmin = AppState.currentUserRole === 'Admin';

  // Step 4: Track login (non-blocking)
  if (!AppState.impersonatingUser) {
    (async () => {
      try {
        const now = new Date();
        const newLoginEntry = {
          date: now.toISOString().split('T')[0],
          time: getTimeBn(now),
          timestamp: now.getTime(),
          ip: ipInfo.ip || '—',
          location: ipInfo.location || '—',
          device: device.device,
          browser: device.browser,
          os: device.os,
          action: 'লগইন'
        };

        await update(ref(db, 'users/' + user.uid), {
          lastLogin: newLoginEntry,
          lastIp: ipInfo.ip || '—',
          lastLocation: ipInfo.location || '—',
          lastDevice: device.device,
          lastBrowser: device.browser,
          lastOS: device.os
        });

        const histRef = push(ref(db, 'users/' + user.uid + '/loginHistory'));
        await set(histRef, { id: histRef.key, ...newLoginEntry });
      } catch (e) {
        console.warn('Login history save failed (non-blocking):', e.code);
      }
    })();
  }

  // Step 5: Apply settings
  try { loadUserSettings(activeData); } catch (e) { console.warn('Settings load failed:', e); }

  // Step 6: Update UI
  try {
    const initial = (activeUser.email[0] || 'U').toUpperCase();

    setText('userAvatar', initial);
    setText('dropdownAvatar', initial);
    setText('userName', activeData.fullName || 'User');
    setText('welcomeName', activeData.fullName || 'User');
    setText('userRoleLabel', AppState.currentUserRole);
    setText('dropdownName', activeData.fullName || 'User');
    setText('dropdownEmail', activeUser.email);
    setText('dropdownRole', AppState.currentUserRole);

    const navAdmin = $('nav-admin');
    const adminDivider = $('adminDivider');
    const adminLabel = $('adminLabel');

    if (navAdmin) navAdmin.style.display = isAdmin ? 'flex' : 'none';
    if (adminDivider) adminDivider.style.display = isAdmin ? 'block' : 'none';
    if (adminLabel) adminLabel.style.display = isAdmin ? 'block' : 'none';

    $('authScreen').style.display = 'none';
    $('mainApp').style.display = 'block';

    if (AppState.impersonatingUser && AppState.impersonatingUser !== user.uid) {
      document.body.classList.add('impersonating');
      const banner = $('impersonationBanner');
      if (banner) banner.style.display = 'flex';
      setText('impersonatedUser', activeData.fullName || activeData.email);
    } else {
      document.body.classList.remove('impersonating');
      const banner = $('impersonationBanner');
      if (banner) banner.style.display = 'none';
    }
  } catch (e) { console.warn('UI update failed:', e); }

  // Step 7: Load app data
  try { loadActivityLog(); } catch (e) { console.warn('Activity log load failed:', e); }
  try { initApp(); } catch (e) { console.warn('initApp failed:', e); }
  try { renderProfile(); } catch (e) { console.warn('renderProfile failed:', e); }
  try { loadLoginHistory(); } catch (e) { console.warn('loadLoginHistory failed:', e); }

  // Step 8: Admin-specific
  if (isAdmin) {
    try {
      loadAllUsers();
    } catch (e) {
      console.error('❌ loadAllUsers failed (admin panel may not work):', e);
      showToast('warning', 'অ্যাডমিন প্যানেল লোড হয়নি', 'Rules-এ users নোডে .read permission দিন');
    }
  }

  // Step 9: Show dashboard
  try { showSection('dashboard'); } catch (e) { console.warn('showSection failed:', e); }
  showLoader(false);

  setTimeout(() => {
    try {
      if (AppState.impersonatingUser && AppState.impersonatingUser !== user.uid) {
        showToast('info', 'ইউজার মোড', `${activeData.fullName || activeData.email} হিসেবে কাজ করছেন`);
      } else {
        showToast('success', `স্বাগতম, ${activeData.fullName || 'User'}!`, `রোল: ${AppState.currentUserRole}`);
      }
    } catch (e) { /* silent */ }
  }, 300);
});

/* ==================== INIT APP ==================== */
function initApp() {
  if (!AppState.currentUser) return;
  const uid = AppState.impersonatingUser || AppState.currentUser.uid;

  const unsub1 = onValue(ref(db, 'users/' + uid + '/inventory'), (snap) => {
    AppState.inventory = snap.val() ? Object.values(snap.val()) : [];
    AppState.dataLoaded.inventory = true;
    renderProductCards();
    renderInventoryTable();
    renderCustomerSelect();
    renderLowStock();
    updateQuickStats();
  }, (err) => { console.warn('inventory listener error:', err.code); });
  AppState.unsubscribers.push(unsub1);

  const unsub2 = onValue(ref(db, 'users/' + uid + '/customers'), (snap) => {
    AppState.customers = snap.val() ? Object.values(snap.val()) : [];
    AppState.dataLoaded.customers = true;
    renderCustomerCards();
    renderCustomerHistoryList();
    renderCustomerSelect();
    updateQuickStats();
  }, (err) => { console.warn('customers listener error:', err.code); });
  AppState.unsubscribers.push(unsub2);

  const unsub3 = onValue(ref(db, 'users/' + uid + '/sales'), (snap) => {
    const sales = snap.val() ? Object.values(snap.val()) : [];
    AppState.allSalesCache = sales;
    AppState.dataLoaded.sales = true;
    renderDashboard(sales);
    renderInvoices(sales);
    renderRecentTransactions(sales);
    renderSalesList(sales);
    renderAnalytics(sales);
    renderReports(sales);
    renderMasterList();
  }, (err) => { console.warn('sales listener error:', err.code); });
  AppState.unsubscribers.push(unsub3);

  const unsub4 = onValue(ref(db, 'users/' + uid + '/expenses'), (snap) => {
    const exp = snap.val() ? Object.values(snap.val()) : [];
    AppState.allExpensesCache = exp;
    AppState.dataLoaded.expenses = true;
    renderExpenses(exp);
    updateTotalExpense(exp);
    renderExpenseChart(exp);
    renderMasterList();
  }, (err) => { console.warn('expenses listener error:', err.code); });
  AppState.unsubscribers.push(unsub4);

  // Product search with debounce
  const ps = $('productSearch');
  if (ps && !ps.dataset.bound) {
    ps.dataset.bound = 'true';
    ps.addEventListener('input', debounce(function (e) {
      const q = e.target.value.toLowerCase();
      const res = $('productSearchResults');
      res.innerHTML = '';
      if (q.length > 0) {
        const matches = AppState.inventory.filter(i =>
          i.name.toLowerCase().includes(q) && parseInt(i.qty) > 0
        );
        matches.forEach(item => {
          res.innerHTML += `<button class="list-group-item list-group-item-action d-flex justify-content-between" onclick="selectProduct('${item.id}')">
            <span><strong>${escapeHtml(item.name)}</strong> <small class="text-muted">(স্টক:${item.qty})</small></span>
            <b class="text-primary">৳${item.sellPrice}</b>
          </button>`;
        });
      }
    }, 250));
  }

  // Live previews
  ['addProdQty', 'addProdBuyPrice', 'addProdSellPrice'].forEach(id => {
    const el = $(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = 'true';
      el.addEventListener('input', updateAddProdLive);
    }
  });

  ['purchaseQty', 'purchasePrice'].forEach(id => {
    const el = $(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = 'true';
      el.addEventListener('input', updatePurchaseLive);
    }
  });

  setText('currentDate', getDateBn(new Date()));

  if (AppState.currentUserRole === 'Admin') loadAllUsers();
}

/* ==================== PROFILE ==================== */
function renderProfile() {
  const data = AppState.currentUserData || {};
  const user = AppState.currentUser;
  if (!user) return;

  const email = AppState.impersonatingUser ? data.email : user.email;
  const initial = (email[0] || 'U').toUpperCase();

  setText('profileAvatar', initial);
  setText('profileFullName', data.fullName || 'User');
  setText('profileEmail', email);
  setText('profileRole', AppState.currentUserRole);
  setText('infoFullName', data.fullName || '—');
  setText('infoEmail', email);
  setText('infoPhone', data.phone || '—');
  setText('infoShopName', data.shopName || '—');
  setText('infoAddress', data.address || '—');
  setText('infoRole', AppState.currentUserRole);
  setText('infoCreatedDate', data.createdAtDate || (data.createdAt ? getDateBn(new Date(data.createdAt)) : '—'));
  setText('infoCreatedTime', data.createdAtTime || '—');
  setText('infoUid', user.uid);
  setText('infoIp', data.lastIp || data.registrationIp || AppState.currentIP || '—');
  setText('infoDevice', data.lastDevice || data.registrationDevice || '—');
  setText('infoBrowser', data.lastBrowser || data.registrationBrowser || '—');
  setText('infoLocation', data.lastLocation || data.registrationLocation || '—');
  setText('infoLastLogin', data.lastLogin ? `${data.lastLogin.date} • ${data.lastLogin.time}` : '—');
  setText('infoCreated', data.createdAt ? new Date(data.createdAt).toLocaleString('bn-BD') : '—');

  const status = data.status || 'Active';
  const statusEl = $('infoAccountStatus');
  if (statusEl) {
    statusEl.textContent = status;
    statusEl.className = status === 'Active' ? 'text-success' : 'text-danger';
  }
}
window.renderProfile = renderProfile;

window.openProfile = (e) => {
  if (e) e.preventDefault();
  closeUserDropdown();
  showSection('profile');
};

window.openProfileEdit = (e) => {
  if (e) e.preventDefault();
  closeUserDropdown();
  const data = AppState.currentUserData || {};
  $('editProfileName').value = data.fullName || '';
  $('editProfilePhone').value = data.phone || '';
  $('editProfileEmail').value = AppState.currentUser.email;
  $('editProfileShopName').value = data.shopName || '';
  $('editProfileAddress').value = data.address || '';
  new bootstrap.Modal($('editProfileModal')).show();
};

window.openSettings = (e) => {
  if (e) e.preventDefault();
  closeUserDropdown();
  showSection('settings');
};

window.openLoginHistory = (e) => {
  if (e) e.preventDefault();
  closeUserDropdown();
  new bootstrap.Modal($('loginHistoryModal')).show();
};

window.openChangePassword = () => {
  $('pwdEmail').value = AppState.currentUser.email;
  new bootstrap.Modal($('changePasswordModal')).show();
};

window.saveProfile = async () => {
  const name = $('editProfileName').value.trim();
  const phone = $('editProfilePhone').value.trim();
  const shopName = $('editProfileShopName').value.trim();
  const address = $('editProfileAddress').value.trim();

  if (!name) {
    showToast('warning', 'সতর্কতা', 'নাম আবশ্যক');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid), { fullName: name, phone, shopName, address });

    AppState.currentUserData.fullName = name;
    AppState.currentUserData.phone = phone;
    AppState.currentUserData.shopName = shopName;
    AppState.currentUserData.address = address;
    AppState.currentUserFullName = name;
    AppState.currentUserShopName = shopName;
    AppState.currentUserAddress = address;

    ['userName', 'welcomeName', 'dropdownName'].forEach(id => setText(id, name));

    renderProfile();
    logActivity('প্রোফাইল সম্পাদনা', `নাম: ${name}`);
    showToast('success', 'প্রোফাইল আপডেট হয়েছে');
    bootstrap.Modal.getInstance($('editProfileModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.sendPasswordReset = async () => {
  try {
    await sendPasswordResetEmail(auth, AppState.currentUser.email);
    showToast('success', 'রিসেট লিংক পাঠানো হয়েছে', AppState.currentUser.email);
    bootstrap.Modal.getInstance($('changePasswordModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
};

/* ==================== LOGIN HISTORY ==================== */
function loadLoginHistory() {
  if (!AppState.currentUser) return;
  const uid = AppState.impersonatingUser || AppState.currentUser.uid;

  const unsub = onValue(ref(db, 'users/' + uid + '/loginHistory'), (snap) => {
    const data = snap.val() ? Object.values(snap.val()) : [];
    data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    AppState.loginHistory = data;
    renderLoginHistory();
  }, (err) => { console.warn('loginHistory listener error:', err.code); });

  AppState.unsubscribers.push(unsub);
}

function renderLoginHistory() {
  const el = $('loginHistoryList');
  const cnt = $('loginHistoryCount');
  const modalEl = $('loginHistoryModalContent');

  if (cnt) cnt.textContent = AppState.loginHistory.length + ' বার';

  const html = AppState.loginHistory.length === 0
    ? `<div class="text-center text-muted py-3">
        <i class="fas fa-history fa-2x mb-2 opacity-50"></i>
        <p>কোনো লগইন নেই</p>
      </div>`
    : AppState.loginHistory.slice(0, MAX_LOGIN_HISTORY_DISPLAY).map(h => `
        <div class="login-history-item">
          <div class="lh-icon"><i class="fas fa-sign-in-alt"></i></div>
          <div class="lh-content">
            <div class="lh-title">${escapeHtml(h.action || 'লগইন')}</div>
            <div class="lh-meta">
              <span><i class="fas fa-calendar"></i> ${escapeHtml(h.date)} • ${escapeHtml(h.time)}</span>
              <span><i class="fas fa-globe"></i> ${escapeHtml(h.ip)}</span>
              <span><i class="fas fa-desktop"></i> ${escapeHtml(h.device)} • ${escapeHtml(h.browser)}</span>
            </div>
          </div>
        </div>
      `).join('');

  if (el) el.innerHTML = html;
  if (modalEl) modalEl.innerHTML = html;
}

/* ==================== USER DROPDOWN ==================== */
window.toggleUserDropdown = (e) => {
  e.stopPropagation();
  const dd = $('userDropdown');
  if (dd) dd.classList.toggle('show');
};

function closeUserDropdown() {
  const dd = $('userDropdown');
  if (dd) dd.classList.remove('show');
}

document.addEventListener('click', (e) => {
  const dd = $('userDropdown');
  if (dd && !dd.contains(e.target) && !e.target.closest('.user-menu-btn')) {
    dd.classList.remove('show');
  }
});

/* ==================== NOTIFICATION DOT ==================== */
function updateNotifDot() {
  const ls = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);
  const dc = AppState.customers.filter(c => parseFloat(c.due) > 0);
  const dot = $('notifDot');
  if (dot) dot.style.display = (ls.length + dc.length) > 0 ? 'block' : 'none';
}

/* ==================== LIVE PREVIEWS ==================== */
function updateAddProdLive() {
  const qty = parseFloat($('addProdQty').value) || 0;
  const buy = parseFloat($('addProdBuyPrice').value) || 0;
  const sell = parseFloat($('addProdSellPrice').value) || 0;
  const profit = sell - buy;

  setText('addProdProfit', '৳' + profit.toFixed(2));
  setText('addProdTotalProfit', '৳' + (profit * qty).toFixed(2));
}

function updatePurchaseLive() {
  const qty = parseFloat($('purchaseQty').value) || 0;
  const price = parseFloat($('purchasePrice').value) || 0;
  setText('purchaseTotalCost', (qty * price).toFixed(2));

  const cur = parseFloat($('purchaseCurrentStock').textContent) || 0;
  setText('purchaseNewStock', (cur + qty).toString());
}

window.previewPayDue = () => {
  const amount = parseFloat($('payAmount').value) || 0;
  const curDue = parseFloat($('payCurrentDue').value.replace(/[^\d.]/g, '')) || 0;
  const remaining = Math.max(0, curDue - amount);

  setText('payRemainingDue', '৳' + remaining.toFixed(2));

  const status = remaining <= 0
    ? '<span class="tag tag-success">সম্পূর্ণ পরিশোধ</span>'
    : '<span class="tag tag-warning">আংশিক পরিশোধ</span>';
  setHtml('payStatus', status);
};

window.quickExpense = (desc) => {
  const el = $('addExpDesc');
  if (el) el.value = desc;
};

window.openAddCustomerQuick = () => {
  new bootstrap.Modal($('quickAddCustomerModal')).show();
};

/* ==================== PRODUCT RENDERING ==================== */
window.renderProductCards = () => {
  const c = $('productCardsContainer');
  if (!c) return;

  const f = getFilteredInventory();
  setText('inventoryCardCount', `মোট ${f.length} টি পণ্য`);

  if (f.length === 0) {
    c.innerHTML = `<div class="col-12">
      <div class="empty-state">
        <i class="fas fa-boxes"></i>
        <h5>কোনো পণ্য নেই</h5>
        <p>নতুন পণ্য যোগ করুন</p>
        <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addProductModal">
          <i class="fas fa-plus"></i>নতুন পণ্য
        </button>
      </div>
    </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  f.forEach(p => {
    const low = parseInt(p.qty) <= LOW_STOCK_THRESHOLD;
    const badge = low
      ? '<span class="badge-stock low"><i class="fas fa-exclamation-circle"></i>স্টক কম</span>'
      : '<span class="badge-stock ok"><i class="fas fa-check-circle"></i>স্টক আছে</span>';

    const div = document.createElement('div');
    div.className = 'col-xl-3 col-md-4 col-sm-6';
    div.innerHTML = `<div class="product-card">
      <div class="product-icon"><i class="fas fa-box"></i></div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="product-price">৳${p.sellPrice}</div>
      ${badge}
      <span class="ms-1 small text-muted">স্টক: ${p.qty}</span>
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> ইডিট</button>
        <button class="action-btn sell" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i> বিক্রি</button>
        <button class="action-btn buy" onclick="purchaseProductModal('${p.id}')"><i class="fas fa-shopping-cart"></i> ক্রয়</button>
        <button class="action-btn del" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = '';
  c.appendChild(fragment);
};

window.renderInventoryTable = () => {
  const t = $('inventoryTableBody');
  if (!t) return;

  const f = getFilteredInventoryList();
  setText('inventoryTableCount', `মোট ${f.length} টি`);

  if (f.length === 0) {
    t.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">কোনো পণ্য নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  f.forEach((p, i) => {
    const ppu = parseFloat(p.sellPrice) - parseFloat(p.buyPrice);
    const tp = ppu * parseInt(p.qty);
    const badge = parseInt(p.qty) <= LOW_STOCK_THRESHOLD
      ? '<span class="tag tag-danger">স্টক কম</span>'
      : '<span class="tag tag-success">স্টক আছে</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${p.qty}</td>
      <td>৳${p.buyPrice}</td>
      <td>৳${p.sellPrice}</td>
      <td class="text-success">৳${ppu.toFixed(2)}</td>
      <td class="text-success fw-bold">৳${tp.toFixed(2)}</td>
      <td>${badge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </td>
    `;
    fragment.appendChild(tr);
  });
  t.innerHTML = '';
  t.appendChild(fragment);
};

function getFilteredInventory() {
  const q = ($('inventorySearchFilter')?.value || '').toLowerCase();
  const sf = $('inventoryStockFilter')?.value || '';

  return AppState.inventory.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (sf === 'low' && parseInt(i.qty) > LOW_STOCK_THRESHOLD) return false;
    if (sf === 'ok' && parseInt(i.qty) <= LOW_STOCK_THRESHOLD) return false;
    return true;
  });
}

function getFilteredInventoryList() {
  const q = ($('inventoryListSearchFilter')?.value || '').toLowerCase();
  return AppState.inventory.filter(i => !q || i.name.toLowerCase().includes(q));
}

window.filterInventory = () => renderProductCards();
window.filterInventoryList = () => renderInventoryTable();

/* ==================== PRODUCT CRUD ==================== */
window.editProduct = (id) => {
  const p = AppState.inventory.find(i => i.id === id);
  if (!p) return;

  AppState.editingProductId = id;
  $('editProdName').value = p.name;
  $('editProdQty').value = p.qty;
  $('editProdBuyPrice').value = p.buyPrice;
  $('editProdSellPrice').value = p.sellPrice;
  new bootstrap.Modal($('editProductModal')).show();
};

window.updateInventory = async () => {
  if (!AppState.editingProductId) return;

  const name = $('editProdName').value.trim();
  const qty = $('editProdQty').value;
  const buy = $('editProdBuyPrice').value;
  const sell = $('editProdSellPrice').value;

  if (!name || qty === '' || buy === '' || sell === '') {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/inventory/' + AppState.editingProductId), {
      name, qty, buyPrice: buy, sellPrice: sell
    });
    logActivity('পণ্য সম্পাদনা', `${name} আপডেট`);
    showToast('success', 'পণ্য আপডেট হয়েছে', name);
    bootstrap.Modal.getInstance($('editProductModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.sellProduct = (id) => {
  const p = AppState.inventory.find(i => i.id === id);
  if (!p) return;

  showSection('sales');
  AppState.lastSelectedProductId = id;
  $('productSearch').value = p.name;
  $('productQty').value = '1';
  showToast('info', 'পণ্য নির্বাচিত', p.name);
};

window.purchaseProductModal = (id) => {
  const p = AppState.inventory.find(i => i.id === id);
  if (!p) return;

  $('purchaseProdName').value = p.name;
  $('purchaseQty').value = '1';
  $('purchasePrice').value = p.buyPrice;
  setText('purchaseCurrentStock', p.qty);
  setText('purchaseNewStock', (parseInt(p.qty) + 1).toString());
  setText('purchaseTotalCost', parseFloat(p.buyPrice).toFixed(2));

  new bootstrap.Modal($('purchaseProductModal')).show();
};

window.purchaseProduct = async () => {
  const name = $('purchaseProdName').value;
  const qty = parseInt($('purchaseQty').value);
  const price = parseFloat($('purchasePrice').value);

  if (!qty || qty <= 0) {
    showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন');
    return;
  }
  if (!price || price < 0) {
    showToast('error', 'ভুল মূল্য', 'সঠিক মূল্য দিন');
    return;
  }

  const p = AppState.inventory.find(i => i.name === name);
  if (!p) return;

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const newQty = parseInt(p.qty) + qty;

    await update(ref(db, 'users/' + uid + '/inventory/' + p.id), {
      qty: newQty,
      buyPrice: price
    });

    logActivity('পণ্য ক্রয়', `${name} - ${qty} ইউনিট @ ৳${price}`, qty * price);
    showToast('success', 'ক্রয় সম্পন্ন!', `নতুন স্টক: ${newQty}`);
    bootstrap.Modal.getInstance($('purchaseProductModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

/* ==================== CUSTOMER ==================== */
window.renderCustomerCards = () => {
  const c = $('customerCardsContainer');
  if (!c) return;

  const f = getFilteredCustomers();
  setText('customerCount', `মোট ${f.length} জন`);

  if (f.length === 0) {
    c.innerHTML = `<div class="col-12">
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <h5>কোনো কাস্টমার নেই</h5>
        <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addCustomerModal">
          <i class="fas fa-plus"></i>নতুন কাস্টমার
        </button>
      </div>
    </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  f.forEach(cust => {
    const hasDue = parseFloat(cust.due) > 0;
    const badge = hasDue
      ? `<span class="badge-stock low"><i class="fas fa-exclamation-circle"></i>বাকি: ৳${cust.due}</span>`
      : `<span class="badge-stock ok"><i class="fas fa-check-circle"></i>বাকি নেই</span>`;

    const div = document.createElement('div');
    div.className = 'col-xl-3 col-md-4 col-sm-6';
    div.innerHTML = `<div class="customer-card">
      <div class="customer-icon"><i class="fas fa-user"></i></div>
      <div class="customer-name">${escapeHtml(cust.name)}</div>
      <div class="customer-phone"><i class="fas fa-phone me-1"></i>${escapeHtml(cust.phone || 'নাই')}</div>
      ${badge}
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editCustomer('${cust.id}')"><i class="fas fa-edit"></i> ইডিট</button>
        <button class="action-btn sell" onclick="sellToCustomer('${cust.id}')"><i class="fas fa-cart-plus"></i> বিক্রি</button>
        <button class="action-btn pay" onclick="payDueModal('${cust.id}')"><i class="fas fa-hand-holding-usd"></i> পরিশোধ</button>
        <button class="action-btn del" onclick="deleteItem('customers','${cust.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = '';
  c.appendChild(fragment);
  renderCustomerHistoryList();
};

function getFilteredCustomers() {
  const q = ($('customerSearchFilter')?.value || '').toLowerCase();
  const df = $('customerDueFilter')?.value || '';

  return AppState.customers.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (df === 'due' && parseFloat(c.due) <= 0) return false;
    if (df === 'clear' && parseFloat(c.due) > 0) return false;
    return true;
  });
}

window.filterCustomers = () => renderCustomerCards();

window.renderCustomerHistoryList = () => {
  const t = $('customerHistoryTableBody');
  if (!t) return;

  const q = ($('custHistorySearch')?.value || '').toLowerCase();
  const from = $('custHistoryDateFrom')?.value || '';
  const to = $('custHistoryDateTo')?.value || '';

  let filtered = [...AppState.customers];
  if (q) filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
  if (from) filtered = filtered.filter(c => (c.createdAt || '').slice(0, 10) >= from);
  if (to) filtered = filtered.filter(c => (c.createdAt || '').slice(0, 10) <= to);

  filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (filtered.length === 0) {
    t.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">কোনো কাস্টমার ইতিহাস নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((c, i) => {
    const created = c.createdAt ? new Date(c.createdAt) : null;
    const date = created ? getDateBn(created) : '—';
    const time = created ? getTimeBn(created) : '—';
    const hasDue = parseFloat(c.due) > 0;
    const statusBadge = hasDue
      ? `<span class="tag tag-warning">বাকি: ৳${c.due}</span>`
      : `<span class="tag tag-success">পরিষ্কার</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.phone || '—')}</td>
      <td>৳${c.due || 0}</td>
      <td><i class="fas fa-calendar text-primary me-1"></i>${date}</td>
      <td><i class="fas fa-clock text-info me-1"></i>${time}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCustomer('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="sellToCustomer('${c.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn btn-sm btn-outline-warning" onclick="payDueModal('${c.id}')"><i class="fas fa-hand-holding-usd"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('customers','${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    `;
    fragment.appendChild(tr);
  });
  t.innerHTML = '';
  t.appendChild(fragment);
};

window.resetCustomerHistoryFilters = () => {
  ['custHistorySearch', 'custHistoryDateFrom', 'custHistoryDateTo'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  renderCustomerHistoryList();
};

window.editCustomer = (id) => {
  const c = AppState.customers.find(i => i.id === id);
  if (!c) return;

  AppState.editingCustomerId = id;
  $('editCustName').value = c.name;
  $('editCustPhone').value = c.phone || '';
  new bootstrap.Modal($('editCustomerModal')).show();
};

window.updateCustomer = async () => {
  if (!AppState.editingCustomerId) return;

  const name = $('editCustName').value.trim();
  const phone = $('editCustPhone').value.trim();

  if (!name) {
    showToast('warning', 'সতর্কতা', 'নাম লিখুন');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/customers/' + AppState.editingCustomerId), { name, phone });
    logActivity('কাস্টমার সম্পাদনা', `${name} আপডেট`);
    showToast('success', 'কাস্টমার আপডেট হয়েছে', name);
    bootstrap.Modal.getInstance($('editCustomerModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.sellToCustomer = (id) => {
  const c = AppState.customers.find(i => i.id === id);
  if (!c) return;

  showSection('sales');
  $('customerSelect').value = id;
  updateCustomerDue();
  showToast('info', 'কাস্টমার নির্বাচিত', c.name);
};

window.payDueModal = (id) => {
  const c = AppState.customers.find(i => i.id === id);
  if (!c) return;

  AppState.payingCustomerId = id;
  $('payCustName').value = c.name;
  $('payCurrentDue').value = `৳${c.due || 0}`;
  $('payAmount').value = c.due || 0;
  previewPayDue();
  new bootstrap.Modal($('payDueModal')).show();
};

window.makePayment = async () => {
  if (!AppState.payingCustomerId) return;

  const amount = parseFloat($('payAmount').value);
  const c = AppState.customers.find(i => i.id === AppState.payingCustomerId);

  if (!amount || amount <= 0) {
    showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন');
    return;
  }
  if (amount > (parseFloat(c.due) || 0)) {
    showToast('warning', 'বেশি পরিমাণ', 'বাকির চেয়ে বেশি দেওয়া যাবে না');
    return;
  }

  const newDue = Math.max(0, (parseFloat(c.due) || 0) - amount);
  showLoader(true);

  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/customers/' + AppState.payingCustomerId), { due: newDue });
    logActivity('বাকি পরিশোধ', `${c.name} কে ৳${amount} পরিশোধ`, amount);
    showToast('success', 'পরিশোধ সম্পন্ন!', `বাকি এখন: ৳${newDue}`);
    bootstrap.Modal.getInstance($('payDueModal')).hide();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.quickAddCustomer = async () => {
  const name = $('quickCustName').value.trim();
  const phone = $('quickCustPhone').value.trim();

  if (!name || !phone) {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/customers'));
    await set(r, {
      id: r.key,
      name, phone,
      due: 0,
      createdAt: new Date().toISOString()
    });

    logActivity('নতুন কাস্টমার', `${name} - ${phone}`, 0);
    showLoader(false);
    bootstrap.Modal.getInstance($('quickAddCustomerModal')).hide();
    $('quickCustName').value = '';
    $('quickCustPhone').value = '';
    showToast('success', 'কাস্টমার যোগ হয়েছে', name);

    setTimeout(() => {
      $('customerSelect').value = r.key;
      updateCustomerDue();
    }, 400);
  } catch (e) {
    showLoader(false);
    showToast('error', 'ব্যর্থ', e.message);
  }
};

/* ==================== EXPENSES ==================== */
window.renderExpenses = (exp) => {
  const t = $('expenseTableBody');
  if (!t) return;

  setText('expenseCount', `মোট ${exp.length} টি`);

  if (exp.length === 0) {
    t.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">কোনো খরচ নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  exp.slice().reverse().forEach(e => {
    const d = e.date ? new Date(e.date) : new Date();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(e.title)}</strong></td>
      <td class="text-danger fw-bold">৳${e.amount}</td>
      <td>${getDateBn(d)}</td>
      <td>${escapeHtml(e.time || '—')}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('expenses','${e.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    fragment.appendChild(tr);
  });
  t.innerHTML = '';
  t.appendChild(fragment);
};

window.filterExpenseList = () => {
  let exp = AppState.allExpensesCache;
  const q = ($('expenseSearchFilter')?.value || '').toLowerCase();
  const from = $('expenseDateFrom')?.value;
  const to = $('expenseDateTo')?.value;

  if (q) exp = exp.filter(e => e.title.toLowerCase().includes(q));
  if (from) exp = exp.filter(e => e.date >= from);
  if (to) exp = exp.filter(e => e.date <= to);

  renderExpenses(exp);
};

window.resetExpenseFilters = () => {
  ['expenseSearchFilter', 'expenseDateFrom', 'expenseDateTo'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  renderExpenses(AppState.allExpensesCache);
};

window.renderExpenseChart = (exp) => {
  const ctx = $('expenseChart')?.getContext('2d');
  if (!ctx) return;

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    last7.push({
      label: ds.slice(5),
      amount: exp.filter(e => e.date === ds).reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    });
  }

  if (AppState.expenseChart) AppState.expenseChart.destroy();

  AppState.expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last7.map(d => d.label),
      datasets: [{
        label: 'খরচ',
        data: last7.map(d => d.amount),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  const today = new Date().toISOString().split('T')[0];
  const tm = today.slice(0, 7);

  setText('todayExpense', '৳' + exp.filter(e => e.date === today).reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2));
  setText('monthExpense', '৳' + exp.filter(e => e.date && e.date.startsWith(tm)).reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2));
  setText('totalExpenseQuick', '৳' + exp.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2));
};

/* ==================== SALES LIST ==================== */
window.renderSalesList = (sales) => {
  const t = $('salesTableBody');
  if (!t) return;

  setText('salesListCount', `মোট ${sales.length} টি`);

  if (sales.length === 0) {
    t.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">কোনো বিক্রয় নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  sales.slice().reverse().forEach(s => {
    const d = s.date ? new Date(s.date) : new Date();
    const cls = parseFloat(s.due) > 0 ? 'text-danger' : 'text-success';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(s.invoiceNo || 'N/A')}</strong></td>
      <td>${escapeHtml(s.customerName || 'সাধারণ')}</td>
      <td>${escapeHtml(s.name || '')}</td>
      <td class="fw-bold">৳${s.totalAmount}</td>
      <td class="text-success">৳${s.paid || 0}</td>
      <td class="${cls} fw-bold">৳${s.due || 0}</td>
      <td>${getDateBn(d)}<br><small class="text-muted"><i class="fas fa-clock me-1"></i>${escapeHtml(s.time || '—')}</small></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
        <button class="btn btn-sm btn-outline-info" onclick="shareInvoice('${s.id}')"><i class="fas fa-share-alt"></i></button>
      </td>
    `;
    fragment.appendChild(tr);
  });
  t.innerHTML = '';
  t.appendChild(fragment);
};

window.filterSalesList = () => {
  let sales = AppState.allSalesCache;
  const q = ($('salesSearchFilter')?.value || '').toLowerCase();
  const from = $('salesDateFrom')?.value;
  const to = $('salesDateTo')?.value;
  const st = $('salesStatusFilter')?.value;

  if (q) sales = sales.filter(s => (s.invoiceNo || '').toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q));
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);
  if (st === 'paid') sales = sales.filter(s => parseFloat(s.due) <= 0);
  if (st === 'due') sales = sales.filter(s => parseFloat(s.due) > 0);

  renderSalesList(sales);
};

window.resetSalesFilters = () => {
  ['salesSearchFilter', 'salesDateFrom', 'salesDateTo', 'salesStatusFilter'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  renderSalesList(AppState.allSalesCache);
};

/* ==================== INVOICE ==================== */
window.printInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;

  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Invoice ${escapeHtml(s.invoiceNo)}</title><style>
    body{font-family:Arial;padding:20px}
    .header{text-align:center;border-bottom:2px solid #6366f1;padding-bottom:20px;margin-bottom:20px}
    .header h1{color:#6366f1}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{padding:10px;border:1px solid #ddd;text-align:left}
    th{background:#6366f1;color:#fff}
    .print-btn{display:block;margin:20px auto;padding:10px 30px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <div class="header"><h1>HesabKhata Enterprise</h1><p>${escapeHtml(AppState.currentUserShopName)}</p><p>${escapeHtml(AppState.currentUserAddress)}</p></div>
  <p><strong>ইনভয়েস:</strong> ${escapeHtml(s.invoiceNo)} | <strong>তারিখ:</strong> ${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</p>
  <p><strong>কাস্টমার:</strong> ${escapeHtml(s.customerName)}</p>
  <table><tr><th>পণ্য</th><th>মোট</th></tr><tr><td>${escapeHtml(s.name)}</td><td>৳${s.totalAmount}</td></tr></table>
  <p><strong>পরিশোধিত:</strong> ৳${s.paid} | <strong>বাকি:</strong> ৳${s.due}</p>
  <button class="print-btn" onclick="window.print()">প্রিন্ট করুন</button></body></html>`);
  w.document.close();
};

window.downloadInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;

  const c = `HesabKhata Enterprise
ইনভয়েস: ${s.invoiceNo}
তারিখ: ${s.date} ${s.time || ''}
কাস্টমার: ${s.customerName}
পণ্য: ${s.name}
মোট: ৳${s.totalAmount}
পরিশোধিত: ৳${s.paid}
বাকি: ৳${s.due}`;

  downloadFile(c, `Invoice-${s.invoiceNo}.txt`, 'text/plain');
  showToast('success', 'ডাউনলোড হয়েছে', `Invoice-${s.invoiceNo}.txt`);
};

window.shareInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;

  const t = `📄 HesabKhata Enterprise
ইনভয়েস: ${s.invoiceNo}
তারিখ: ${s.date} ${s.time || ''}
কাস্টমার: ${s.customerName}
মোট: ৳${s.totalAmount}
বাকি: ৳${s.due}`;

  if (navigator.share) {
    navigator.share({ title: 'Invoice', text: t }).catch(() => {});
  } else {
    navigator.clipboard.writeText(t).then(() => showToast('success', 'কপি হয়েছে!'));
  }
};

/* ==================== EXPORTS ==================== */
window.exportSales = () => {
  let c = 'Invoice,Customer,Products,Total,Paid,Due,Date,Time\n';
  AppState.allSalesCache.forEach(s => {
    c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date},${s.time || ''}\n`;
  });
  downloadFile(c, 'sales.csv');
  showToast('success', 'এক্সপোর্ট হয়েছে', 'sales.csv');
};

window.exportInventory = () => {
  let c = 'Name,Qty,BuyPrice,SellPrice,Profit\n';
  AppState.inventory.forEach(i => {
    c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice},${(i.sellPrice - i.buyPrice).toFixed(2)}\n`;
  });
  downloadFile(c, 'inventory.csv');
  showToast('success', 'এক্সপোর্ট হয়েছে', 'inventory.csv');
};

window.exportExpenses = () => {
  let c = 'Description,Amount,Date,Time\n';
  AppState.allExpensesCache.forEach(e => {
    c += `${e.title},${e.amount},${e.date},${e.time || ''}\n`;
  });
  downloadFile(c, 'expenses.csv');
  showToast('success', 'এক্সপোর্ট হয়েছে', 'expenses.csv');
};

window.exportMasterList = () => {
  const type = $('masterDataType').value;
  let c = '';

  if (type === 'all' || type === 'sales') {
    c += '\n=== SALES ===\nInvoice,Customer,Products,Total,Paid,Due,Date,Time\n';
    AppState.allSalesCache.forEach(s => {
      c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date},${s.time || ''}\n`;
    });
  }
  if (type === 'all' || type === 'inventory') {
    c += '\n=== INVENTORY ===\nName,Qty,Buy,Sell\n';
    AppState.inventory.forEach(i => {
      c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice}\n`;
    });
  }
  if (type === 'all' || type === 'customers') {
    c += '\n=== CUSTOMERS ===\nName,Phone,Due,CreatedDate,CreatedTime\n';
    AppState.customers.forEach(x => {
      const cd = x.createdAt ? new Date(x.createdAt) : null;
      c += `${x.name},${x.phone},${x.due},${cd ? getDateBn(cd) : ''},${cd ? getTimeBn(cd) : ''}\n`;
    });
  }
  if (type === 'all' || type === 'expenses') {
    c += '\n=== EXPENSES ===\nDesc,Amount,Date,Time\n';
    AppState.allExpensesCache.forEach(e => {
      c += `${e.title},${e.amount},${e.date},${e.time || ''}\n`;
    });
  }

  downloadFile(c, 'master-list.csv');
  showToast('success', 'এক্সপোর্ট হয়েছে', 'master-list.csv');
};

/* ==================== BACKUP / RESTORE ==================== */
window.exportAllData = () => {
  const backup = {
    exportedAt: new Date().toISOString(),
    user: {
      email: AppState.currentUser.email,
      uid: AppState.currentUser.uid,
      fullName: AppState.currentUserFullName,
      shopName: AppState.currentUserShopName,
      address: AppState.currentUserAddress,
      role: AppState.currentUserRole
    },
    inventory: AppState.inventory,
    customers: AppState.customers,
    sales: AppState.allSalesCache,
    expenses: AppState.allExpensesCache,
    activityLog: AppState.activityLog,
    loginHistory: AppState.loginHistory,
    settings: AppState.userSettings
  };

  downloadFile(
    JSON.stringify(backup, null, 2),
    `hesabkhata-backup-${new Date().toISOString().split('T')[0]}.json`,
    'application/json'
  );
  showToast('success', 'ব্যাকআপ ডাউনলোড হয়েছে');
};

window.exportAllCSV = () => {
  let c = `=== HESABKHATA BACKUP ===\nDate: ${new Date().toLocaleString('bn-BD')}\nUser: ${AppState.currentUser.email}\n\n`;

  c += '=== INVENTORY ===\nName,Qty,Buy,Sell\n';
  AppState.inventory.forEach(i => {
    c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice}\n`;
  });

  c += '\n=== CUSTOMERS ===\nName,Phone,Due\n';
  AppState.customers.forEach(x => {
    c += `${x.name},${x.phone},${x.due}\n`;
  });

  c += '\n=== SALES ===\nInvoice,Customer,Products,Total,Paid,Due,Date,Time\n';
  AppState.allSalesCache.forEach(s => {
    c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date},${s.time || ''}\n`;
  });

  c += '\n=== EXPENSES ===\nDesc,Amount,Date,Time\n';
  AppState.allExpensesCache.forEach(e => {
    c += `${e.title},${e.amount},${e.date},${e.time || ''}\n`;
  });

  downloadFile(c, `hesabkhata-full-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('success', 'CSV ডাউনলোড হয়েছে');
};

window.importData = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      const ok = await showConfirm(
        'ডেটা পুনরুদ্ধার করবেন?',
        'বর্তমান ডেটা এই ব্যাকআপ দিয়ে রিপ্লেস হবে।',
        { type: 'warning' }
      );
      if (!ok) return;

      showLoader(true, 'ডেটা পুনরুদ্ধার হচ্ছে...');
      const uid = AppState.impersonatingUser || AppState.currentUser.uid;

      if (data.inventory) {
        for (const item of data.inventory) {
          await set(ref(db, 'users/' + uid + '/inventory/' + item.id), item);
        }
      }
      if (data.customers) {
        for (const item of data.customers) {
          await set(ref(db, 'users/' + uid + '/customers/' + item.id), item);
        }
      }
      if (data.sales) {
        for (const item of data.sales) {
          await set(ref(db, 'users/' + uid + '/sales/' + item.id), item);
        }
      }
      if (data.expenses) {
        for (const item of data.expenses) {
          await set(ref(db, 'users/' + uid + '/expenses/' + item.id), item);
        }
      }

      logActivity('ডেটা ইমপোর্ট', 'ব্যাকআপ থেকে পুনরুদ্ধার');
      showToast('success', 'ডেটা পুনরুদ্ধার সফল');
    } catch (err) {
      showToast('error', 'ব্যর্থ', 'ফাইল সঠিক নয়');
    }
    showLoader(false);
    e.target.value = '';
  };
  reader.readAsText(file);
};

window.confirmDeleteAll = async () => {
  const ok = await showConfirm(
    'সব ডেটা মুছবেন?',
    'সব পণ্য, কাস্টমার, বিক্রয়, খরচ মুছে যাবে!',
    { type: 'danger', danger: true }
  );
  if (!ok) return;

  showLoader(true, 'ডেটা মুছে ফেলা হচ্ছে...');
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await remove(ref(db, 'users/' + uid + '/inventory'));
    await remove(ref(db, 'users/' + uid + '/customers'));
    await remove(ref(db, 'users/' + uid + '/sales'));
    await remove(ref(db, 'users/' + uid + '/expenses'));
    logActivity('ডেটা ডিলিট', 'সব ডেটা মুছে ফেলা হয়েছে');
    showToast('success', 'সব ডেটা মুছে ফেলা হয়েছে');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

/* ==================== CRUD ==================== */
window.addInventory = async () => {
  const n = $('addProdName').value.trim();
  const q = $('addProdQty').value;
  const b = $('addProdBuyPrice').value;
  const s = $('addProdSellPrice').value;

  if (!n || q === '' || b === '' || s === '') {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }
  if (parseFloat(q) < 0 || parseFloat(b) < 0 || parseFloat(s) < 0) {
    showToast('error', 'ভুল মান', 'নেগেটিভ মান দেওয়া যাবে না');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/inventory'));
    await set(r, {
      id: r.key,
      name: n, qty: q, buyPrice: b, sellPrice: s,
      createdAt: new Date().toISOString()
    });

    logActivity('নতুন পণ্য', `${n} যোগ (স্টক: ${q})`);
    bootstrap.Modal.getInstance($('addProductModal')).hide();
    showToast('success', 'পণ্য যোগ হয়েছে', n);

    ['addProdName', 'addProdQty', 'addProdBuyPrice', 'addProdSellPrice'].forEach(id => {
      $(id).value = '';
    });
    updateAddProdLive();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.addCustomer = async () => {
  const n = $('addCustName').value.trim();
  const p = $('addCustPhone').value.trim();
  const d = $('addCustDue').value || 0;

  if (!n || !p) {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/customers'));
    await set(r, {
      id: r.key,
      name: n, phone: p,
      due: parseFloat(d),
      createdAt: new Date().toISOString()
    });

    logActivity('নতুন কাস্টমার', `${n} - ${p} (প্রাথমিক বাকি: ৳${d})`, parseFloat(d));
    bootstrap.Modal.getInstance($('addCustomerModal')).hide();
    showToast('success', 'কাস্টমার যোগ হয়েছে', n);

    ['addCustName', 'addCustPhone', 'addCustDue'].forEach(id => {
      $(id).value = '';
    });
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.addExpense = async () => {
  const t = $('addExpDesc').value.trim();
  const a = $('addExpAmt').value;

  if (!t || !a) {
    showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন');
    return;
  }
  if (parseFloat(a) <= 0) {
    showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন');
    return;
  }

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/expenses'));
    const now = new Date();

    await set(r, {
      id: r.key,
      title: t,
      amount: a,
      date: now.toISOString().split('T')[0],
      time: getTimeBn(now),
      createdAt: now.toISOString()
    });

    logActivity('নতুন খরচ', `${t}`, parseFloat(a));
    bootstrap.Modal.getInstance($('addExpenseModal')).hide();
    showToast('success', 'খরচ যোগ হয়েছে', `${t} - ৳${a}`);

    ['addExpDesc', 'addExpAmt'].forEach(id => {
      $(id).value = '';
    });
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.deleteItem = async (col, id) => {
  const ok = await showConfirm('নিশ্চিত?', 'এই আইটেমটি মুছে ফেলা হবে।', { type: 'danger', danger: true });
  if (!ok) return;

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await remove(ref(db, 'users/' + uid + '/' + col + '/' + id));
    logActivity('ডিলিট', `${col} আইটেম মুছে ফেলা হয়েছে`);
    showToast('success', 'মুছে ফেলা হয়েছে');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

/* ==================== DASHBOARD ==================== */
window.renderDashboard = (sales) => {
  const today = new Date().toISOString().split('T')[0];

  setText('totalSales', sales.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0).toFixed(2));
  setText('todaySales', sales.filter(i => i.date === today).reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0).toFixed(2));
  setText('totalDue', sales.reduce((s, i) => s + parseFloat(i.due || 0), 0).toFixed(2));
  setText('repDue', $('totalDue')?.textContent || '0');

  updateChartPeriod(7);
  setText('repSales', $('totalSales')?.textContent || '0');
};

window.updateChartPeriod = (days, btn) => {
  if (btn) {
    btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  const labels = [], data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    labels.push(days === 7 ? ds.slice(5) : ds);
    data.push(AppState.allSalesCache.filter(s => s.date === ds).reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0));
  }

  if (AppState.myChart) AppState.myChart.destroy();

  const ctx = $('salesChart')?.getContext('2d');
  if (!ctx) return;

  AppState.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'বিক্রয়',
        data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
};

window.renderInvoices = (sales) => {
  const c = $('invoiceCardsContainer');
  if (!c) return;

  if (sales.length === 0) {
    c.innerHTML = `<div class="col-12">
      <div class="empty-state">
        <i class="fas fa-file-invoice-dollar"></i>
        <h5>কোনো ইনভয়েস নেই</h5>
      </div>
    </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  sales.slice().reverse().slice(0, 30).forEach(s => {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4';
    div.innerHTML = `<div class="card-premium p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div class="fw-bold text-primary">${escapeHtml(s.invoiceNo)}</div>
          <small class="text-muted"><i class="fas fa-calendar me-1"></i>${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</small>
        </div>
        <span class="tag ${parseFloat(s.due) > 0 ? 'tag-warning' : 'tag-success'}">
          ${parseFloat(s.due) > 0 ? 'বাকি' : 'পরিশোধিত'}
        </span>
      </div>
      <div class="mb-2"><small class="text-muted">কাস্টমার:</small> <strong>${escapeHtml(s.customerName || 'সাধারণ')}</strong></div>
      <div class="d-flex justify-content-between align-items-center">
        <div><small class="text-muted">মোট</small><div class="fw-bold text-primary">৳${s.totalAmount}</div></div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
          <button class="btn btn-sm btn-outline-info" onclick="shareInvoice('${s.id}')"><i class="fas fa-share-alt"></i></button>
        </div>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = '';
  c.appendChild(fragment);
};

window.filterInvoices = () => {
  const q = ($('invoiceSearchFilter')?.value || '').toLowerCase();
  let s = AppState.allSalesCache;
  if (q) s = s.filter(x => (x.invoiceNo || '').toLowerCase().includes(q) || (x.customerName || '').toLowerCase().includes(q));
  renderInvoices(s);
};

window.updateTotalExpense = (exp) => {
  const totalExpense = exp.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  setText('totalExpense', totalExpense.toFixed(2));
  setText('repExpense', totalExpense.toFixed(2));

  const ts = parseFloat($('totalSales')?.textContent || '0');
  const net = ts - totalExpense;
  setText('repProfit', net.toFixed(2));
  setText('netProfitQuick', '৳' + net.toFixed(2));
};

window.renderCustomerSelect = () => {
  const s = $('customerSelect');
  if (!s) return;

  const curVal = s.value;
  s.innerHTML = '<option value="">সাধারণ কাস্টমার (নগদ)</option>';

  AppState.customers.forEach(c => {
    s.innerHTML += `<option value="${c.id}" data-due="${c.due || 0}">${escapeHtml(c.name)} (বাকি:৳${c.due || 0})</option>`;
  });

  if (curVal) s.value = curVal;
  updateCustomerDue();
};

window.updateCustomerDue = () => {
  const s = $('customerSelect');
  if (!s) return;

  if (s.selectedIndex > 0) {
    const due = parseFloat(s.options[s.selectedIndex].getAttribute('data-due')) || 0;
    AppState.currentCustomerDue = due;
    AppState.currentCustomerId = s.value;
    setHtml('customerDueBadge', `<i class="fas fa-exclamation-circle me-1"></i>বাকি: ৳${due}`);
  } else {
    AppState.currentCustomerDue = 0;
    AppState.currentCustomerId = null;
    setHtml('customerDueBadge', `<i class="fas fa-check-circle me-1"></i>নগদ বিক্রয়`);
  }
  calculateCartTotal();
};

window.selectProduct = (id) => {
  AppState.lastSelectedProductId = id;
  const item = AppState.inventory.find(i => i.id === id);
  if (item) {
    $('productSearch').value = item.name;
    $('productSearchResults').innerHTML = '';
    showToast('info', 'পণ্য নির্বাচিত', item.name);
  }
};

/* ==================== CART ==================== */
window.addToCartFromSearch = () => {
  const id = AppState.lastSelectedProductId;
  if (!id) {
    showToast('warning', 'সতর্কতা', 'পণ্য নির্বাচন করুন');
    return;
  }

  const item = AppState.inventory.find(i => i.id === id);
  if (!item) return;

  const qty = parseInt($('productQty').value) || 1;
  if (parseInt(item.qty) < qty) {
    showToast('error', 'স্টক নেই', `মাত্র ${item.qty}টি আছে`);
    return;
  }

  const idx = AppState.cart.findIndex(i => i.id === id);
  if (idx > -1) {
    AppState.cart[idx].qty += qty;
  } else {
    AppState.cart.push({
      id: item.id,
      name: item.name,
      price: parseFloat(item.sellPrice),
      qty
    });
  }

  renderCart();
  AppState.lastSelectedProductId = null;
  $('productSearch').value = '';
  $('productSearchResults').innerHTML = '';
  $('productQty').value = '1';
  showToast('success', 'কার্টে যোগ', `${item.name} × ${qty}`);
};

window.removeFromCart = (i) => {
  AppState.cart.splice(i, 1);
  renderCart();
};

window.clearCart = async () => {
  const ok = await showConfirm('কার্ট খালি করবেন?', 'সব পণ্য কার্ট থেকে মুছে যাবে।', { type: 'warning' });
  if (ok) {
    AppState.cart = [];
    renderCart();
    showToast('info', 'কার্ট খালি');
  }
};

window.renderCart = () => {
  const c = $('cartItemsList');
  if (!c) return;

  c.innerHTML = '';
  setText('cartCountBadge', AppState.cart.length + ' আইটেম');

  if (AppState.cart.length === 0) {
    c.innerHTML = `<div class="empty-state py-4">
      <i class="fas fa-shopping-cart"></i>
      <p class="mb-0">কার্ট খালি — পণ্য যোগ করুন</p>
    </div>`;
    setText('cartTotal', '0.00');
    setText('cartSubtotal', '0.00');
    setText('cartDiscount', '0.00');
    setText('duePreview', '৳0.00');
    $('completeSaleBtn').disabled = true;
    return;
  }

  let subtotal = 0;
  const fragment = document.createDocumentFragment();

  AppState.cart.forEach((item, i) => {
    const tot = item.price * item.qty;
    subtotal += tot;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="small text-muted">৳${item.price} × ${item.qty}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="item-qty">${item.qty}</span>
        <span class="fw-bold">৳${tot.toFixed(2)}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${i})"><i class="fas fa-times"></i></button>
      </div>
    `;
    fragment.appendChild(div);
  });
  c.appendChild(fragment);

  setText('cartSubtotal', subtotal.toFixed(2));
  calculateCartTotal();
};

window.calculateCartTotal = () => {
  const subtotal = parseFloat($('cartSubtotal')?.textContent) || 0;
  const discount = parseFloat($('discountInput')?.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const paid = parseFloat($('paidAmount')?.value) || 0;
  const change = Math.max(0, paid - total);
  const due = Math.max(0, total - paid);

  setText('cartDiscount', discount.toFixed(2));
  setText('cartTotal', total.toFixed(2));
  setText('changeAmount', '৳' + change.toFixed(2));
  setText('duePreview', '৳' + due.toFixed(2));

  const cc = $('cartLiveCard');
  if (cc) cc.classList.toggle('active', AppState.cart.length > 0);

  const btn = $('completeSaleBtn');
  if (btn) btn.disabled = AppState.cart.length === 0;

  const s1 = $('step1');
  const s2 = $('step2');
  if (s1) s1.classList.toggle('done', AppState.cart.length > 0);
  if (s2) s2.classList.toggle('active', AppState.cart.length > 0);
};

window.completeSale = async () => {
  if (AppState.cart.length === 0) {
    showToast('warning', 'সতর্কতা', 'কার্ট খালি');
    return;
  }

  const s = $('customerSelect');
  const cId = s.value;
  const cDue = parseFloat(s.options[s.selectedIndex]?.getAttribute('data-due')) || 0;
  const paid = parseFloat($('paidAmount').value) || 0;
  const discount = parseFloat($('discountInput').value) || 0;
  const subtotal = parseFloat($('cartSubtotal').textContent);
  const total = Math.max(0, subtotal - discount);
  const due = Math.max(0, total - paid);

  if (due > 0 && !cId) {
    showToast('warning', 'সতর্কতা', 'বাকিতে বিক্রি করতে কাস্টমার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'বিক্রয় নিশ্চিত?',
    `মোট: ৳${total.toFixed(2)} | পরিশোধিত: ৳${paid.toFixed(2)} | বাকি: ৳${due.toFixed(2)}`,
    { type: 'success', okText: 'হ্যাঁ, সম্পন্ন' }
  );
  if (!ok) return;

  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/sales'));
    const cName = s.options[s.selectedIndex]?.text || 'সাধারণ কাস্টমার';
    const now = new Date();
    const invoiceNo = 'INV-' + Date.now().toString().slice(-6);

    await set(r, {
      id: r.key,
      invoiceNo,
      name: AppState.cart.map(i => i.name).join(', '),
      qty: AppState.cart.reduce((a, b) => a + b.qty, 0),
      totalAmount: total,
      paid,
      due,
      customerId: cId,
      customerName: cName,
      date: now.toISOString().split('T')[0],
      time: getTimeBn(now),
      createdAt: now.toISOString()
    });

    if (due > 0 && cId) {
      await update(ref(db, 'users/' + uid + '/customers/' + cId), { due: cDue + due });
    }

    for (const item of AppState.cart) {
      const inv = AppState.inventory.find(i => i.id === item.id);
      if (inv) {
        await update(ref(db, 'users/' + uid + '/inventory/' + inv.id), {
          qty: parseInt(inv.qty) - item.qty
        });
      }
    }

    logActivity('বিক্রয়', `${cName} - ${AppState.cart.map(i => i.name).join(', ')}`, total, {
      customerName: cName,
      invoiceNo
    });

    AppState.cart = [];
    renderCart();
    $('paidAmount').value = '';
    $('discountInput').value = '0';

    showToast('success', 'বিক্রয় সফল!', `মোট: ৳${total.toFixed(2)}`);
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

/* ==================== QUICK STATS ==================== */
function updateQuickStats() {
  setText('totalProducts', AppState.inventory.length);
  setText('totalCustomers', AppState.customers.length);

  const low = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD).length;
  setText('lowStockCount', low);
  setText('lowStockBadge', low);

  updateNotifDot();
}

window.renderLowStock = () => {
  const l = $('lowStockList');
  if (!l) return;

  l.innerHTML = '';
  const lowItems = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);

  if (lowItems.length === 0) {
    l.innerHTML = '<li class="list-group-item text-muted px-0">✅ কোনো সতর্কতা নেই</li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  lowItems.forEach(i => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
    li.innerHTML = `<span><i class="fas fa-box text-danger me-2"></i>${escapeHtml(i.name)}</span><span class="tag tag-danger">${i.qty} বাকি</span>`;
    fragment.appendChild(li);
  });
  l.appendChild(fragment);
};

window.renderRecentTransactions = (sales) => {
  const l = $('recentTransactions');
  if (!l) return;

  l.innerHTML = '';
  if (sales.length === 0) {
    l.innerHTML = '<li class="list-group-item text-muted px-0">কোনো লেনদেন নেই</li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  sales.slice().reverse().slice(0, 5).forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
    li.innerHTML = `
      <span>
        <i class="fas fa-receipt text-primary me-2"></i>${escapeHtml(s.invoiceNo)}
        <br><small class="text-muted">${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</small>
      </span>
      <span class="fw-bold">৳${s.totalAmount}</span>
    `;
    fragment.appendChild(li);
  });
  l.appendChild(fragment);
};

/* ==================== ANALYTICS & REPORTS ==================== */
function renderAnalytics(sales) {
  const pc = {};
  sales.forEach(s => {
    (s.name ? s.name.split(', ') : []).forEach(n => {
      pc[n] = (pc[n] || 0) + 1;
    });
  });

  const top = Object.entries(pc).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (AppState.categoryChart) AppState.categoryChart.destroy();
  const cc = $('categoryChart')?.getContext('2d');
  if (cc) {
    AppState.categoryChart = new Chart(cc, {
      type: 'doughnut',
      data: {
        labels: top.map(p => p[0]),
        datasets: [{
          data: top.map(p => p[1]),
          backgroundColor: ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const paid = sales.reduce((s, i) => s + parseFloat(i.paid || 0), 0);
  const due = sales.reduce((s, i) => s + parseFloat(i.due || 0), 0);

  if (AppState.paymentChart) AppState.paymentChart.destroy();
  const pc2 = $('paymentChart')?.getContext('2d');
  if (pc2) {
    AppState.paymentChart = new Chart(pc2, {
      type: 'pie',
      data: {
        labels: ['পরিশোধিত', 'বাকি'],
        datasets: [{
          data: [paid, due],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function renderReports(sales) {
  const exp = AppState.allExpensesCache;
  const ts = sales.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0);
  const te = exp.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  setText('repSales', ts.toFixed(2));
  setText('repExpense', te.toFixed(2));
  setText('repProfit', (ts - te).toFixed(2));

  const months = {};
  sales.forEach(s => {
    const m = s.date?.slice(0, 7);
    if (m) months[m] = (months[m] || 0) + parseFloat(s.totalAmount || 0);
  });

  const ml = Object.keys(months).sort().slice(-6);

  if (AppState.monthlyReportChart) AppState.monthlyReportChart.destroy();
  const mc = $('monthlyReportChart')?.getContext('2d');
  if (mc) {
    AppState.monthlyReportChart = new Chart(mc, {
      type: 'bar',
      data: {
        labels: ml,
        datasets: [{
          label: 'মাসিক বিক্রয়',
          data: ml.map(m => months[m]),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  const em = {};
  exp.forEach(e => {
    const m = e.date?.slice(0, 7);
    if (m) em[m] = (em[m] || 0) + parseFloat(e.amount || 0);
  });

  if (AppState.profitChart) AppState.profitChart.destroy();
  const pc = $('profitChart')?.getContext('2d');
  if (pc) {
    AppState.profitChart = new Chart(pc, {
      type: 'line',
      data: {
        labels: ml,
        datasets: [
          {
            label: 'আয়',
            data: ml.map(m => months[m] || 0),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'খরচ',
            data: ml.map(m => em[m] || 0),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

/* ==================== MASTER LIST ==================== */
window.renderMasterList = () => {
  const type = $('masterDataType')?.value || 'all';
  const q = ($('masterSearchFilter')?.value || '').toLowerCase();
  const from = $('masterDateFrom')?.value || '';
  const to = $('masterDateTo')?.value || '';

  const th = $('masterTableHead');
  const tb = $('masterTableBody');
  if (!th || !tb) return;

  let headers = [], rows = [];

  if (type === 'all' || type === 'sales') {
    AppState.allSalesCache.forEach(s => {
      if (q && !(s.invoiceNo || '').toLowerCase().includes(q) && !(s.customerName || '').toLowerCase().includes(q)) return;
      if (from && s.date < from) return;
      if (to && s.date > to) return;
      rows.push(['<span class="tag tag-primary">বিক্রয়</span>', s.invoiceNo, s.customerName, '৳' + s.totalAmount, s.date, s.time || '—']);
    });
  }

  if (type === 'all' || type === 'inventory') {
    AppState.inventory.forEach(p => {
      if (q && !p.name.toLowerCase().includes(q)) return;
      const cdate = p.createdAt ? new Date(p.createdAt) : null;
      rows.push(['<span class="tag tag-success">পণ্য</span>', p.name, p.qty, '৳' + p.buyPrice, '৳' + p.sellPrice, cdate ? getTimeBn(cdate) : '—']);
    });
  }

  if (type === 'all' || type === 'customers') {
    AppState.customers.forEach(c => {
      if (q && !c.name.toLowerCase().includes(q)) return;
      const cdate = c.createdAt ? new Date(c.createdAt) : null;
      rows.push(['<span class="tag tag-info">কাস্টমার</span>', c.name, c.phone, '৳' + (c.due || 0), cdate ? getDateBn(cdate) : '—', cdate ? getTimeBn(cdate) : '—']);
    });
  }

  if (type === 'all' || type === 'expenses') {
    AppState.allExpensesCache.forEach(e => {
      if (q && !e.title.toLowerCase().includes(q)) return;
      if (from && e.date < from) return;
      if (to && e.date > to) return;
      rows.push(['<span class="tag tag-danger">খরচ</span>', e.title, '৳' + e.amount, e.date, e.time || '—', '']);
    });
  }

  if (type === 'all') headers = ['টাইপ', 'বিবরণ', 'নাম/নম্বর', 'পরিমাণ', 'তারিখ', 'সময়'];
  else if (type === 'sales') headers = ['টাইপ', 'ইনভয়েস', 'কাস্টমার', 'মোট', 'তারিখ', 'সময়'];
  else if (type === 'inventory') headers = ['টাইপ', 'পণ্য', 'স্টক', 'ক্রয়', 'বিক্রয়', 'সময়'];
  else if (type === 'customers') headers = ['টাইপ', 'নাম', 'ফোন', 'বাকি', 'তারিখ', 'সময়'];
  else if (type === 'expenses') headers = ['টাইপ', 'বিবরণ', 'টাকা', 'তারিখ', 'সময়', ''];

  th.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;

  if (rows.length === 0) {
    tb.innerHTML = `<tr><td colspan="${headers.length}" class="text-center text-muted py-4">কোনো ডেটা নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = r.map(c => `<td>${c}</td>`).join('');
    fragment.appendChild(tr);
  });
  tb.innerHTML = '';
  tb.appendChild(fragment);
};

/* ==================== ADMIN PANEL ==================== */
function loadAllUsers() {
  if (!AppState.currentUser) return;

  const unsub = onValue(ref(db, 'users'), (snap) => {
    const users = snap.val() ? Object.values(snap.val()) : [];
    AppState.allUsersCache = users;

    try { populateAdminUserDropdown(users); } catch (e) { console.warn(e); }
    try { renderAdminUsersList(); } catch (e) { console.warn(e); }
    try { renderAdminUserStats(users); } catch (e) { console.warn(e); }
  }, (err) => {
    console.error('❌ loadAllUsers permission error:', err.code, err.message);
    showToast('warning', 'অ্যাডমিন ডেটা লোড হয়নি', 'Firebase Rules-এ users নোডে .read permission দিন');
  });

  AppState.unsubscribers.push(unsub);
}

function populateAdminUserDropdown(users) {
  const sel = $('adminUserSelect');
  if (!sel) return;

  const cur = sel.value;
  sel.innerHTML = '<option value="">— নির্বাচন করুন —</option>';

  users.forEach(u => {
    if (u.uid === AppState.currentUser.uid) return;
    sel.innerHTML += `<option value="${u.uid}">${escapeHtml(u.fullName || u.email)} — ${escapeHtml(u.role || 'Staff')}</option>`;
  });

  if (cur) sel.value = cur;
}

window.renderAdminUsersList = () => {
  const t = $('adminUsersListTable');
  if (!t) return;

  const q = ($('adminUserSearch')?.value || '').toLowerCase();
  const rf = $('adminRoleFilter')?.value || '';
  const sf = $('adminStatusFilter')?.value || '';

  let users = [...AppState.allUsersCache];
  if (q) users = users.filter(u => (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  if (rf) users = users.filter(u => (u.role || 'Staff') === rf);
  if (sf) users = users.filter(u => (u.status || 'Active') === sf);

  if (users.length === 0) {
    t.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">কোনো ইউজার নেই</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  users.forEach(u => {
    const rb = u.role === 'Admin' ? 'tag-warning' : u.role === 'Manager' ? 'tag-primary' : 'tag-success';
    const sb = u.status === 'Blocked' ? 'tag-danger' : u.status === 'Suspended' ? 'tag-warning' : 'tag-success';
    const cur = u.uid === AppState.currentUser.uid;
    const cdate = u.createdAt ? new Date(u.createdAt) : null;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(u.fullName || '—')}</strong>${cur ? ' <span class="tag tag-info">আপনি</span>' : ''}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="tag ${rb}">${escapeHtml(u.role || 'Staff')}</span></td>
      <td><span class="tag ${sb}">${escapeHtml(u.status || 'Active')}</span></td>
      <td>${cdate ? getDateBn(cdate) : '—'}</td>
      <td>
        ${cur ? '<span class="text-muted small">—</span>' : `
          <button class="btn btn-sm btn-outline-primary" onclick="selectAdminUser('${u.uid}')" title="নির্বাচন"><i class="fas fa-hand-pointer"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="adminDeleteUserById('${u.uid}','${escapeHtml(u.email)}')" title="ডিলিট"><i class="fas fa-trash"></i></button>
        `}
      </td>
    `;
    fragment.appendChild(tr);
  });
  t.innerHTML = '';
  t.appendChild(fragment);
};

function renderAdminUserStats(users) {
  const c = $('adminUserStats');
  if (!c) return;

  c.innerHTML = `
    <div class="col-6"><div class="stat-mini"><small>মোট ইউজার</small><h5>${users.length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>সক্রিয়</small><h5 class="text-success">${users.filter(u => (u.status || 'Active') === 'Active').length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>ব্লকড</small><h5 class="text-danger">${users.filter(u => u.status === 'Blocked').length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>সাসপেন্ডেড</small><h5 class="text-warning">${users.filter(u => u.status === 'Suspended').length}</h5></div></div>
  `;
}

/* ==================== ADMIN USER SELECT ==================== */
window.selectAdminUser = (uid) => {
  const sel = $('adminUserSelect');
  if (sel) {
    sel.value = uid;
    onAdminUserSelect();
  }
};

window.onAdminUserSelect = () => {
  const uid = $('adminUserSelect')?.value;
  if (!uid) {
    clearUserSelection();
    return;
  }

  const user = AppState.allUsersCache.find(u => u.uid === uid);
  if (!user) {
    clearUserSelection();
    return;
  }

  AppState.selectedAdminUser = user;

  const panel = $('selectedUserPanel');
  if (panel) panel.style.display = 'block';

  const badge = $('selectedUserBadge');
  if (badge) {
    badge.style.display = 'inline-flex';
    setText('selectedUserBadgeName', user.fullName || user.email);
  }

  const initial = (user.email[0] || 'U').toUpperCase();
  setText('selUserAvatar', initial);
  setText('selUserName', user.fullName || 'User');
  setText('selUserEmail', user.email);
  setText('selUserRole', user.role || 'Staff');
  setText('selUserStatus', user.status || 'Active');

  const cdate = user.createdAt ? new Date(user.createdAt) : null;
  setText('selUserCreated', cdate ? getDateBn(cdate) : '—');

  setText('adShopName', user.shopName || '—');
  setText('adPhone', user.phone || '—');
  setText('adAddress', user.address || '—');
  setText('adIp', user.lastIp || user.registrationIp || '—');
  setText('adDevice', user.lastDevice || user.registrationDevice || '—');
  setText('adLastLogin', user.lastLogin ? `${user.lastLogin.date} ${user.lastLogin.time}` : '—');

  $('adEditName').value = user.fullName || '';
  $('adEditPhone').value = user.phone || '';
  $('adEditEmail').value = user.email;
  $('adEditShopName').value = user.shopName || '';
  $('adEditAddress').value = user.address || '';
  $('adEditRole').value = user.role || 'Staff';
  $('adEditStatus').value = user.status || 'Active';

  loadUserStats(uid);
};

function loadUserStats(uid) {
  ['inventory', 'customers', 'sales', 'expenses'].forEach(type => {
    onValue(ref(db, 'users/' + uid + '/' + type), (snap) => {
      const count = snap.val() ? Object.keys(snap.val()).length : 0;
      const el = $('adStat' + type.charAt(0).toUpperCase() + type.slice(1));
      if (el) el.textContent = count;
    }, { onlyOnce: true });
  });
}

window.clearUserSelection = () => {
  AppState.selectedAdminUser = null;
  const sel = $('adminUserSelect');
  if (sel) sel.value = '';
  const panel = $('selectedUserPanel');
  if (panel) panel.style.display = 'none';
  const badge = $('selectedUserBadge');
  if (badge) badge.style.display = 'none';
};

window.refreshUserList = () => {
  showLoader(true, 'রিফ্রেশ হচ্ছে...');
  setTimeout(() => {
    showLoader(false);
    showToast('success', 'রিফ্রেশ হয়েছে');
  }, 500);
};

window.switchAdminTab = (tab, el) => {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const content = $('admin-tab-' + tab);
  if (content) content.classList.add('active');
};

/* ==================== ADMIN ACTIONS ==================== */
window.impersonateUser = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'ইউজার হিসেবে কাজ করবেন?',
    `${AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email} এর অ্যাকাউন্টে ঢুকবেন।`,
    { type: 'warning', okText: 'হ্যাঁ, ঢুকুন' }
  );
  if (!ok) return;

  AppState.originalAdminUid = AppState.currentUser.uid;
  AppState.impersonatingUser = AppState.selectedAdminUser.uid;

  showToast('success', 'ইউজার মোড', `${AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email}`);
  setTimeout(() => onAuthStateChanged_reload(), 100);
};

window.exitImpersonation = async () => {
  if (!AppState.impersonatingUser) return;
  AppState.impersonatingUser = null;
  AppState.originalAdminUid = null;
  showToast('info', 'প্রস্থান', 'অ্যাডমিন মোডে ফিরে আসছেন');
  setTimeout(() => onAuthStateChanged_reload(), 100);
};

async function onAuthStateChanged_reload() {
  const user = auth.currentUser;
  if (!user) return;

  AppState.unsubscribers.forEach(unsub => {
    try { unsub(); } catch (e) { /* silent */ }
  });
  AppState.unsubscribers = [];

  const effectiveUid = AppState.impersonatingUser || user.uid;
  const snap = await get(ref(db, 'users/' + effectiveUid));
  if (!snap.exists()) return;

  const data = snap.val();
  AppState.currentUserData = data;
  AppState.currentUserRole = data.role || 'Staff';
  AppState.currentUserShopName = data.shopName || '';
  AppState.currentUserAddress = data.address || '';
  AppState.currentUserFullName = data.fullName || 'User';

  loadUserSettings(data);

  const email = data.email || user.email;
  const initial = (email[0] || 'U').toUpperCase();

  setText('userAvatar', initial);
  setText('dropdownAvatar', initial);
  setText('userName', data.fullName || 'User');
  setText('welcomeName', data.fullName || 'User');
  setText('userRoleLabel', AppState.currentUserRole);
  setText('dropdownName', data.fullName || 'User');
  setText('dropdownEmail', email);
  setText('dropdownRole', AppState.currentUserRole);

  const isAdmin = AppState.currentUserRole === 'Admin';
  const navAdmin = $('nav-admin');
  const adminDivider = $('adminDivider');
  const adminLabel = $('adminLabel');

  if (navAdmin) navAdmin.style.display = isAdmin ? 'flex' : 'none';
  if (adminDivider) adminDivider.style.display = isAdmin ? 'block' : 'none';
  if (adminLabel) adminLabel.style.display = isAdmin ? 'block' : 'none';

  if (AppState.impersonatingUser && AppState.impersonatingUser !== user.uid) {
    document.body.classList.add('impersonating');
    const banner = $('impersonationBanner');
    if (banner) banner.style.display = 'flex';
    setText('impersonatedUser', data.fullName || email);
  } else {
    document.body.classList.remove('impersonating');
    const banner = $('impersonationBanner');
    if (banner) banner.style.display = 'none';
  }

  initApp();
  renderProfile();
  showSection('dashboard');
}

window.adminViewUserData = () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const u = AppState.selectedAdminUser;
  setText('viewDataUserName', u.fullName || u.email);
  switchViewDataTab('sales', document.querySelector('.view-data-tab'));
  new bootstrap.Modal($('adminViewDataModal')).show();
};

window.switchViewDataTab = async (type, el) => {
  if (el) {
    document.querySelectorAll('.view-data-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }

  const c = $('viewDataContent');
  if (!c || !AppState.selectedAdminUser) return;

  c.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i></div>';

  const snap = await get(ref(db, 'users/' + AppState.selectedAdminUser.uid + '/' + type));
  const data = snap.val() ? Object.values(snap.val()) : [];

  if (data.length === 0) {
    c.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h5>কোনো ডেটা নেই</h5></div>`;
    return;
  }

  if (type === 'sales') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>ইনভয়েস</th><th>কাস্টমার</th><th>মোট</th><th>তারিখ</th><th>সময়</th></tr></thead>
      <tbody>${data.map(s => `<tr><td>${escapeHtml(s.invoiceNo)}</td><td>${escapeHtml(s.customerName)}</td><td>৳${s.totalAmount}</td><td>${escapeHtml(s.date)}</td><td>${escapeHtml(s.time || '—')}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'inventory') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>নাম</th><th>স্টক</th><th>ক্রয়</th><th>বিক্রয়</th></tr></thead>
      <tbody>${data.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${p.qty}</td><td>৳${p.buyPrice}</td><td>৳${p.sellPrice}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'customers') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>নাম</th><th>ফোন</th><th>বাকি</th></tr></thead>
      <tbody>${data.map(x => `<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.phone)}</td><td>৳${x.due || 0}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'expenses') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>বিবরণ</th><th>টাকা</th><th>তারিখ</th></tr></thead>
      <tbody>${data.map(e => `<tr><td>${escapeHtml(e.title)}</td><td>৳${e.amount}</td><td>${escapeHtml(e.date)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }
};

window.adminLoginHistory = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const snap = await get(ref(db, 'users/' + AppState.selectedAdminUser.uid + '/loginHistory'));
  const history = snap.val() ? Object.values(snap.val()) : [];
  history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const html = history.length === 0
    ? '<div class="empty-state"><i class="fas fa-history"></i><h5>কোনো লগইন নেই</h5></div>'
    : history.map(h => `<div class="login-history-item">
        <div class="lh-icon"><i class="fas fa-sign-in-alt"></i></div>
        <div class="lh-content">
          <div class="lh-title">${escapeHtml(h.action || 'লগইন')}</div>
          <div class="lh-meta">
            <span><i class="fas fa-calendar"></i> ${escapeHtml(h.date)} • ${escapeHtml(h.time)}</span>
            <span><i class="fas fa-globe"></i> ${escapeHtml(h.ip)}</span>
            <span><i class="fas fa-desktop"></i> ${escapeHtml(h.device)} • ${escapeHtml(h.browser)}</span>
          </div>
        </div>
      </div>`).join('');

  Swal.fire({
    title: `${escapeHtml(AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email)} — লগইন`,
    html: `<div style="max-height:400px;overflow-y:auto;text-align:left;">${html}</div>`,
    width: 600,
    confirmButtonText: 'ঠিক আছে'
  });
};

window.adminSaveProfile = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const data = {
    fullName: $('adEditName').value.trim(),
    phone: $('adEditPhone').value.trim(),
    shopName: $('adEditShopName').value.trim(),
    address: $('adEditAddress').value.trim(),
    role: $('adEditRole').value,
    status: $('adEditStatus').value
  };

  if (!data.fullName) {
    showToast('warning', 'সতর্কতা', 'নাম আবশ্যক');
    return;
  }

  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), data);
    logActivity('অ্যাডমিন: প্রোফাইল আপডেট', data.fullName);
    showToast('success', 'প্রোফাইল আপডেট হয়েছে');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminResetPassword = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'পাসওয়ার্ড রিসেট?',
    `${AppState.selectedAdminUser.email} এ রিসেট লিংক পাঠানো হবে।`,
    { type: 'warning' }
  );
  if (!ok) return;

  try {
    await sendPasswordResetEmail(auth, AppState.selectedAdminUser.email);
    logActivity('অ্যাডমিন: পাসওয়ার্ড রিসেট', AppState.selectedAdminUser.email);
    showToast('success', 'রিসেট লিংক পাঠানো হয়েছে', AppState.selectedAdminUser.email);
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
};

window.adminForceLogout = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm('সেশন টার্মিনেট?', 'ইউজার পরবর্তী রিকোয়েস্টে লগ আউট হবে।', { type: 'warning' });
  if (!ok) return;

  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), { forceLogout: Date.now() });
    logActivity('অ্যাডমিন: সেশন টার্মিনেট', AppState.selectedAdminUser.email);
    showToast('success', 'সেশন টার্মিনেট হয়েছে');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
};

window.adminBlockUser = () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  $('blockUserName').value = AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email;
  $('blockDuration').value = '1';
  $('blockUnit').value = 'days';
  $('blockReason').value = '';
  updateBlockPreview();

  $('blockDuration').oninput = updateBlockPreview;
  $('blockUnit').onchange = updateBlockPreview;

  new bootstrap.Modal($('adminBlockModal')).show();
};

function updateBlockPreview() {
  const dur = parseInt($('blockDuration').value) || 1;
  const unit = $('blockUnit').value;
  const end = new Date();

  if (unit === 'forever') {
    setText('blockPreviewEnd', 'চিরতরে');
    return;
  }

  if (unit === 'minutes') end.setMinutes(end.getMinutes() + dur);
  else if (unit === 'hours') end.setHours(end.getHours() + dur);
  else if (unit === 'days') end.setDate(end.getDate() + dur);
  else if (unit === 'weeks') end.setDate(end.getDate() + dur * 7);
  else if (unit === 'months') end.setMonth(end.getMonth() + dur);
  else if (unit === 'years') end.setFullYear(end.getFullYear() + dur);

  setText('blockPreviewEnd', getDateBn(end) + ' ' + getTimeBn(end));
}

window.confirmAdminBlock = async () => {
  if (!AppState.selectedAdminUser) return;

  const dur = parseInt($('blockDuration').value) || 1;
  const unit = $('blockUnit').value;
  const reason = $('blockReason').value.trim() || 'অ্যাডমিন কর্তৃক ব্লক';

  let blockUntil = null;
  if (unit !== 'forever') {
    const end = new Date();
    if (unit === 'minutes') end.setMinutes(end.getMinutes() + dur);
    else if (unit === 'hours') end.setHours(end.getHours() + dur);
    else if (unit === 'days') end.setDate(end.getDate() + dur);
    else if (unit === 'weeks') end.setDate(end.getDate() + dur * 7);
    else if (unit === 'months') end.setMonth(end.getMonth() + dur);
    else if (unit === 'years') end.setFullYear(end.getFullYear() + dur);
    blockUntil = end.toISOString();
  }

  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), {
      status: 'Blocked',
      blockUntil,
      blockReason: reason
    });

    logActivity(
      'অ্যাডমিন: ইউজার ব্লক',
      `${AppState.selectedAdminUser.email} — ${unit === 'forever' ? 'চিরতরে' : dur + ' ' + unit}`,
      null,
      { reason }
    );

    showToast('success', 'ইউজার ব্লক করা হয়েছে');
    bootstrap.Modal.getInstance($('adminBlockModal')).hide();
    onAdminUserSelect();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminUnblockUser = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'আনব্লক করবেন?',
    `${AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email} আবার সক্রিয় হবেন।`,
    { type: 'success' }
  );
  if (!ok) return;

  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), {
      status: 'Active',
      blockUntil: null,
      blockReason: null
    });
    logActivity('অ্যাডমিন: ইউজার আনব্লক', AppState.selectedAdminUser.email);
    showToast('success', 'আনব্লক করা হয়েছে');
    onAdminUserSelect();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminResetUserData = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'ডেটা রিসেট করবেন?',
    `${AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email} এর সব ডেটা মুছে যাবে (ইউজার থাকবে)।`,
    { type: 'danger', danger: true }
  );
  if (!ok) return;

  showLoader(true);
  try {
    const uid = AppState.selectedAdminUser.uid;
    await remove(ref(db, 'users/' + uid + '/inventory'));
    await remove(ref(db, 'users/' + uid + '/customers'));
    await remove(ref(db, 'users/' + uid + '/sales'));
    await remove(ref(db, 'users/' + uid + '/expenses'));

    logActivity('অ্যাডমিন: ডেটা রিসেট', AppState.selectedAdminUser.email);
    showToast('success', 'ডেটা রিসেট হয়েছে');
    onAdminUserSelect();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminDeleteUser = async () => {
  if (!AppState.selectedAdminUser) {
    showToast('warning', 'সতর্কতা', 'আগে ইউজার নির্বাচন করুন');
    return;
  }

  const ok = await showConfirm(
    'সম্পূর্ণ ডিলিট?',
    `${AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email} ফায়ারবেস থেকে মুছে যাবে — ফেরানো যাবে না!`,
    { type: 'danger', danger: true, okText: 'হ্যাঁ, ডিলিট' }
  );
  if (!ok) return;

  showLoader(true);
  try {
    await remove(ref(db, 'users/' + AppState.selectedAdminUser.uid));
    logActivity('অ্যাডমিন: ইউজার ডিলিট', AppState.selectedAdminUser.email);
    showToast('success', 'ইউজার ডিলিট হয়েছে');
    clearUserSelection();
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminDeleteUserById = async (uid, email) => {
  if (uid === AppState.currentUser.uid) {
    showToast('warning', 'সতর্কতা', 'নিজেকে ডিলিট করতে পারবেন না');
    return;
  }

  const ok = await showConfirm('সম্পূর্ণ ডিলিট?', `${email} ফায়ারবেস থেকে মুছে যাবে।`, { type: 'danger', danger: true });
  if (!ok) return;

  showLoader(true);
  try {
    await remove(ref(db, 'users/' + uid));
    logActivity('অ্যাডমিন: ইউজার ডিলিট', email);
    showToast('success', 'ইউজার ডিলিট হয়েছে');
  } catch (e) {
    showToast('error', 'ব্যর্থ', e.message);
  }
  showLoader(false);
};

window.adminCreateUser = () => {
  $('newUserName').value = '';
  $('newUserEmail').value = '';
  $('newUserPhone').value = '';
  $('newUserRole').value = 'Staff';
  $('newUserShop').value = '';
  $('newUserAddress').value = '';
  $('newUserPassword').value = generateRandomPassword();
  new bootstrap.Modal($('adminNewUserModal')).show();
};

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

window.generatePassword = () => {
  $('newUserPassword').value = generateRandomPassword();
};

window.confirmAdminCreateUser = async () => {
  const name = $('newUserName').value.trim();
  const email = $('newUserEmail').value.trim();
  const phone = $('newUserPhone').value.trim();
  const role = $('newUserRole').value;
  const shopName = $('newUserShop').value.trim();
  const address = $('newUserAddress').value.trim();
  const password = $('newUserPassword').value.trim();

  if (!name || !email || !password) {
    showToast('warning', 'সতর্কতা', 'নাম, ইমেইল, পাসওয়ার্ড আবশ্যক');
    return;
  }
  if (password.length < 6) {
    showToast('error', 'দুর্বল পাসওয়ার্ড', 'কমপক্ষে ৬ অক্ষর');
    return;
  }

  const ok = await showConfirm('ইউজার তৈরি করবেন?', `${email} এ একটি অ্যাকাউন্ট তৈরি হবে।`, { type: 'question' });
  if (!ok) return;

  showLoader(true, 'ইউজার তৈরি হচ্ছে...');

  try {
    const adminUser = auth.currentUser;
    const adminEmail = adminUser.email;

    const uc = await createUserWithEmailAndPassword(auth, email, password);
    const newUid = uc.user.uid;
    const now = new Date();

    await set(ref(db, 'users/' + newUid), {
      uid: newUid,
      fullName: name, email, phone, shopName, address,
      role, status: 'Active',
      createdAt: now.toISOString(),
      createdAtDate: now.toISOString().split('T')[0],
      createdAtTime: getTimeBn(now),
      createdByAdmin: adminEmail,
      settings: DEFAULT_SETTINGS
    });

    await signOut(auth);

    await Swal.fire({
      icon: 'success',
      title: 'ইউজার তৈরি হয়েছে!',
      html: `<div style="text-align:left;">
        <p><strong>নাম:</strong> ${escapeHtml(name)}</p>
        <p><strong>ইমেইল:</strong> ${escapeHtml(email)}</p>
        <p><strong>পাসওয়ার্ড:</strong> <code style="background:#f1f5f9;padding:4px 8px;border-radius:6px;">${escapeHtml(password)}</code></p>
        <p class="text-muted small mt-2">এই পাসওয়ার্ড ইউজারকে জানান। ইউজার প্রথম লগইনে পরিবর্তন করতে পারবে।</p>
        <p class="text-warning small"><strong>নোট:</strong> আপনি এখন লগ আউট হয়েছেন। আবার লগইন করুন।</p>
      </div>`,
      confirmButtonText: 'ঠিক আছে'
    });

    bootstrap.Modal.getInstance($('adminNewUserModal')).hide();
    logActivity('অ্যাডমিন: নতুন ইউজার', `${name} - ${email} (${role})`);
  } catch (e) {
    showToast('error', 'ব্যর্থ', getFirebaseErrorMessage(e.code));
    showLoader(false);
  }
};

/* ==================== NAVIGATION ==================== */
window.toggleSidebar = () => {
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  if (sidebar) sidebar.classList.toggle('show');
  if (overlay) overlay.classList.toggle('show');
};

window.closeSidebar = () => {
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  if (sidebar) sidebar.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
};

window.showSection = (sec) => {
  document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
  const s = $(sec + '-section');
  if (s) {
    s.style.display = 'block';
    s.classList.add('fade-in');
  }

  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  const nav = $('nav-' + sec);
  if (nav) nav.classList.add('active');

  const titles = {
    dashboard: 'ড্যাশবোর্ড',
    sales: 'নতুন বিক্রয় (POS)',
    'sales-list': 'বিক্রয় তালিকা',
    inventory: 'পণ্য কার্ড',
    'inventory-list': 'পণ্য টেবিল',
    customers: 'কাস্টমার',
    expenses: 'খরচ ব্যবস্থাপনা',
    'expenses-list': 'খরচ তালিকা',
    invoices: 'ইনভয়েস',
    'master-list': 'অ্যাডভান্সড লিস্ট',
    'activity-log': 'অ্যাক্টিভিটি লগ',
    reports: 'রিপোর্টস',
    analytics: 'অ্যানালিটিক্স',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস ও কাস্টমাইজেশন',
    admin: 'অ্যাডমিন প্যানেল'
  };

  const subtitles = {
    dashboard: 'আপনার ব্যবসার সারসংক্ষেপ',
    sales: 'নতুন বিক্রয় তৈরি করুন',
    'sales-list': 'সব বিক্রয় এক জায়গায়',
    inventory: 'পণ্য কার্ড দেখুন',
    'inventory-list': 'পণ্য টেবিল আকারে',
    customers: 'কাস্টমার ব্যবস্থাপনা',
    expenses: 'খরচ যোগ করুন',
    'expenses-list': 'সব খরচের তালিকা',
    invoices: 'ইনভয়েস তৈরি ও ডাউনলোড',
    'master-list': 'সব ডেটা একসাথে',
    'activity-log': 'সব কার্যক্রমের বিস্তারিত',
    reports: 'বিস্তারিত রিপোর্ট',
    analytics: 'ডেটা বিশ্লেষণ',
    profile: 'আপনার প্রোফাইল',
    settings: 'আপনার পছন্দমত সাজান',
    admin: 'সম্পূর্ণ ইউজার ম্যানেজমেন্ট'
  };

  setText('pageTitle', titles[sec] || 'ড্যাশবোর্ড');
  setText('pageSubtitle', subtitles[sec] || '');

  if (sec === 'sales' || sec === 'sales-list') $('salesSubmenu')?.classList.add('show');
  if (sec === 'inventory' || sec === 'inventory-list') $('inventorySubmenu')?.classList.add('show');
  if (sec === 'expenses' || sec === 'expenses-list') $('expensesSubmenu')?.classList.add('show');

  if (sec === 'activity-log') {
    renderActivityLogAdvanced();
    updateActivityStats();
  }
  if (sec === 'profile') {
    renderProfile();
    renderLoginHistory();
  }
  if (sec === 'admin') {
    renderAdminUsersList();
  }

  closeSidebar();
};

/* ==================== NOTIFICATIONS ==================== */
window.globalSearch = debounce(() => {
  const q = $('globalSearchInput').value.toLowerCase().trim();
  if (!q || q.length < 2) return;

  const ps = AppState.inventory.filter(i => i.name.toLowerCase().includes(q));
  const cs = AppState.customers.filter(c => c.name.toLowerCase().includes(q));
  const ss = AppState.allSalesCache.filter(s => (s.invoiceNo || '').toLowerCase().includes(q));

  let html = '';
  if (ps.length) {
    html += `<div class="text-start mb-2"><strong>📦 পণ্য:</strong><br>${ps.slice(0, 5).map(p => `${escapeHtml(p.name)} — স্টক: ${p.qty}, মূল্য: ৳${p.sellPrice}`).join('<br>')}</div>`;
  }
  if (cs.length) {
    html += `<div class="text-start mb-2"><strong>👥 কাস্টমার:</strong><br>${cs.slice(0, 5).map(c => `${escapeHtml(c.name)} — বাকি: ৳${c.due}`).join('<br>')}</div>`;
  }
  if (ss.length) {
    html += `<div class="text-start"><strong>🧾 বিক্রয়:</strong><br>${ss.slice(0, 5).map(s => `${escapeHtml(s.invoiceNo)} — ৳${s.totalAmount}`).join('<br>')}</div>`;
  }

  if (html) {
    Swal.fire({ title: 'সার্চ রেজাল্ট', html, icon: 'info' });
  } else {
    Swal.fire({ title: 'কিছু পাওয়া যায়নি', icon: 'info' });
  }
}, 400);

window.showNotifications = () => {
  const ls = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);
  const dc = AppState.customers.filter(c => parseFloat(c.due) > 0);

  Swal.fire({
    title: '🔔 নোটিফিকেশন',
    html: `<div class="text-start">
      <div class="mb-2"><i class="fas fa-exclamation-triangle text-warning me-2"></i>স্টক কম: <strong>${ls.length}</strong>টি পণ্য</div>
      <div class="mb-2"><i class="fas fa-hand-holding-usd text-danger me-2"></i>বাকি আছে: <strong>${dc.length}</strong>জন কাস্টমার</div>
      <div><i class="fas fa-chart-line text-info me-2"></i>আজকের বিক্রি: <strong>৳${$('todaySales')?.textContent || '0'}</strong></div>
    </div>`,
    confirmButtonText: 'ঠিক আছে'
  });
};

/* ==================== CALCULATOR ==================== */
const calcState = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  angleMode: 'DEG',
  history: [],
  expression: ''
};

window.openCalculator = (e) => {
  if (e) e.preventDefault();
  const m = new bootstrap.Modal($('calculatorModal'));
  m.show();
  updateCalcDisplay();
};

window.switchCalcMode = (mode, el) => {
  document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  $('calcPadBasic').style.display = mode === 'basic' ? 'grid' : 'none';
  $('calcPadSci').style.display = mode === 'scientific' ? 'block' : 'none';
};

window.calcNum = (n) => {
  if (calcState.waitingForOperand) {
    calcState.current = n;
    calcState.waitingForOperand = false;
  } else {
    calcState.current = calcState.current === '0' ? n : calcState.current + n;
  }
  updateCalcDisplay();
};

window.calcAction = (action) => {
  const cur = parseFloat(calcState.current) || 0;

  switch (action) {
    case 'clear':
      calcState.current = '0';
      calcState.previous = null;
      calcState.operator = null;
      calcState.waitingForOperand = false;
      calcState.expression = '';
      break;
    case 'backspace':
      calcState.current = calcState.current.length > 1 ? calcState.current.slice(0, -1) : '0';
      break;
    case 'decimal':
      if (calcState.waitingForOperand) {
        calcState.current = '0.';
        calcState.waitingForOperand = false;
      } else if (!calcState.current.includes('.')) {
        calcState.current += '.';
      }
      break;
    case 'negate':
      calcState.current = calcState.current.startsWith('-')
        ? calcState.current.slice(1)
        : '-' + calcState.current;
      break;
    case 'percent':
      calcState.current = String(cur / 100);
      break;
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      if (calcState.operator && !calcState.waitingForOperand) {
        performCalc();
      }
      calcState.previous = parseFloat(calcState.current);
      calcState.operator = action;
      calcState.waitingForOperand = true;
      calcState.expression = `${calcState.previous} ${getOpSymbol(action)}`;
      break;
    case 'equals':
      if (calcState.operator !== null) {
        performCalc();
        calcState.operator = null;
        calcState.previous = null;
        calcState.waitingForOperand = true;
      }
      break;
    case 'openParen':
      calcState.current = calcState.current === '0' ? '(' : calcState.current + '(';
      break;
    case 'closeParen':
      calcState.current += ')';
      break;
    case 'copy':
      navigator.clipboard.writeText(calcState.current)
        .then(() => showToast('success', 'কপি হয়েছে', calcState.current));
      break;
    case 'paste':
      navigator.clipboard.readText()
        .then(t => {
          if (!isNaN(parseFloat(t))) {
            calcState.current = t;
            updateCalcDisplay();
          }
        })
        .catch(() => showToast('warning', 'পেস্ট ব্যর্থ'));
      break;
  }
  updateCalcDisplay();
};

function performCalc() {
  const prev = calcState.previous;
  const cur = parseFloat(calcState.current);
  let result = 0;

  switch (calcState.operator) {
    case 'add': result = prev + cur; break;
    case 'subtract': result = prev - cur; break;
    case 'multiply': result = prev * cur; break;
    case 'divide': result = cur === 0 ? 0 : prev / cur; break;
    default: result = cur;
  }

  calcState.current = String(result);
  calcState.history.unshift(`${prev} ${getOpSymbol(calcState.operator)} ${cur} = ${result}`);
  if (calcState.history.length > 20) calcState.history.pop();
  renderCalcHistory();
}

function getOpSymbol(op) {
  return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op] || '';
}

window.calcFunc = (fn) => {
  let cur = parseFloat(calcState.current) || 0;
  let result = cur;

  try {
    switch (fn) {
      case 'sin':
        result = Math.sin(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur);
        break;
      case 'cos':
        result = Math.cos(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur);
        break;
      case 'tan':
        result = Math.tan(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur);
        break;
      case 'asin':
        result = Math.asin(cur);
        if (calcState.angleMode === 'DEG') result = result * 180 / Math.PI;
        break;
      case 'acos':
        result = Math.acos(cur);
        if (calcState.angleMode === 'DEG') result = result * 180 / Math.PI;
        break;
      case 'atan':
        result = Math.atan(cur);
        if (calcState.angleMode === 'DEG') result = result * 180 / Math.PI;
        break;
      case 'log': result = Math.log10(cur); break;
      case 'ln': result = Math.log(cur); break;
      case 'sqrt': result = Math.sqrt(cur); break;
      case 'cbrt': result = Math.cbrt(cur); break;
      case 'square': result = cur * cur; break;
      case 'cube': result = cur * cur * cur; break;
      case 'inverse': result = cur === 0 ? 0 : 1 / cur; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'fact':
        if (cur < 0 || !Number.isInteger(cur)) {
          showToast('error', 'ভুল', 'ফ্যাক্টোরিয়াল শুধু ধনাত্মক পূর্ণসংখ্যার জন্য');
          return;
        }
        if (cur > 170) {
          showToast('error', 'অনেক বড়', 'সীমা ১৭০');
          return;
        }
        result = 1;
        for (let i = 2; i <= cur; i++) result *= i;
        break;
      case 'pow':
        calcState.previous = cur;
        calcState.operator = 'pow';
        calcState.waitingForOperand = true;
        calcState.expression = `${cur} ^`;
        updateCalcDisplay();
        return;
      case 'exp': result = Math.exp(cur); break;
      case '10pow': result = Math.pow(10, cur); break;
      case 'abs': result = Math.abs(cur); break;
      case 'rand': result = Math.random(); break;
      case 'deg':
        calcState.angleMode = 'DEG';
        updateCalcDisplay();
        return;
      case 'rad':
        calcState.angleMode = 'RAD';
        updateCalcDisplay();
        return;
    }

    if (calcState.operator === 'pow') {
      result = Math.pow(calcState.previous, cur);
      calcState.operator = null;
      calcState.previous = null;
    }

    calcState.current = String(result);
    calcState.history.unshift(`${fn}(${cur}) = ${result}`);
    if (calcState.history.length > 20) calcState.history.pop();
    renderCalcHistory();
  } catch (e) {
    showToast('error', 'ভুল', e.message);
  }

  calcState.waitingForOperand = true;
  updateCalcDisplay();
};

function updateCalcDisplay() {
  const input = $('calcInput');
  const hist = $('calcHistory');
  if (input) input.value = calcState.current;
  if (hist) hist.textContent = calcState.expression || (calcState.history[0] || '');
}

function renderCalcHistory() {
  const hist = $('calcHistory');
  if (!hist) return;
  hist.textContent = calcState.history[0] || '';
}

window.clearCalcHistory = () => {
  calcState.history = [];
  renderCalcHistory();
  showToast('info', 'হিস্ট্রি মুছে ফেলা হয়েছে');
};

/* ==================== KEYBOARD SHORTCUTS ==================== */
document.addEventListener('keydown', (e) => {
  const calcModal = $('calculatorModal');
  const calcOpen = calcModal && calcModal.classList.contains('show');

  if (calcOpen) {
    if (e.key >= '0' && e.key <= '9') calcNum(e.key);
    else if (e.key === '.') calcAction('decimal');
    else if (e.key === '+') calcAction('add');
    else if (e.key === '-') calcAction('subtract');
    else if (e.key === '*') calcAction('multiply');
    else if (e.key === '/') {
      e.preventDefault();
      calcAction('divide');
    } else if (e.key === 'Enter' || e.key === '=') calcAction('equals');
    else if (e.key === 'Backspace') calcAction('backspace');
    else if (e.key === 'Escape') calcAction('clear');
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const inp = $('globalSearchInput');
    if (inp) inp.focus();
  }

  if (e.key === 'Enter') {
    const loginForm = $('loginForm');
    const registerForm = $('registerForm');
    const authScreen = $('authScreen');

    if (loginForm && loginForm.style.display !== 'none' && authScreen.style.display !== 'none') {
      login();
    } else if (registerForm && registerForm.style.display !== 'none') {
      register();
    }
  }

  if (e.key === 'Escape') closeUserDropdown();
});

/* ==================== DOM READY ==================== */
document.addEventListener('DOMContentLoaded', () => {
  const paid = $('paidAmount');
  const disc = $('discountInput');
  if (paid) paid.addEventListener('input', calculateCartTotal);
  if (disc) disc.addEventListener('input', calculateCartTotal);

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (AppState.userSettings.mode === 'auto') {
      document.documentElement.setAttribute('data-mode', mq.matches ? 'dark' : 'light');
    }
  });
});

/* ==================== AUTO LOGOUT ==================== */
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (AppState.userSettings.autoLogout && AppState.currentUser) {
    idleTimer = setTimeout(() => {
      showToast('warning', 'স্বয়ংক্রিয় লগ আউট', '৩০ মিনিট নিষ্ক্রিয় ছিলেন');
      setTimeout(logout, 1500);
    }, IDLE_TIMEOUT_MS);
  }
}

['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

/* ==================== GLOBAL ERROR BOUNDARY ==================== */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (event.error && event.error.message && event.error.message.includes('Firebase')) {
    showToast('error', 'Firebase সমস্যা', 'ইন্টারনেট বা Rules চেক করুন');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (event.reason && event.reason.code) {
    const msg = getFirebaseErrorMessage(event.reason.code);
    if (msg) showToast('error', 'ত্রুটি', msg);
  }
  event.preventDefault();
});

/* ==================== CLEANUP ON UNLOAD ==================== */
window.addEventListener('beforeunload', () => {
  AppState.unsubscribers.forEach(unsub => {
    try { unsub(); } catch (e) { /* silent */ }
  });
});
