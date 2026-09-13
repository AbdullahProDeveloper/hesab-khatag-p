/* =====================================================
   HesabKhata Enterprise Pro - Main Script
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ================== FIREBASE ================== */
const firebaseConfig = {
  apiKey: "AIzaSyBiBGWukd3PNjxK6-gv_4qiCHmwAfO3GzQ",
  authDomain: "hesab-khata.firebaseapp.com",
  projectId: "hesab-khata",
  storageBucket: "hesab-khata.firebasestorage.app",
  messagingSenderId: "138943764760",
  appId: "1:138943764760:web:908c5abacc6122a55d266d",
  measurementId: "G-0HG3FJSS4X"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* ================== GLOBALS ================== */
window.currentUser = null;
window.currentUserRole = 'Staff';
window.currentUserShopName = '';
window.currentUserAddress = '';
window.inventory = [];
window.customers = [];
window.cart = [];
window.lastSelectedProductId = null;
window.currentCustomerDue = 0;
window.currentCustomerId = null;
window.myChart = window.expenseChart = window.categoryChart = window.paymentChart = null;
window.monthlyReportChart = window.profitChart = null;
window.allUsersCache = [];
window.allSalesCache = [];
window.allExpensesCache = [];
window.activityLog = [];
window.editingProductId = window.editingCustomerId = window.payingCustomerId = null;
window.unsubscribers = [];
window.dataLoaded = { inventory:false, customers:false, sales:false, expenses:false };

/* ================== TOAST ================== */
window.showToast = (type, title, message = '') => {
  const container = document.getElementById('toastContainer');
  const icons = {
    success: 'fas fa-check-circle', error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle'
  };
  const toast = document.createElement('div');
  toast.className = `toast-pro ${type}`;
  toast.innerHTML = `
    <div class="toast-accent"></div>
    <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.closest('.toast-pro').classList.add('slide-out'); setTimeout(()=>this.closest('.toast-pro').remove(), 600)"><i class="fas fa-times"></i></button>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    if (!toast.parentElement) return;
    toast.classList.add('slide-out');
    setTimeout(() => toast.remove(), 600);
  }, 2000);
};

window.getFirebaseErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে',
    'auth/invalid-email': 'ইমেইল সঠিক নয়',
    'auth/weak-password': 'পাসওয়ার্ড দুর্বল (কমপক্ষে ৬ অক্ষর)',
    'auth/user-not-found': 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই',
    'auth/wrong-password': 'পাসওয়ার্ড ভুল হয়েছে',
    'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ভুল',
    'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন',
    'auth/network-request-failed': 'ইন্টারনেট সংযোগ নেই',
    'auth/operation-not-allowed': 'এই অপারেশন অনুমোদিত নয়',
    'auth/missing-email': 'ইমেইল দিন'
  };
  return messages[code] || 'একটি সমস্যা হয়েছে, আবার চেষ্টা করুন';
};

/* ================== UTILS ================== */
window.showLoader = (show) => {
  const el = document.getElementById('loaderOverlay');
  if (el) el.classList.toggle('show', show);
};

function getDateBn(date) {
  try { return date.toLocaleDateString('bn-BD', { day:'numeric', month:'long', year:'numeric' }); }
  catch(e) { return date.toLocaleDateString(); }
}
function getTimeBn(date) {
  try { return date.toLocaleTimeString('bn-BD', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }); }
  catch(e) { return date.toLocaleTimeString(); }
}
window.getDateBn = getDateBn;
window.getTimeBn = getTimeBn;

window.formatDateBn = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  } catch(e) { return dateStr; }
};

/* ================== ACTIVITY LOG (ENHANCED) ================== */
window.activityLog = window.activityLog || [];

window.logActivity = (action, details, amount = null, extraData = {}) => {
  const now = new Date();
  const entry = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    action, details,
    amount: amount !== null ? parseFloat(amount) : null,
    date: now.toISOString().split('T')[0],
    time: getTimeBn(now),
    timestamp: now.getTime(),
    fullDateTime: now.toLocaleString('bn-BD'),
    ...extraData
  };
  window.activityLog.unshift(entry);
  if (window.activityLog.length > 500) window.activityLog.pop();
  try { localStorage.setItem('hesabkhata_activity_' + (window.currentUser?.uid || 'guest'), JSON.stringify(window.activityLog)); } catch(e) {}
  renderActivityLog();
  renderActivityLogAdvanced();
  updateActivityStats();
  return entry;
};

window.loadActivityLog = () => {
  try {
    const saved = localStorage.getItem('hesabkhata_activity_' + (window.currentUser?.uid || 'guest'));
    if (saved) window.activityLog = JSON.parse(saved);
  } catch(e) { window.activityLog = []; }
};

window.renderActivityLog = () => {
  const c = document.getElementById('activityLogList');
  if (!c) return;
  c.innerHTML = '';
  if (window.activityLog.length === 0) {
    c.innerHTML = `<div class="text-center text-muted py-4"><i class="fas fa-history fa-2x mb-2"></i><p>কোনো কার্যক্রম নেই</p></div>`;
    return;
  }
  window.activityLog.slice(0, 10).forEach(a => {
    const meta = getActivityMeta(a.action);
    c.innerHTML += `<div class="activity-item">
      <div class="activity-icon ${meta.color}"><i class="${meta.icon}"></i></div>
      <div class="activity-content">
        <div class="activity-title">${a.action}</div>
        <div class="activity-details">${a.details}</div>
        <div class="activity-time"><i class="fas fa-clock me-1"></i>${a.date} • ${a.time}</div>
      </div>
    </div>`;
  });
};

function getActivityMeta(action) {
  if (action.includes('বিক্রয়') || action.includes('বিক্রি')) return { icon: 'fas fa-cart-plus', color: 'bg-success bg-opacity-10 text-success', type: 'বিক্রয়' };
  if (action.includes('ক্রয়')) return { icon: 'fas fa-shopping-cart', color: 'bg-warning bg-opacity-10 text-warning', type: 'ক্রয়' };
  if (action.includes('পরিশোধ')) return { icon: 'fas fa-hand-holding-usd', color: 'bg-info bg-opacity-10 text-info', type: 'পরিশোধ' };
  if (action.includes('খরচ')) return { icon: 'fas fa-receipt', color: 'bg-danger bg-opacity-10 text-danger', type: 'খরচ' };
  if (action.includes('কাস্টমার')) return { icon: 'fas fa-user', color: 'bg-info bg-opacity-10 text-info', type: 'কাস্টমার' };
  if (action.includes('পণ্য')) return { icon: 'fas fa-box', color: 'bg-secondary bg-opacity-10 text-secondary', type: 'পণ্য' };
  if (action.includes('লগইন')) return { icon: 'fas fa-sign-in-alt', color: 'bg-primary bg-opacity-10 text-primary', type: 'লগইন' };
  if (action.includes('ডিলিট')) return { icon: 'fas fa-trash', color: 'bg-danger bg-opacity-10 text-danger', type: 'ডিলিট' };
  return { icon: 'fas fa-info-circle', color: 'bg-primary bg-opacity-10 text-primary', type: 'অন্যান্য' };
}

window.updateActivityStats = () => {
  const actSales = window.activityLog.filter(a => a.action.includes('বিক্রয়') && a.amount).reduce((s,a) => s + (a.amount||0), 0);
  const actPurchase = window.activityLog.filter(a => a.action.includes('ক্রয়') && a.amount).reduce((s,a) => s + (a.amount||0), 0);
  const actExpense = window.activityLog.filter(a => a.action.includes('খরচ') && a.amount).reduce((s,a) => s + (a.amount||0), 0);
  const actPayment = window.activityLog.filter(a => a.action.includes('পরিশোধ') && a.amount).reduce((s,a) => s + (a.amount||0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('actTotal', window.activityLog.length);
  set('actSales', '৳' + actSales.toFixed(2));
  set('actPurchase', '৳' + actPurchase.toFixed(2));
  set('actExpense', '৳' + actExpense.toFixed(2));
  set('actPayment', '৳' + actPayment.toFixed(2));
};

window.renderActivityLogAdvanced = () => {
  const c = document.getElementById('activityTimelineList');
  if (!c) return;
  const q = (document.getElementById('activitySearchInput')?.value || '').toLowerCase();
  const from = document.getElementById('activityDateFrom')?.value || '';
  const to = document.getElementById('activityDateTo')?.value || '';
  const type = document.getElementById('activityTypeFilter')?.value || '';

  let filtered = [...window.activityLog];
  if (q) filtered = filtered.filter(a =>
    a.action.toLowerCase().includes(q) ||
    (a.details||'').toLowerCase().includes(q) ||
    (a.amount && String(a.amount).includes(q))
  );
  if (from) filtered = filtered.filter(a => a.date >= from);
  if (to) filtered = filtered.filter(a => a.date <= to);
  if (type) filtered = filtered.filter(a => a.action.includes(type) || getActivityMeta(a.action).type === type);
  filtered.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));

  c.innerHTML = '';
  if (filtered.length === 0) {
    c.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h5>কোনো ফলাফল নেই</h5><p>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p></div>`;
    return;
  }

  const grouped = {};
  filtered.forEach(a => { if (!grouped[a.date]) grouped[a.date] = []; grouped[a.date].push(a); });
  const sortedDates = Object.keys(grouped).sort().reverse();

  sortedDates.forEach(date => {
    const dayItems = grouped[date];
    const dayTotal = dayItems.filter(a => a.amount).reduce((s,a) => s + (a.amount||0), 0);
    c.innerHTML += `<div style="display:flex;align-items:center;gap:10px;margin:16px 0 10px;padding:8px 12px;background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.08));border-radius:10px;border-left:4px solid var(--primary);">
      <i class="fas fa-calendar-day text-primary"></i>
      <strong>${window.formatDateBn(date)}</strong>
      <span class="tag tag-primary ms-auto">${dayItems.length} টি কার্যক্রম</span>
      ${dayTotal > 0 ? `<span class="tag tag-success">মোট: ৳${dayTotal.toFixed(2)}</span>` : ''}
    </div>`;
    dayItems.forEach(a => {
      const meta = getActivityMeta(a.action);
      let amountClass = '';
      if (a.action.includes('বিক্রয়')) amountClass = 'amount-sale';
      else if (a.action.includes('ক্রয়')) amountClass = 'amount-purchase';
      else if (a.action.includes('খরচ')) amountClass = 'amount-expense';
      else if (a.action.includes('পরিশোধ')) amountClass = 'amount-payment';

      c.innerHTML += `<div class="timeline-item">
        <div class="timeline-icon ${meta.color}"><i class="${meta.icon}"></i></div>
        <div class="timeline-content">
          <div class="timeline-title">
            <span>${a.action}</span>
            ${a.amount ? `<span class="timeline-amount ${amountClass}">৳${a.amount.toFixed(2)}</span>` : ''}
          </div>
          <div class="timeline-desc">${a.details || '—'}</div>
          <div class="timeline-meta">
            <span><i class="fas fa-calendar"></i> ${a.date}</span>
            <span><i class="fas fa-clock"></i> ${a.time}</span>
            ${a.invoiceNo ? `<span><i class="fas fa-file-invoice"></i> ${a.invoiceNo}</span>` : ''}
            ${a.customerName ? `<span><i class="fas fa-user"></i> ${a.customerName}</span>` : ''}
          </div>
        </div>
      </div>`;
    });
  });
};

window.setActivityChip = (el) => {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const t = el.dataset.type;
  document.getElementById('activityTypeFilter').value = t;
  renderActivityLogAdvanced();
};

window.resetActivityFilters = () => {
  const f = (id, v='') => { const el = document.getElementById(id); if (el) el.value = v; };
  f('activitySearchInput'); f('activityDateFrom'); f('activityDateTo'); f('activityTypeFilter');
  document.querySelectorAll('.filter-chip').forEach((c,i) => c.classList.toggle('active', i===0));
  renderActivityLogAdvanced();
};

window.exportActivityLog = () => {
  let c = 'তারিখ,সময়,কার্যক্রম,বিবরণ,পরিমাণ (টাকা)\n';
  window.activityLog.forEach(a => {
    c += `${a.date},${a.time},"${a.action}","${(a.details||'').replace(/"/g,'""')}",${a.amount||0}\n`;
  });
  const b = new Blob(['\uFEFF' + c], { type: 'text/csv;charset=utf-8' });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u; a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  URL.revokeObjectURL(u);
  showToast('success', 'এক্সপোর্ট সফল', 'activity-log.csv');
};

window.clearActivityLog = async () => {
  const r = await Swal.fire({ title:'নিশ্চিত?', text:'সব অ্যাক্টিভিটি লগ মুছে যাবে', icon:'warning', showCancelButton:true, confirmButtonText:'হ্যাঁ, মুছুন', cancelButtonText:'বাতিল', confirmButtonColor:'#ef4444' });
  if (!r.isConfirmed) return;
  window.activityLog = [];
  try { localStorage.removeItem('hesabkhata_activity_' + (window.currentUser?.uid || 'guest')); } catch(e) {}
  renderActivityLog();
  renderActivityLogAdvanced();
  updateActivityStats();
  showToast('success', 'লগ ক্লিয়ার হয়েছে');
};

/* ================== PASSWORD STRENGTH ================== */
window.checkPasswordStrength = () => {
  const p = document.getElementById('regPassword').value;
  const bar = document.getElementById('strengthBar');
  const txt = document.getElementById('strengthText');
  let s = 0;
  if (p.length >= 8) s++;
  if (p.match(/[a-z]+/)) s++;
  if (p.match(/[A-Z]+/)) s++;
  if (p.match(/[0-9]+/)) s++;
  if (p.match(/[$@#&!]+/)) s++;
  if (p.length === 0) { bar.style.width='0%'; bar.className='password-strength-bar'; txt.textContent='পাসওয়ার্ড দিন'; txt.style.color='rgba(255,255,255,0.5)'; }
  else if (s <= 2) { bar.style.width='20%'; bar.className='password-strength-bar strength-weak'; txt.textContent='দুর্বল'; txt.style.color='#ef4444'; }
  else if (s === 3) { bar.style.width='40%'; bar.className='password-strength-bar strength-fair'; txt.textContent='মাঝারি'; txt.style.color='#f59e0b'; }
  else if (s === 4) { bar.style.width='70%'; bar.className='password-strength-bar strength-good'; txt.textContent='ভালো'; txt.style.color='#3b82f6'; }
  else { bar.style.width='100%'; bar.className='password-strength-bar strength-strong'; txt.textContent='শক্তিশালী'; txt.style.color='#10b981'; }
};

/* ================== AUTH NAV ================== */
window.showLogin = () => { document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; document.getElementById('forgotForm').style.display='none'; };
window.showRegister = () => { document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; document.getElementById('forgotForm').style.display='none'; };
window.showForgotPassword = () => { document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='none'; document.getElementById('forgotForm').style.display='block'; };
window.togglePassword = (id, btn) => { const i = document.getElementById(id); if (i.type==='password'){i.type='text';btn.innerHTML='<i class="fas fa-eye-slash"></i>';} else {i.type='password';btn.innerHTML='<i class="fas fa-eye"></i>';} };

/* ================== LOGIN ================== */
window.login = async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email || !pass) { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন'); return; }
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>লগইন হচ্ছে...';
  showLoader(true);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showToast('success', 'লগইন সফল!', 'আপনার ড্যাশবোর্ডে স্বাগতম');
  } catch(e) {
    console.error('Login error:', e);
    showToast('error', 'লগইন ব্যর্থ', getFirebaseErrorMessage(e.code));
    showLoader(false);
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন';
  }
};

/* ================== REGISTER ================== */
window.register = async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const shopName = document.getElementById('regShopName').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const pass = document.getElementById('regPassword').value;
  const cp = document.getElementById('regConfirmPassword').value;
  const terms = document.getElementById('termsCheck').checked;

  if (!name||!email||!phone||!shopName||!address||!pass||!cp) { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন'); return; }
  if (!phone.match(/^01[3-9]\d{8}$/)) { showToast('error', 'ভুল মোবাইল', '01XXXXXXXXX ফরম্যাটে দিন'); return; }
  if (pass.length < 6) { showToast('error', 'দুর্বল পাসওয়ার্ড', 'কমপক্ষে ৬ অক্ষর দিন'); return; }
  if (pass !== cp) { showToast('error', 'পাসওয়ার্ড মিলছে না', 'দুটি পাসওয়ার্ড এক হতে হবে'); return; }
  if (!terms) { showToast('warning', 'শর্তাবলী', 'শর্তাবলীতে সম্মত হন'); return; }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>রেজিস্ট্রেশন হচ্ছে...';
  showLoader(true);

  try {
    const uc = await createUserWithEmailAndPassword(auth, email, pass);
    const user = uc.user;
    await set(ref(db, 'users/' + user.uid), {
      uid: user.uid,
      fullName: name, email, phone, shopName, address,
      role: 'Staff', status: 'Active',
      createdAt: new Date().toISOString(),
      createdAtDate: new Date().toISOString().split('T')[0],
      createdAtTime: getTimeBn(new Date())
    });
    showToast('success', 'রেজিস্ট্রেশন সফল!', 'আপনার ড্যাশবোর্ডে স্বাগতম');
    ['regName','regEmail','regPhone','regShopName','regAddress','regPassword','regConfirmPassword'].forEach(id => document.getElementById(id).value='');
    document.getElementById('termsCheck').checked = false;
    document.getElementById('strengthBar').style.width = '0%';
    document.getElementById('strengthText').textContent = 'পাসওয়ার্ড দিন';
  } catch(e) {
    console.error('Register error:', e);
    showToast('error', 'রেজিস্ট্রেশন ব্যর্থ', getFirebaseErrorMessage(e.code));
    showLoader(false);
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-rocket me-2"></i>রেজিস্টার করুন';
  }
};

/* ================== RESET ================== */
window.resetPassword = async () => {
  const email = document.getElementById('resetEmail').value.trim();
  if (!email) { showToast('warning', 'সতর্কতা', 'ইমেইল লিখুন'); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('error', 'ভুল ইমেইল', 'সঠিক ইমেইল দিন'); return; }
  const btn = document.getElementById('resetBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>পাঠানো হচ্ছে...';
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('success', 'রিসেট লিংক পাঠানো হয়েছে!', `${email} এ চেক করুন`);
    document.getElementById('resetEmail').value = '';
    setTimeout(showLogin, 1500);
  } catch(e) {
    showToast('error', 'ব্যর্থ', getFirebaseErrorMessage(e.code));
  }
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>রিসেট লিংক পাঠান';
};

/* ================== LOGOUT ================== */
window.logout = async () => {
  try { await signOut(auth); showToast('info', 'লগ আউট', 'আবার আসবেন!'); }
  catch(e) { showToast('error', 'ব্যর্থ', e.message); }
};

/* ================== AUTH STATE ================== */
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? user.email : 'null');
  window.unsubscribers.forEach(unsub => { try { unsub(); } catch(e){} });
  window.unsubscribers = [];
  window.dataLoaded = { inventory:false, customers:false, sales:false, expenses:false };

  if (user) {
    window.currentUser = user;
    showLoader(true);
    try {
      let data = null;
      const snap = await get(ref(db, 'users/' + user.uid));
      if (!snap.exists()) {
        console.log('Profile missing, creating...');
        await set(ref(db, 'users/' + user.uid), {
          uid: user.uid,
          fullName: user.email.split('@')[0],
          email: user.email, phone:'', shopName:'', address:'',
          role: 'Staff', status: 'Active',
          createdAt: new Date().toISOString()
        });
        data = (await get(ref(db, 'users/' + user.uid))).val();
      } else { data = snap.val(); }

      window.currentUserRole = data.role || 'Staff';
      window.currentUserShopName = data.shopName || '';
      window.currentUserAddress = data.address || '';

      const el = (id) => document.getElementById(id);
      if (el('userInitial')) el('userInitial').textContent = (user.email[0] || 'U').toUpperCase();
      if (el('userName')) el('userName').textContent = data.fullName || 'User';
      if (el('welcomeName')) el('welcomeName').textContent = data.fullName || 'User';
      if (el('userRoleLabel')) el('userRoleLabel').textContent = window.currentUserRole;

      const isAdmin = window.currentUserRole === 'Admin';
      if (el('nav-admin')) el('nav-admin').style.display = isAdmin ? 'flex' : 'none';
      if (el('nav-users')) el('nav-users').style.display = isAdmin ? 'flex' : 'none';
      if (el('adminDivider')) el('adminDivider').style.display = isAdmin ? 'block' : 'none';
      if (el('adminLabel')) el('adminLabel').style.display = isAdmin ? 'block' : 'none';

      if (el('authScreen')) el('authScreen').style.display = 'none';
      if (el('mainApp')) el('mainApp').style.display = 'block';

      loadActivityLog();
      initApp();
      showSection('dashboard');
      showLoader(false);

      setTimeout(() => {
        showToast('success', `স্বাগতম, ${data.fullName || 'User'}!`, `রোল: ${window.currentUserRole}`);
      }, 300);
    } catch(e) {
      console.error('Auth state error:', e);
      showToast('error', 'লোড ব্যর্থ', e.message);
      showLoader(false);
    }
  } else {
    window.currentUser = null;
    window.currentUserRole = 'Staff';
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    showLogin();
    showLoader(false);
    const btn = document.getElementById('loginBtn');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>নিরাপদ লগইন'; }
    const rbtn = document.getElementById('registerBtn');
    if (rbtn) { rbtn.disabled = false; rbtn.innerHTML = '<i class="fas fa-rocket me-2"></i>রেজিস্টার করুন'; }
  }
});

/* ================== INIT APP ================== */
function initApp() {
  if (!window.currentUser) return;
  const uid = window.currentUser.uid;
  console.log('initApp for uid:', uid);

  const unsub1 = onValue(ref(db, 'users/' + uid + '/inventory'), (snap) => {
    window.inventory = snap.val() ? Object.values(snap.val()) : [];
    window.dataLoaded.inventory = true;
    renderProductCards();
    renderInventoryTable();
    renderCustomerSelect();
    renderLowStock();
    updateQuickStats();
  }, (err) => console.error('Inventory error:', err));
  window.unsubscribers.push(unsub1);

  const unsub2 = onValue(ref(db, 'users/' + uid + '/customers'), (snap) => {
    window.customers = snap.val() ? Object.values(snap.val()) : [];
    window.dataLoaded.customers = true;
    renderCustomerCards();
    renderCustomerHistoryList();
    renderCustomerSelect();
    updateQuickStats();
  }, (err) => console.error('Customers error:', err));
  window.unsubscribers.push(unsub2);

  const unsub3 = onValue(ref(db, 'users/' + uid + '/sales'), (snap) => {
    const sales = snap.val() ? Object.values(snap.val()) : [];
    window.allSalesCache = sales;
    window.dataLoaded.sales = true;
    renderDashboard(sales);
    renderInvoices(sales);
    renderRecentTransactions(sales);
    renderSalesList(sales);
    renderAnalytics(sales);
    renderReports(sales);
    renderMasterList();
  }, (err) => console.error('Sales error:', err));
  window.unsubscribers.push(unsub3);

  const unsub4 = onValue(ref(db, 'users/' + uid + '/expenses'), (snap) => {
    const exp = snap.val() ? Object.values(snap.val()) : [];
    window.allExpensesCache = exp;
    window.dataLoaded.expenses = true;
    renderExpenses(exp);
    updateTotalExpense(exp);
    renderExpenseChart(exp);
    renderMasterList();
  }, (err) => console.error('Expenses error:', err));
  window.unsubscribers.push(unsub4);

  if (window.currentUserRole === 'Admin') loadAllUsers();

  const ps = document.getElementById('productSearch');
  if (ps && !ps.dataset.bound) {
    ps.dataset.bound = 'true';
    ps.addEventListener('input', function(e) {
      const q = e.target.value.toLowerCase();
      const res = document.getElementById('productSearchResults');
      res.innerHTML = '';
      if (q.length > 0) {
        window.inventory.filter(i => i.name.toLowerCase().includes(q) && parseInt(i.qty) > 0).forEach(item => {
          res.innerHTML += `<button class="list-group-item list-group-item-action d-flex justify-content-between" onclick="selectProduct('${item.id}')">
            <span><strong>${item.name}</strong> <small class="text-muted">(স্টক:${item.qty})</small></span><b class="text-primary">৳${item.sellPrice}</b></button>`;
        });
      }
    });
  }

  ['addProdQty','addProdBuyPrice','addProdSellPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) { el.dataset.bound = 'true'; el.addEventListener('input', updateAddProdLive); }
  });
  ['purchaseQty','purchasePrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) { el.dataset.bound = 'true'; el.addEventListener('input', updatePurchaseLive); }
  });

  const cd = document.getElementById('currentDate');
  if (cd) cd.textContent = getDateBn(new Date());
}

function updateNotifDot() {
  const ls = window.inventory.filter(i => parseInt(i.qty) <= 5);
  const dc = window.customers.filter(c => parseFloat(c.due) > 0);
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = (ls.length + dc.length) > 0 ? 'block' : 'none';
}

function updateAddProdLive() {
  const qty = parseFloat(document.getElementById('addProdQty').value) || 0;
  const buy = parseFloat(document.getElementById('addProdBuyPrice').value) || 0;
  const sell = parseFloat(document.getElementById('addProdSellPrice').value) || 0;
  const profit = sell - buy;
  document.getElementById('addProdProfit').textContent = '৳' + profit.toFixed(2);
  document.getElementById('addProdTotalProfit').textContent = '৳' + (profit * qty).toFixed(2);
}
function updatePurchaseLive() {
  const qty = parseFloat(document.getElementById('purchaseQty').value) || 0;
  const price = parseFloat(document.getElementById('purchasePrice').value) || 0;
  document.getElementById('purchaseTotalCost').textContent = (qty * price).toFixed(2);
  const cur = parseFloat(document.getElementById('purchaseCurrentStock').textContent) || 0;
  document.getElementById('purchaseNewStock').textContent = (cur + qty).toString();
}

window.previewPayDue = () => {
  const amount = parseFloat(document.getElementById('payAmount').value) || 0;
  const curDue = parseFloat(document.getElementById('payCurrentDue').value.replace(/[^\d.]/g,'')) || 0;
  const remaining = Math.max(0, curDue - amount);
  document.getElementById('payRemainingDue').textContent = '৳' + remaining.toFixed(2);
  const status = remaining <= 0 ? '<span class="tag tag-success">সম্পূর্ণ পরিশোধ</span>' : '<span class="tag tag-warning">আংশিক পরিশোধ</span>';
  document.getElementById('payStatus').innerHTML = status;
};

window.quickExpense = (desc) => { document.getElementById('addExpDesc').value = desc; };
window.openAddCustomerQuick = () => { new bootstrap.Modal(document.getElementById('quickAddCustomerModal')).show(); };

/* ================== PRODUCT RENDERING ================== */
window.renderProductCards = () => {
  const c = document.getElementById('productCardsContainer');
  if (!c) return;
  c.innerHTML = '';
  const f = getFilteredInventory();
  if (f.length === 0) {
    c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-boxes"></i><h5>কোনো পণ্য নেই</h5><p>নতুন পণ্য যোগ করুন</p>
      <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addProductModal"><i class="fas fa-plus"></i>নতুন পণ্য</button></div></div>`;
    return;
  }
  f.forEach(p => {
    const low = parseInt(p.qty) <= 5;
    const badge = low ? '<span class="badge-stock low"><i class="fas fa-exclamation-circle"></i>স্টক কম</span>' : '<span class="badge-stock ok"><i class="fas fa-check-circle"></i>স্টক আছে</span>';
    c.innerHTML += `<div class="col-xl-3 col-md-4 col-sm-6"><div class="product-card">
      <div class="product-icon"><i class="fas fa-box"></i></div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">৳${p.sellPrice}</div>
      ${badge}<span class="ms-1 small text-muted">স্টক: ${p.qty}</span>
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> ইডিট</button>
        <button class="action-btn sell" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i> বিক্রি</button>
        <button class="action-btn buy" onclick="purchaseProductModal('${p.id}')"><i class="fas fa-shopping-cart"></i> ক্রয়</button>
        <button class="action-btn del" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div></div>`;
  });
};

window.renderInventoryTable = () => {
  const t = document.getElementById('inventoryTableBody');
  if (!t) return;
  const f = getFilteredInventoryList();
  t.innerHTML = '';
  if (f.length === 0) { t.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">কোনো পণ্য নেই</td></tr>`; return; }
  f.forEach((p, i) => {
    const ppu = parseFloat(p.sellPrice) - parseFloat(p.buyPrice);
    const tp = ppu * parseInt(p.qty);
    const badge = parseInt(p.qty) <= 5 ? '<span class="tag tag-danger">স্টক কম</span>' : '<span class="tag tag-success">স্টক আছে</span>';
    t.innerHTML += `<tr><td>${i+1}</td><td><strong>${p.name}</strong></td><td>${p.qty}</td>
      <td>৳${p.buyPrice}</td><td>৳${p.sellPrice}</td>
      <td class="text-success">৳${ppu.toFixed(2)}</td><td class="text-success fw-bold">৳${tp.toFixed(2)}</td>
      <td>${badge}</td><td>
      <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline-success" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i></button>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </td></tr>`;
  });
};

function getFilteredInventory() {
  const q = (document.getElementById('inventorySearchFilter')?.value || '').toLowerCase();
  const sf = document.getElementById('inventoryStockFilter')?.value || '';
  return window.inventory.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (sf==='low' && parseInt(i.qty) > 5) return false;
    if (sf==='ok' && parseInt(i.qty) <= 5) return false;
    return true;
  });
}
function getFilteredInventoryList() {
  const q = (document.getElementById('inventoryListSearchFilter')?.value || '').toLowerCase();
  return window.inventory.filter(i => !q || i.name.toLowerCase().includes(q));
}
window.filterInventory = () => renderProductCards();
window.filterInventoryList = () => renderInventoryTable();

/* ================== PRODUCT CRUD ================== */
window.editProduct = (id) => {
  const p = window.inventory.find(i => i.id === id);
  if (!p) return;
  window.editingProductId = id;
  document.getElementById('editProdName').value = p.name;
  document.getElementById('editProdQty').value = p.qty;
  document.getElementById('editProdBuyPrice').value = p.buyPrice;
  document.getElementById('editProdSellPrice').value = p.sellPrice;
  new bootstrap.Modal(document.getElementById('editProductModal')).show();
};

window.updateInventory = async () => {
  if (!window.editingProductId) return;
  const name = document.getElementById('editProdName').value.trim();
  const qty = document.getElementById('editProdQty').value;
  const buy = document.getElementById('editProdBuyPrice').value;
  const sell = document.getElementById('editProdSellPrice').value;
  if (!name||qty===''||buy===''||sell==='') { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  showLoader(true);
  try {
    await update(ref(db, 'users/'+window.currentUser.uid+'/inventory/'+window.editingProductId), { name, qty, buyPrice: buy, sellPrice: sell });
    logActivity('পণ্য সম্পাদনা', `${name} আপডেট`);
    showToast('success', 'পণ্য আপডেট হয়েছে', name);
    bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.sellProduct = (id) => {
  const p = window.inventory.find(i => i.id === id);
  if (!p) return;
  showSection('sales');
  window.lastSelectedProductId = id;
  document.getElementById('productSearch').value = p.name;
  document.getElementById('productQty').value = '1';
  showToast('info', 'পণ্য নির্বাচিত', p.name);
};

window.purchaseProductModal = (id) => {
  const p = window.inventory.find(i => i.id === id);
  if (!p) return;
  document.getElementById('purchaseProdName').value = p.name;
  document.getElementById('purchaseQty').value = '1';
  document.getElementById('purchasePrice').value = p.buyPrice;
  document.getElementById('purchaseCurrentStock').textContent = p.qty;
  document.getElementById('purchaseNewStock').textContent = (parseInt(p.qty)+1).toString();
  document.getElementById('purchaseTotalCost').textContent = parseFloat(p.buyPrice).toFixed(2);
  new bootstrap.Modal(document.getElementById('purchaseProductModal')).show();
};

window.purchaseProduct = async () => {
  const name = document.getElementById('purchaseProdName').value;
  const qty = parseInt(document.getElementById('purchaseQty').value);
  const price = parseFloat(document.getElementById('purchasePrice').value);
  if (!qty || qty <= 0) { showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন'); return; }
  if (!price || price < 0) { showToast('error', 'ভুল মূল্য', 'সঠিক মূল্য দিন'); return; }
  const p = window.inventory.find(i => i.name === name);
  if (!p) return;
  showLoader(true);
  try {
    const newQty = parseInt(p.qty) + qty;
    await update(ref(db, 'users/'+window.currentUser.uid+'/inventory/'+p.id), { qty: newQty, buyPrice: price });
    logActivity('পণ্য ক্রয়', `${name} - ${qty} ইউনিট @ ৳${price}`, qty * price);
    showToast('success', 'ক্রয় সম্পন্ন!', `নতুন স্টক: ${newQty}`);
    bootstrap.Modal.getInstance(document.getElementById('purchaseProductModal')).hide();
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

/* ================== CUSTOMER ================== */
window.renderCustomerCards = () => {
  const c = document.getElementById('customerCardsContainer');
  if (!c) return;
  c.innerHTML = '';
  const f = getFilteredCustomers();
  if (f.length === 0) {
    c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-users"></i><h5>কোনো কাস্টমার নেই</h5>
      <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addCustomerModal"><i class="fas fa-plus"></i>নতুন কাস্টমার</button></div></div>`;
    return;
  }
  f.forEach(cust => {
    const hasDue = parseFloat(cust.due) > 0;
    const badge = hasDue ? `<span class="badge-stock low"><i class="fas fa-exclamation-circle"></i>বাকি: ৳${cust.due}</span>` : `<span class="badge-stock ok"><i class="fas fa-check-circle"></i>বাকি নেই</span>`;
    c.innerHTML += `<div class="col-xl-3 col-md-4 col-sm-6"><div class="customer-card">
      <div class="customer-icon"><i class="fas fa-user"></i></div>
      <div class="customer-name">${cust.name}</div>
      <div class="customer-phone"><i class="fas fa-phone me-1"></i>${cust.phone || 'নাই'}</div>
      ${badge}
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editCustomer('${cust.id}')"><i class="fas fa-edit"></i> ইডিট</button>
        <button class="action-btn sell" onclick="sellToCustomer('${cust.id}')"><i class="fas fa-cart-plus"></i> বিক্রি</button>
        <button class="action-btn pay" onclick="payDueModal('${cust.id}')"><i class="fas fa-hand-holding-usd"></i> পরিশোধ</button>
        <button class="action-btn del" onclick="deleteItem('customers','${cust.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div></div>`;
  });
  renderCustomerHistoryList();
};

function getFilteredCustomers() {
  const q = (document.getElementById('customerSearchFilter')?.value || '').toLowerCase();
  const df = document.getElementById('customerDueFilter')?.value || '';
  return window.customers.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (df==='due' && parseFloat(c.due) <= 0) return false;
    if (df==='clear' && parseFloat(c.due) > 0) return false;
    return true;
  });
}
window.filterCustomers = () => renderCustomerCards();

window.renderCustomerHistoryList = () => {
  const t = document.getElementById('customerHistoryTableBody');
  if (!t) return;
  const q = (document.getElementById('custHistorySearch')?.value || '').toLowerCase();
  const from = document.getElementById('custHistoryDateFrom')?.value || '';
  const to = document.getElementById('custHistoryDateTo')?.value || '';
  let filtered = [...window.customers];
  if (q) filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.phone||'').includes(q));
  if (from) filtered = filtered.filter(c => (c.createdAt||'').slice(0,10) >= from);
  if (to) filtered = filtered.filter(c => (c.createdAt||'').slice(0,10) <= to);
  filtered.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  t.innerHTML = '';
  if (filtered.length === 0) {
    t.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">কোনো কাস্টমার ইতিহাস নেই</td></tr>`;
    return;
  }
  filtered.forEach((c, i) => {
    const created = c.createdAt ? new Date(c.createdAt) : null;
    const date = created ? getDateBn(created) : '—';
    const time = created ? getTimeBn(created) : '—';
    const hasDue = parseFloat(c.due) > 0;
    const statusBadge = hasDue ? `<span class="tag tag-warning">বাকি: ৳${c.due}</span>` : `<span class="tag tag-success">পরিষ্কার</span>`;
    t.innerHTML += `<tr>
      <td>${i+1}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.phone||'—'}</td>
      <td>৳${c.due||0}</td>
      <td><i class="fas fa-calendar text-primary me-1"></i>${date}</td>
      <td><i class="fas fa-clock text-info me-1"></i>${time}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCustomer('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="sellToCustomer('${c.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn btn-sm btn-outline-warning" onclick="payDueModal('${c.id}')"><i class="fas fa-hand-holding-usd"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('customers','${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  });
};

window.resetCustomerHistoryFilters = () => {
  ['custHistorySearch','custHistoryDateFrom','custHistoryDateTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderCustomerHistoryList();
};

window.editCustomer = (id) => {
  const c = window.customers.find(i => i.id === id);
  if (!c) return;
  window.editingCustomerId = id;
  document.getElementById('editCustName').value = c.name;
  document.getElementById('editCustPhone').value = c.phone || '';
  new bootstrap.Modal(document.getElementById('editCustomerModal')).show();
};

window.updateCustomer = async () => {
  if (!window.editingCustomerId) return;
  const name = document.getElementById('editCustName').value.trim();
  const phone = document.getElementById('editCustPhone').value.trim();
  if (!name) { showToast('warning', 'সতর্কতা', 'নাম লিখুন'); return; }
  showLoader(true);
  try {
    await update(ref(db, 'users/'+window.currentUser.uid+'/customers/'+window.editingCustomerId), { name, phone });
    logActivity('কাস্টমার সম্পাদনা', `${name} আপডেট`);
    showToast('success', 'কাস্টমার আপডেট হয়েছে', name);
    bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.sellToCustomer = (id) => {
  const c = window.customers.find(i => i.id === id);
  if (!c) return;
  showSection('sales');
  document.getElementById('customerSelect').value = id;
  updateCustomerDue();
  showToast('info', 'কাস্টমার নির্বাচিত', c.name);
};

window.payDueModal = (id) => {
  const c = window.customers.find(i => i.id === id);
  if (!c) return;
  window.payingCustomerId = id;
  document.getElementById('payCustName').value = c.name;
  document.getElementById('payCurrentDue').value = `৳${c.due || 0}`;
  document.getElementById('payAmount').value = c.due || 0;
  previewPayDue();
  new bootstrap.Modal(document.getElementById('payDueModal')).show();
};

window.makePayment = async () => {
  if (!window.payingCustomerId) return;
  const amount = parseFloat(document.getElementById('payAmount').value);
  const c = window.customers.find(i => i.id === window.payingCustomerId);
  if (!amount || amount <= 0) { showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন'); return; }
  if (amount > (parseFloat(c.due) || 0)) { showToast('warning', 'বেশি পরিমাণ', 'বাকির চেয়ে বেশি দেওয়া যাবে না'); return; }
  const newDue = Math.max(0, (parseFloat(c.due)||0) - amount);
  showLoader(true);
  try {
    await update(ref(db, 'users/'+window.currentUser.uid+'/customers/'+window.payingCustomerId), { due: newDue });
    logActivity('বাকি পরিশোধ', `${c.name} কে ৳${amount} পরিশোধ`, amount);
    showToast('success', 'পরিশোধ সম্পন্ন!', `বাকি এখন: ৳${newDue}`);
    bootstrap.Modal.getInstance(document.getElementById('payDueModal')).hide();
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.quickAddCustomer = async () => {
  const name = document.getElementById('quickCustName').value.trim();
  const phone = document.getElementById('quickCustPhone').value.trim();
  if (!name || !phone) { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  showLoader(true);
  try {
    const r = push(ref(db, 'users/'+window.currentUser.uid+'/customers'));
    await set(r, { id: r.key, name, phone, due: 0, createdAt: new Date().toISOString() });
    logActivity('নতুন কাস্টমার', `${name} - ${phone}`, 0);
    showLoader(false);
    bootstrap.Modal.getInstance(document.getElementById('quickAddCustomerModal')).hide();
    document.getElementById('quickCustName').value = '';
    document.getElementById('quickCustPhone').value = '';
    showToast('success', 'কাস্টমার যোগ হয়েছে', name);
    setTimeout(() => { document.getElementById('customerSelect').value = r.key; updateCustomerDue(); }, 400);
  } catch(e) { showLoader(false); showToast('error', 'ব্যর্থ', e.message); }
};

/* ================== EXPENSES ================== */
window.renderExpenses = (exp) => {
  const t = document.getElementById('expenseTableBody');
  if (!t) return;
  t.innerHTML = '';
  if (exp.length === 0) { t.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">কোনো খরচ নেই</td></tr>`; return; }
  exp.slice().reverse().forEach(e => {
    const d = e.date ? new Date(e.date) : new Date();
    t.innerHTML += `<tr><td><strong>${e.title}</strong></td><td class="text-danger fw-bold">৳${e.amount}</td>
      <td>${getDateBn(d)}</td><td>${e.time || '—'}</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="deleteItem('expenses','${e.id}')"><i class="fas fa-trash"></i></button></td></tr>`;
  });
};

window.filterExpenseList = () => {
  let exp = window.allExpensesCache;
  const q = (document.getElementById('expenseSearchFilter')?.value || '').toLowerCase();
  const from = document.getElementById('expenseDateFrom')?.value;
  const to = document.getElementById('expenseDateTo')?.value;
  if (q) exp = exp.filter(e => e.title.toLowerCase().includes(q));
  if (from) exp = exp.filter(e => e.date >= from);
  if (to) exp = exp.filter(e => e.date <= to);
  renderExpenses(exp);
};
window.resetExpenseFilters = () => {
  document.getElementById('expenseSearchFilter').value = '';
  document.getElementById('expenseDateFrom').value = '';
  document.getElementById('expenseDateTo').value = '';
  renderExpenses(window.allExpensesCache);
};

window.renderExpenseChart = (exp) => {
  const ctx = document.getElementById('expenseChart')?.getContext('2d');
  if (!ctx) return;
  const last7 = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().split('T')[0];
    last7.push({ label: ds.slice(5), amount: exp.filter(e => e.date === ds).reduce((s,e) => s + parseFloat(e.amount||0), 0) });
  }
  if (window.expenseChart) window.expenseChart.destroy();
  window.expenseChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: last7.map(d=>d.label), datasets: [{ label:'খরচ', data: last7.map(d=>d.amount), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
  const today = new Date().toISOString().split('T')[0];
  const tm = today.slice(0,7);
  document.getElementById('todayExpense').textContent = '৳' + exp.filter(e => e.date === today).reduce((s,e) => s + parseFloat(e.amount||0), 0).toFixed(2);
  document.getElementById('monthExpense').textContent = '৳' + exp.filter(e => e.date && e.date.startsWith(tm)).reduce((s,e) => s + parseFloat(e.amount||0), 0).toFixed(2);
  document.getElementById('totalExpenseQuick').textContent = '৳' + exp.reduce((s,e) => s + parseFloat(e.amount||0), 0).toFixed(2);
};

/* ================== SALES LIST ================== */
window.renderSalesList = (sales) => {
  const t = document.getElementById('salesTableBody');
  if (!t) return;
  t.innerHTML = '';
  if (sales.length === 0) { t.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">কোনো বিক্রয় নেই</td></tr>`; return; }
  sales.slice().reverse().forEach(s => {
    const d = s.date ? new Date(s.date) : new Date();
    const cls = parseFloat(s.due) > 0 ? 'text-danger' : 'text-success';
    t.innerHTML += `<tr><td><strong>${s.invoiceNo||'N/A'}</strong></td>
      <td>${s.customerName||'সাধারণ'}</td><td>${s.name||''}</td>
      <td class="fw-bold">৳${s.totalAmount}</td><td class="text-success">৳${s.paid||0}</td>
      <td class="${cls} fw-bold">৳${s.due||0}</td>
      <td>${getDateBn(d)}</td>
      <td><small class="text-muted"><i class="fas fa-clock me-1"></i>${s.time||'—'}</small></td>
      <td><button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
      <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
      <button class="btn btn-sm btn-outline-info" onclick="shareInvoice('${s.id}')"><i class="fas fa-share-alt"></i></button></td></tr>`;
  });
};

window.filterSalesList = () => {
  let sales = window.allSalesCache;
  const q = (document.getElementById('salesSearchFilter')?.value || '').toLowerCase();
  const from = document.getElementById('salesDateFrom')?.value;
  const to = document.getElementById('salesDateTo')?.value;
  const st = document.getElementById('salesStatusFilter')?.value;
  if (q) sales = sales.filter(s => (s.invoiceNo||'').toLowerCase().includes(q) || (s.customerName||'').toLowerCase().includes(q));
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);
  if (st==='paid') sales = sales.filter(s => parseFloat(s.due) <= 0);
  if (st==='due') sales = sales.filter(s => parseFloat(s.due) > 0);
  renderSalesList(sales);
};
window.resetSalesFilters = () => {
  document.getElementById('salesSearchFilter').value = '';
  document.getElementById('salesDateFrom').value = '';
  document.getElementById('salesDateTo').value = '';
  document.getElementById('salesStatusFilter').value = '';
  renderSalesList(window.allSalesCache);
};

/* ================== INVOICE ================== */
window.printInvoice = (id) => {
  const s = window.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Invoice ${s.invoiceNo}</title><style>body{font-family:Arial;padding:20px}.header{text-align:center;border-bottom:2px solid #6366f1;padding-bottom:20px;margin-bottom:20px}.header h1{color:#6366f1}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border:1px solid #ddd;text-align:left}th{background:#6366f1;color:#fff}.print-btn{display:block;margin:20px auto;padding:10px 30px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer}@media print{.print-btn{display:none}}</style></head><body>
  <div class="header"><h1>HesabKhata Enterprise</h1><p>${window.currentUserShopName}</p><p>${window.currentUserAddress}</p></div>
  <p><strong>ইনভয়েস:</strong> ${s.invoiceNo} | <strong>তারিখ:</strong> ${s.date} ${s.time||''}</p>
  <p><strong>কাস্টমার:</strong> ${s.customerName}</p>
  <table><tr><th>পণ্য</th><th>মোট</th></tr><tr><td>${s.name}</td><td>৳${s.totalAmount}</td></tr></table>
  <p><strong>পরিশোধিত:</strong> ৳${s.paid} | <strong>বাকি:</strong> ৳${s.due}</p>
  <button class="print-btn" onclick="window.print()">প্রিন্ট করুন</button></body></html>`);
  w.document.close();
};
window.downloadInvoice = (id) => {
  const s = window.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const c = `HesabKhata Enterprise\nইনভয়েস: ${s.invoiceNo}\nতারিখ: ${s.date} ${s.time||''}\nকাস্টমার: ${s.customerName}\nপণ্য: ${s.name}\nমোট: ৳${s.totalAmount}\nপরিশোধিত: ৳${s.paid}\nবাকি: ৳${s.due}`;
  const b = new Blob([c], {type:'text/plain'});
  const u = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href=u; a.download=`Invoice-${s.invoiceNo}.txt`; a.click();
  URL.revokeObjectURL(u);
  showToast('success', 'ডাউনলোড হয়েছে', `Invoice-${s.invoiceNo}.txt`);
};
window.shareInvoice = (id) => {
  const s = window.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const t = `📄 HesabKhata Enterprise\nইনভয়েস: ${s.invoiceNo}\nতারিখ: ${s.date} ${s.time||''}\nকাস্টমার: ${s.customerName}\nমোট: ৳${s.totalAmount}\nবাকি: ৳${s.due}`;
  if (navigator.share) { navigator.share({title:'Invoice', text:t}).catch(()=>{}); }
  else { navigator.clipboard.writeText(t).then(() => showToast('success', 'কপি হয়েছে!', 'যেকোনো অ্যাপে পেস্ট করুন')); }
};

/* ================== EXPORTS ================== */
window.exportSales = () => {
  let c = 'Invoice,Customer,Products,Total,Paid,Due,Date,Time\n';
  window.allSalesCache.forEach(s => { c += `${s.invoiceNo},${s.customerName},${s.name},${s.totalAmount},${s.paid},${s.due},${s.date},${s.time||''}\n`; });
  const b = new Blob(['\uFEFF' + c], {type:'text/csv;charset=utf-8'});
  const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='sales.csv'; a.click(); URL.revokeObjectURL(u);
  showToast('success', 'এক্সপোর্ট হয়েছে', 'sales.csv');
};
window.exportInventory = () => {
  let c = 'Name,Qty,BuyPrice,SellPrice,Profit\n';
  window.inventory.forEach(i => { c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice},${(i.sellPrice-i.buyPrice).toFixed(2)}\n`; });
  const b = new Blob(['\uFEFF' + c], {type:'text/csv;charset=utf-8'});
  const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='inventory.csv'; a.click(); URL.revokeObjectURL(u);
  showToast('success', 'এক্সপোর্ট হয়েছে', 'inventory.csv');
};
window.exportExpenses = () => {
  let c = 'Description,Amount,Date,Time\n';
  window.allExpensesCache.forEach(e => { c += `${e.title},${e.amount},${e.date},${e.time||''}\n`; });
  const b = new Blob(['\uFEFF' + c], {type:'text/csv;charset=utf-8'});
  const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='expenses.csv'; a.click(); URL.revokeObjectURL(u);
  showToast('success', 'এক্সপোর্ট হয়েছে', 'expenses.csv');
};
window.exportMasterList = () => {
  const type = document.getElementById('masterDataType').value;
  let c = '';
  if (type==='all'||type==='sales') { c += '\n=== SALES ===\nInvoice,Customer,Products,Total,Paid,Due,Date,Time\n'; window.allSalesCache.forEach(s => { c += `${s.invoiceNo},${s.customerName},${s.name},${s.totalAmount},${s.paid},${s.due},${s.date},${s.time||''}\n`; }); }
  if (type==='all'||type==='inventory') { c += '\n=== INVENTORY ===\nName,Qty,Buy,Sell\n'; window.inventory.forEach(i => { c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice}\n`; }); }
  if (type==='all'||type==='customers') { c += '\n=== CUSTOMERS ===\nName,Phone,Due,CreatedDate,CreatedTime\n'; window.customers.forEach(x => { const cd = x.createdAt?new Date(x.createdAt):null; c += `${x.name},${x.phone},${x.due},${cd?getDateBn(cd):''},${cd?getTimeBn(cd):''}\n`; }); }
  if (type==='all'||type==='expenses') { c += '\n=== EXPENSES ===\nDesc,Amount,Date,Time\n'; window.allExpensesCache.forEach(e => { c += `${e.title},${e.amount},${e.date},${e.time||''}\n`; }); }
  const b = new Blob(['\uFEFF' + c], {type:'text/csv;charset=utf-8'});
  const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='master-list.csv'; a.click(); URL.revokeObjectURL(u);
  showToast('success', 'এক্সপোর্ট হয়েছে', 'master-list.csv');
};

/* ================== CRUD ================== */
window.addInventory = async () => {
  const n = document.getElementById('addProdName').value.trim();
  const q = document.getElementById('addProdQty').value;
  const b = document.getElementById('addProdBuyPrice').value;
  const s = document.getElementById('addProdSellPrice').value;
  if (!n||q===''||b===''||s==='') { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  if (parseFloat(q) < 0 || parseFloat(b) < 0 || parseFloat(s) < 0) { showToast('error', 'ভুল মান', 'নেগেটিভ মান দেওয়া যাবে না'); return; }
  showLoader(true);
  try {
    const r = push(ref(db, 'users/'+window.currentUser.uid+'/inventory'));
    await set(r, { id: r.key, name: n, qty: q, buyPrice: b, sellPrice: s, createdAt: new Date().toISOString() });
    logActivity('নতুন পণ্য', `${n} যোগ (স্টক: ${q})`);
    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    showToast('success', 'পণ্য যোগ হয়েছে', n);
    ['addProdName','addProdQty','addProdBuyPrice','addProdSellPrice'].forEach(id => document.getElementById(id).value='');
    updateAddProdLive();
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.addCustomer = async () => {
  const n = document.getElementById('addCustName').value.trim();
  const p = document.getElementById('addCustPhone').value.trim();
  const d = document.getElementById('addCustDue').value || 0;
  if (!n||!p) { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  showLoader(true);
  try {
    const r = push(ref(db, 'users/'+window.currentUser.uid+'/customers'));
    await set(r, { id: r.key, name: n, phone: p, due: parseFloat(d), createdAt: new Date().toISOString() });
    logActivity('নতুন কাস্টমার', `${n} - ${p} (প্রাথমিক বাকি: ৳${d})`, parseFloat(d));
    bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
    showToast('success', 'কাস্টমার যোগ হয়েছে', n);
    ['addCustName','addCustPhone','addCustDue'].forEach(id => document.getElementById(id).value='');
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.addExpense = async () => {
  const t = document.getElementById('addExpDesc').value.trim();
  const a = document.getElementById('addExpAmt').value;
  if (!t||!a) { showToast('warning', 'সতর্কতা', 'সব ঘর পূরণ করুন'); return; }
  if (parseFloat(a) <= 0) { showToast('error', 'ভুল পরিমাণ', 'সঠিক পরিমাণ দিন'); return; }
  showLoader(true);
  try {
    const r = push(ref(db, 'users/'+window.currentUser.uid+'/expenses'));
    const now = new Date();
    await set(r, { id: r.key, title: t, amount: a, date: now.toISOString().split('T')[0], time: getTimeBn(now), createdAt: now.toISOString() });
    logActivity('নতুন খরচ', `${t}`, parseFloat(a));
    bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
    showToast('success', 'খরচ যোগ হয়েছে', `${t} - ৳${a}`);
    ['addExpDesc','addExpAmt'].forEach(id => document.getElementById(id).value='');
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.deleteItem = async (col, id) => {
  const confirm = await Swal.fire({ title:'নিশ্চিত?', text:'এই আইটেমটি মুছে ফেলা হবে', icon:'warning', showCancelButton:true, confirmButtonText:'হ্যাঁ, মুছুন', cancelButtonText:'বাতিল', confirmButtonColor:'#ef4444' });
  if (!confirm.isConfirmed) return;
  showLoader(true);
  try {
    await remove(ref(db, 'users/'+window.currentUser.uid+'/'+col+'/'+id));
    logActivity('ডিলিট', `${col} আইটেম মুছে ফেলা হয়েছে`);
    showToast('success', 'মুছে ফেলা হয়েছে');
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

/* ================== DASHBOARD ================== */
window.renderDashboard = (sales) => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('totalSales').textContent = sales.reduce((s,i) => s + parseFloat(i.totalAmount||0), 0).toFixed(2);
  document.getElementById('todaySales').textContent = sales.filter(i => i.date === today).reduce((s,i) => s + parseFloat(i.totalAmount||0), 0).toFixed(2);
  document.getElementById('totalDue').textContent = sales.reduce((s,i) => s + parseFloat(i.due||0), 0).toFixed(2);
  document.getElementById('repDue').textContent = document.getElementById('totalDue').textContent;
  updateChartPeriod(7);
  document.getElementById('repSales').textContent = document.getElementById('totalSales').textContent;
};

window.updateChartPeriod = (days, btn) => {
  if (btn) { btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
  const labels = [], data = [];
  for (let i=days-1; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().split('T')[0];
    labels.push(days === 7 ? ds.slice(5) : ds);
    data.push(window.allSalesCache.filter(s => s.date === ds).reduce((sum,s) => sum + parseFloat(s.totalAmount||0), 0));
  }
  if (window.myChart) window.myChart.destroy();
  const ctx = document.getElementById('salesChart')?.getContext('2d');
  if (!ctx) return;
  window.myChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:'বিক্রয়', data, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4, pointBackgroundColor:'#6366f1', pointRadius:5, pointHoverRadius:8, borderWidth:3 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'}}, x:{grid:{display:false}} } }
  });
};

window.renderInvoices = (sales) => {
  const c = document.getElementById('invoiceCardsContainer');
  if (!c) return;
  c.innerHTML = '';
  sales.slice().reverse().slice(0, 30).forEach(s => {
    c.innerHTML += `<div class="col-md-6 col-lg-4"><div class="card-premium p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div><div class="fw-bold text-primary">${s.invoiceNo}</div>
        <small class="text-muted"><i class="fas fa-calendar me-1"></i>${s.date} ${s.time||''}</small></div>
        <span class="tag ${parseFloat(s.due)>0?'tag-warning':'tag-success'}">${parseFloat(s.due)>0?'বাকি':'পরিশোধিত'}</span>
      </div>
      <div class="mb-2"><small class="text-muted">কাস্টমার:</small> <strong>${s.customerName||'সাধারণ'}</strong></div>
      <div class="d-flex justify-content-between align-items-center">
        <div><small class="text-muted">মোট</small><div class="fw-bold text-primary">৳${s.totalAmount}</div></div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
          <button class="btn btn-sm btn-outline-info" onclick="shareInvoice('${s.id}')"><i class="fas fa-share-alt"></i></button>
        </div>
      </div>
    </div></div>`;
  });
  if (sales.length === 0) c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><h5>কোনো ইনভয়েস নেই</h5></div></div>`;
};

window.filterInvoices = () => {
  const q = (document.getElementById('invoiceSearchFilter')?.value || '').toLowerCase();
  let s = window.allSalesCache;
  if (q) s = s.filter(x => (x.invoiceNo||'').toLowerCase().includes(q) || (x.customerName||'').toLowerCase().includes(q));
  renderInvoices(s);
};

window.updateTotalExpense = (exp) => {
  document.getElementById('totalExpense').textContent = exp.reduce((s,i) => s + parseFloat(i.amount||0), 0).toFixed(2);
  document.getElementById('repExpense').textContent = document.getElementById('totalExpense').textContent;
  const net = parseFloat(document.getElementById('totalSales').textContent) - parseFloat(document.getElementById('totalExpense').textContent);
  document.getElementById('repProfit').textContent = net.toFixed(2);
  document.getElementById('netProfitQuick').textContent = '৳' + net.toFixed(2);
};

window.renderCustomerSelect = () => {
  const s = document.getElementById('customerSelect');
  if (!s) return;
  const curVal = s.value;
  s.innerHTML = '<option value="">সাধারণ কাস্টমার (নগদ)</option>';
  window.customers.forEach(c => { s.innerHTML += `<option value="${c.id}" data-due="${c.due||0}">${c.name} (বাকি:৳${c.due||0})</option>`; });
  if (curVal) s.value = curVal;
  updateCustomerDue();
};

window.updateCustomerDue = () => {
  const s = document.getElementById('customerSelect');
  if (s.selectedIndex > 0) {
    const due = parseFloat(s.options[s.selectedIndex].getAttribute('data-due')) || 0;
    window.currentCustomerDue = due;
    window.currentCustomerId = s.value;
    document.getElementById('customerDueBadge').innerHTML = `<i class="fas fa-exclamation-circle me-1"></i>বাকি: ৳${due}`;
  } else {
    window.currentCustomerDue = 0; window.currentCustomerId = null;
    document.getElementById('customerDueBadge').innerHTML = `<i class="fas fa-check-circle me-1"></i>নগদ বিক্রয়`;
  }
  calculateCartTotal();
};

window.selectProduct = (id) => {
  window.lastSelectedProductId = id;
  const item = window.inventory.find(i => i.id === id);
  if (item) {
    document.getElementById('productSearch').value = item.name;
    document.getElementById('productSearchResults').innerHTML = '';
    showToast('info', 'পণ্য নির্বাচিত', item.name);
  }
};

/* ================== CART ================== */
window.addToCartFromSearch = () => {
  const id = window.lastSelectedProductId;
  if (!id) { showToast('warning', 'সতর্কতা', 'পণ্য নির্বাচন করুন'); return; }
  const item = window.inventory.find(i => i.id === id);
  if (!item) return;
  const qty = parseInt(document.getElementById('productQty').value) || 1;
  if (parseInt(item.qty) < qty) { showToast('error', 'স্টক নেই', `মাত্র ${item.qty}টি আছে`); return; }
  const idx = window.cart.findIndex(i => i.id === id);
  if (idx > -1) window.cart[idx].qty += qty;
  else window.cart.push({ id: item.id, name: item.name, price: parseFloat(item.sellPrice), qty });
  renderCart();
  window.lastSelectedProductId = null;
  document.getElementById('productSearch').value = '';
  document.getElementById('productSearchResults').innerHTML = '';
  document.getElementById('productQty').value = '1';
  showToast('success', 'কার্টে যোগ হয়েছে', `${item.name} × ${qty}`);
};

window.removeFromCart = (i) => { window.cart.splice(i, 1); renderCart(); };
window.clearCart = async () => {
  const r = await Swal.fire({ title:'কার্ট খালি করবেন?', icon:'warning', showCancelButton:true, confirmButtonText:'হ্যাঁ', cancelButtonText:'না', confirmButtonColor:'#ef4444' });
  if (r.isConfirmed) { window.cart = []; renderCart(); showToast('info', 'কার্ট খালি', ''); }
};

window.renderCart = () => {
  const c = document.getElementById('cartItemsList');
  if (!c) return;
  c.innerHTML = '';
  document.getElementById('cartCountBadge').textContent = window.cart.length + ' আইটেম';
  if (window.cart.length === 0) {
    c.innerHTML = `<div class="empty-state py-4"><i class="fas fa-shopping-cart"></i><p class="mb-0">কার্ট খালি — পণ্য যোগ করুন</p></div>`;
    document.getElementById('cartTotal').textContent = '0.00';
    document.getElementById('cartSubtotal').textContent = '0.00';
    document.getElementById('cartDiscount').textContent = '0.00';
    document.getElementById('duePreview').textContent = '৳0.00';
    document.getElementById('completeSaleBtn').disabled = true;
    return;
  }
  let subtotal = 0;
  window.cart.forEach((item, i) => {
    const tot = item.price * item.qty;
    subtotal += tot;
    c.innerHTML += `<div class="cart-item">
      <div><div class="item-name">${item.name}</div><div class="small text-muted">৳${item.price} × ${item.qty}</div></div>
      <div class="d-flex align-items-center gap-2">
        <span class="item-qty">${item.qty}</span>
        <span class="fw-bold">৳${tot.toFixed(2)}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${i})"><i class="fas fa-times"></i></button>
      </div></div>`;
  });
  document.getElementById('cartSubtotal').textContent = subtotal.toFixed(2);
  calculateCartTotal();
};

window.calculateCartTotal = () => {
  const subtotal = parseFloat(document.getElementById('cartSubtotal')?.textContent) || 0;
  const discount = parseFloat(document.getElementById('discountInput')?.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
  const change = Math.max(0, paid - total);
  const due = Math.max(0, total - paid);
  if (document.getElementById('cartDiscount')) document.getElementById('cartDiscount').textContent = discount.toFixed(2);
  if (document.getElementById('cartTotal')) document.getElementById('cartTotal').textContent = total.toFixed(2);
  if (document.getElementById('changeAmount')) document.getElementById('changeAmount').textContent = '৳' + change.toFixed(2);
  if (document.getElementById('duePreview')) document.getElementById('duePreview').textContent = '৳' + due.toFixed(2);
  const cc = document.getElementById('cartLiveCard');
  if (cc) cc.classList.toggle('active', window.cart.length > 0);
  const btn = document.getElementById('completeSaleBtn');
  if (btn) btn.disabled = window.cart.length === 0;
  const s1 = document.getElementById('step1');
  const s2 = document.getElementById('step2');
  if (s1) s1.classList.toggle('done', window.cart.length > 0);
  if (s2) s2.classList.toggle('active', window.cart.length > 0);
};

window.completeSale = async () => {
  if (window.cart.length === 0) { showToast('warning', 'সতর্কতা', 'কার্ট খালি'); return; }
  const s = document.getElementById('customerSelect');
  const cId = s.value;
  const cDue = parseFloat(s.options[s.selectedIndex]?.getAttribute('data-due')) || 0;
  const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
  const discount = parseFloat(document.getElementById('discountInput').value) || 0;
  const subtotal = parseFloat(document.getElementById('cartSubtotal').textContent);
  const total = Math.max(0, subtotal - discount);
  const due = Math.max(0, total - paid);
  if (due > 0 && !cId) { showToast('warning', 'সতর্কতা', 'বাকিতে বিক্রি করতে কাস্টমার নির্বাচন করুন'); return; }
  const confirm = await Swal.fire({
    title: 'বিক্রয় নিশ্চিত করুন',
    html: `<div style="text-align:left;font-size:0.95rem;">
      <div style="padding:4px 0;"><strong>মোট:</strong> ৳${total.toFixed(2)}</div>
      <div style="padding:4px 0;"><strong>পরিশোধিত:</strong> ৳${paid.toFixed(2)}</div>
      <div style="padding:4px 0;"><strong>বাকি:</strong> ৳${due.toFixed(2)}</div>
      <div style="padding:4px 0;"><strong>পরিবর্তন:</strong> ৳${Math.max(0, paid-total).toFixed(2)}</div>
    </div>`,
    icon: 'question', showCancelButton: true, confirmButtonText: 'হ্যাঁ, সম্পন্ন করুন', cancelButtonText: 'বাতিল', confirmButtonColor: '#10b981'
  });
  if (!confirm.isConfirmed) return;
  showLoader(true);
  try {
    const r = push(ref(db, 'users/'+window.currentUser.uid+'/sales'));
    const cName = s.options[s.selectedIndex]?.text || 'সাধারণ কাস্টমার';
    const now = new Date();
    const invoiceNo = 'INV-'+Date.now().toString().slice(-6);
    await set(r, {
      id: r.key, invoiceNo,
      name: window.cart.map(i => i.name).join(', '),
      qty: window.cart.reduce((a,b) => a + b.qty, 0),
      totalAmount: total, paid, due,
      customerId: cId, customerName: cName,
      date: now.toISOString().split('T')[0],
      time: getTimeBn(now),
      createdAt: now.toISOString()
    });
    if (due > 0 && cId) await update(ref(db, 'users/'+window.currentUser.uid+'/customers/'+cId), { due: cDue + due });
    for (const item of window.cart) {
      const inv = window.inventory.find(i => i.id === item.id);
      if (inv) await update(ref(db, 'users/'+window.currentUser.uid+'/inventory/'+inv.id), { qty: parseInt(inv.qty) - item.qty });
    }
    logActivity('বিক্রয়', `${cName} - ${window.cart.map(i=>i.name).join(', ')}`, total, {
      customerName: cName, invoiceNo
    });
    window.cart = [];
    renderCart();
    document.getElementById('paidAmount').value = '';
    document.getElementById('discountInput').value = '0';
    showToast('success', 'বিক্রয় সফল!', `মোট: ৳${total.toFixed(2)}`);
  } catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

/* ================== QUICK STATS ================== */
function updateQuickStats() {
  document.getElementById('totalProducts').textContent = window.inventory.length;
  document.getElementById('totalCustomers').textContent = window.customers.length;
  document.getElementById('lowStockCount').textContent = window.inventory.filter(i => parseInt(i.qty) <= 5).length;
  updateNotifDot();
}

window.renderLowStock = () => {
  const l = document.getElementById('lowStockList');
  if (!l) return;
  l.innerHTML = '';
  window.inventory.filter(i => parseInt(i.qty) <= 5).forEach(i => {
    l.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center px-0"><span><i class="fas fa-box text-danger me-2"></i>${i.name}</span><span class="tag tag-danger">${i.qty} বাকি</span></li>`;
  });
  if (l.innerHTML === '') l.innerHTML = '<li class="list-group-item text-muted px-0">✅ কোনো সতর্কতা নেই</li>';
};

window.renderRecentTransactions = (sales) => {
  const l = document.getElementById('recentTransactions');
  if (!l) return;
  l.innerHTML = '';
  if (sales.length === 0) { l.innerHTML = '<li class="list-group-item text-muted px-0">কোনো লেনদেন নেই</li>'; return; }
  sales.slice().reverse().slice(0, 5).forEach(s => {
    l.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center px-0"><span><i class="fas fa-receipt text-primary me-2"></i>${s.invoiceNo}<br><small class="text-muted">${s.date} ${s.time||''}</small></span><span class="fw-bold">৳${s.totalAmount}</span></li>`;
  });
};

/* ================== ANALYTICS & REPORTS ================== */
function renderAnalytics(sales) {
  const pc = {};
  sales.forEach(s => { (s.name ? s.name.split(', ') : []).forEach(n => { pc[n] = (pc[n]||0)+1; }); });
  const top = Object.entries(pc).sort((a,b) => b[1]-a[1]).slice(0, 5);
  if (window.categoryChart) window.categoryChart.destroy();
  const cc = document.getElementById('categoryChart')?.getContext('2d');
  if (cc) window.categoryChart = new Chart(cc, {
    type:'doughnut',
    data:{ labels: top.map(p=>p[0]), datasets:[{ data: top.map(p=>p[1]), backgroundColor:['#6366f1','#06b6d4','#f43f5e','#f59e0b','#10b981'], borderWidth:2 }] },
    options:{ responsive:true, maintainAspectRatio:false }
  });
  const paid = sales.reduce((s,i) => s + parseFloat(i.paid||0), 0);
  const due = sales.reduce((s,i) => s + parseFloat(i.due||0), 0);
  if (window.paymentChart) window.paymentChart.destroy();
  const pc2 = document.getElementById('paymentChart')?.getContext('2d');
  if (pc2) window.paymentChart = new Chart(pc2, {
    type:'pie',
    data:{ labels:['পরিশোধিত','বাকি'], datasets:[{ data:[paid,due], backgroundColor:['#10b981','#ef4444'], borderWidth:2 }] },
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

function renderReports(sales) {
  const exp = window.allExpensesCache;
  const ts = sales.reduce((s,i) => s + parseFloat(i.totalAmount||0), 0);
  const te = exp.reduce((s,e) => s + parseFloat(e.amount||0), 0);
  document.getElementById('repSales').textContent = ts.toFixed(2);
  document.getElementById('repExpense').textContent = te.toFixed(2);
  document.getElementById('repProfit').textContent = (ts-te).toFixed(2);
  const months = {};
  sales.forEach(s => { const m = s.date?.slice(0,7); if (m) months[m] = (months[m]||0) + parseFloat(s.totalAmount||0); });
  const ml = Object.keys(months).sort().slice(-6);
  if (window.monthlyReportChart) window.monthlyReportChart.destroy();
  const mc = document.getElementById('monthlyReportChart')?.getContext('2d');
  if (mc) window.monthlyReportChart = new Chart(mc, {
    type:'bar',
    data:{ labels: ml, datasets:[{ label:'মাসিক বিক্রয়', data: ml.map(m=>months[m]), backgroundColor:'rgba(99,102,241,0.7)', borderRadius:8 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
  const em = {};
  exp.forEach(e => { const m = e.date?.slice(0,7); if (m) em[m] = (em[m]||0) + parseFloat(e.amount||0); });
  if (window.profitChart) window.profitChart.destroy();
  const pc = document.getElementById('profitChart')?.getContext('2d');
  if (pc) window.profitChart = new Chart(pc, {
    type:'line',
    data:{ labels: ml, datasets:[
      { label:'আয়', data: ml.map(m=>months[m]||0), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.4 },
      { label:'খরচ', data: ml.map(m=>em[m]||0), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.1)', fill:true, tension:0.4 }
    ]},
    options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true}} }
  });
}

/* ================== MASTER LIST ================== */
window.renderMasterList = () => {
  const type = document.getElementById('masterDataType')?.value || 'all';
  const q = (document.getElementById('masterSearchFilter')?.value || '').toLowerCase();
  const th = document.getElementById('masterTableHead');
  const tb = document.getElementById('masterTableBody');
  if (!th || !tb) return;
  let headers = [], rows = [];
  if (type==='all'||type==='sales') {
    window.allSalesCache.forEach(s => {
      if (q && !(s.invoiceNo||'').toLowerCase().includes(q) && !(s.customerName||'').toLowerCase().includes(q)) return;
      rows.push(['<span class="tag tag-primary">বিক্রয়</span>', s.invoiceNo, s.customerName, '৳'+s.totalAmount, s.date, s.time||'—']);
    });
  }
  if (type==='all'||type==='inventory') {
    window.inventory.forEach(p => {
      if (q && !p.name.toLowerCase().includes(q)) return;
      const cdate = p.createdAt?new Date(p.createdAt):null;
      rows.push(['<span class="tag tag-success">পণ্য</span>', p.name, p.qty, '৳'+p.buyPrice, '৳'+p.sellPrice, cdate?getTimeBn(cdate):'—']);
    });
  }
  if (type==='all'||type==='customers') {
    window.customers.forEach(c => {
      if (q && !c.name.toLowerCase().includes(q)) return;
      const cdate = c.createdAt?new Date(c.createdAt):null;
      rows.push(['<span class="tag tag-info">কাস্টমার</span>', c.name, c.phone, '৳'+(c.due||0), cdate?getDateBn(cdate):'—', cdate?getTimeBn(cdate):'—']);
    });
  }
  if (type==='all'||type==='expenses') {
    window.allExpensesCache.forEach(e => {
      if (q && !e.title.toLowerCase().includes(q)) return;
      rows.push(['<span class="tag tag-danger">খরচ</span>', e.title, '৳'+e.amount, e.date, e.time||'—', '']);
    });
  }
  if (type==='all') headers = ['টাইপ','বিবরণ','নাম/নম্বর','পরিমাণ','তারিখ','সময়'];
  else if (type==='sales') headers = ['টাইপ','ইনভয়েস','কাস্টমার','মোট','তারিখ','সময়'];
  else if (type==='inventory') headers = ['টাইপ','পণ্য','স্টক','ক্রয়','বিক্রয়','সময়'];
  else if (type==='customers') headers = ['টাইপ','নাম','ফোন','বাকি','তারিখ','সময়'];
  else if (type==='expenses') headers = ['টাইপ','বিবরণ','টাকা','তারিখ','সময়',''];
  th.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  tb.innerHTML = rows.length === 0
    ? `<tr><td colspan="${headers.length}" class="text-center text-muted py-4">কোনো ডেটা নেই</td></tr>`
    : rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
};

/* ================== ADMIN ================== */
function loadAllUsers() {
  const unsub = onValue(ref(db, 'users'), (snap) => {
    const users = snap.val() ? Object.values(snap.val()) : [];
    window.allUsersCache = users;
    renderAdminAllUsers(users);
    renderAdminUserStats(users);
    populateAdminUserSelect(users);
    renderUsersList(users);
  }, (err) => console.error('Users error:', err));
  window.unsubscribers.push(unsub);
}

function renderAdminAllUsers(users) {
  const t = document.getElementById('adminAllUsersList');
  if (!t) return;
  t.innerHTML = '';
  users.forEach(u => {
    const cur = u.uid === window.currentUser.uid;
    const rb = u.role === 'Admin' ? 'tag-warning' : u.role === 'Manager' ? 'tag-primary' : 'tag-success';
    const cdate = u.createdAt ? new Date(u.createdAt) : null;
    t.innerHTML += `<tr><td>${u.fullName||'—'}</td><td>${u.email}</td>
      <td><span class="tag ${rb}">${u.role||'Staff'}</span></td>
      <td>${cdate?getDateBn(cdate):'—'}</td>
      <td>${cdate?getTimeBn(cdate):'—'}</td>
      <td>${cur ? '<span class="text-muted small">আপনি</span>' : `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u.uid}')"><i class="fas fa-trash"></i></button>`}</td></tr>`;
  });
}

function renderAdminUserStats(users) {
  const c = document.getElementById('adminUserStats');
  if (!c) return;
  c.innerHTML = `
    <div class="col-6"><div class="stat-mini"><small>মোট ইউজার</small><h5>${users.length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>অ্যাডমিন</small><h5>${users.filter(u => u.role==='Admin').length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>ম্যানেজার</small><h5>${users.filter(u => u.role==='Manager').length}</h5></div></div>
    <div class="col-6"><div class="stat-mini"><small>স্টাফ</small><h5>${users.filter(u => u.role==='Staff'||!u.role).length}</h5></div></div>`;
}

function populateAdminUserSelect(users) {
  const s = document.getElementById('adminSelectUser');
  if (!s) return;
  s.innerHTML = '<option value="">— নির্বাচন করুন —</option>';
  users.forEach(u => { if (u.uid !== window.currentUser.uid) s.innerHTML += `<option value="${u.uid}">${u.fullName||u.email} (${u.role||'Staff'})</option>`; });
}

function renderUsersList(users) {
  const t = document.getElementById('usersList');
  if (!t) return;
  t.innerHTML = '';
  users.forEach(u => {
    const rb = u.role === 'Admin' ? 'tag-warning' : u.role === 'Manager' ? 'tag-primary' : 'tag-success';
    const cdate = u.createdAt ? new Date(u.createdAt) : null;
    t.innerHTML += `<tr><td><strong>${u.fullName||'—'}</strong></td><td>${u.email}</td>
      <td><span class="tag ${rb}">${u.role||'Staff'}</span></td>
      <td><span class="tag ${u.status==='Active'?'tag-success':'tag-danger'}">${u.status||'Active'}</span></td>
      <td>${cdate?getDateBn(cdate):'—'}</td>
      <td>${cdate?getTimeBn(cdate):'—'}</td>
      <td>${u.uid === window.currentUser.uid ? '<span class="text-muted small">আপনি</span>' : `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u.uid}')"><i class="fas fa-trash"></i></button>`}</td></tr>`;
  });
}

window.updateUserRole = async () => {
  const id = document.getElementById('adminSelectUser').value;
  const role = document.getElementById('adminSelectRole').value;
  if (!id) { showToast('warning', 'সতর্কতা', 'ইউজার নির্বাচন করুন'); return; }
  showLoader(true);
  try { await update(ref(db, 'users/'+id), { role }); showToast('success', 'রোল আপডেট হয়েছে', `নতুন রোল: ${role}`); }
  catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

window.deleteUser = async (uid) => {
  const c = await Swal.fire({ title:'নিশ্চিত?', text:'ইউজার মুছে ফেলা হবে', icon:'warning', showCancelButton:true, confirmButtonText:'হ্যাঁ, মুছুন', cancelButtonText:'বাতিল', confirmButtonColor:'#ef4444' });
  if (!c.isConfirmed) return;
  showLoader(true);
  try { await remove(ref(db, 'users/'+uid)); showToast('success', 'ইউজার মুছে ফেলা হয়েছে'); }
  catch(e) { showToast('error', 'ব্যর্থ', e.message); }
  showLoader(false);
};

/* ================== NAV ================== */
window.toggleSidebar = () => {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('overlay').classList.toggle('show');
};
window.closeSidebar = () => {
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
};

window.showSection = (sec) => {
  document.querySelectorAll('.main-content > div').forEach(d => d.style.display = 'none');
  const s = document.getElementById(sec+'-section');
  if (s) { s.style.display = 'block'; s.classList.add('fade-in'); }
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  const nav = document.getElementById('nav-'+sec);
  if (nav) nav.classList.add('active');
  const titles = {
    dashboard:'ড্যাশবোর্ড', sales:'নতুন বিক্রয় (POS)', 'sales-list':'বিক্রয় তালিকা',
    inventory:'পণ্য কার্ড', 'inventory-list':'পণ্য টেবিল', customers:'কাস্টমার',
    expenses:'খরচ ব্যবস্থাপনা', 'expenses-list':'খরচ তালিকা', invoices:'ইনভয়েস',
    'master-list':'অ্যাডভান্সড লিস্ট', 'activity-log':'অ্যাক্টিভিটি লগ',
    reports:'রিপোর্টস', analytics:'অ্যানালিটিক্স',
    admin:'অ্যাডমিন কন্ট্রোল', users:'টিম মেম্বার'
  };
  document.getElementById('pageTitle').textContent = titles[sec] || 'ড্যাশবোর্ড';
  if (sec==='sales'||sec==='sales-list') document.getElementById('salesSubmenu')?.classList.add('show');
  if (sec==='inventory'||sec==='inventory-list') document.getElementById('inventorySubmenu')?.classList.add('show');
  if (sec==='expenses'||sec==='expenses-list') document.getElementById('expensesSubmenu')?.classList.add('show');
  if (sec==='activity-log') { renderActivityLogAdvanced(); updateActivityStats(); }
  closeSidebar();
};

/* ================== SEARCH & NOTIF ================== */
window.globalSearch = () => {
  const q = document.getElementById('globalSearchInput').value.toLowerCase();
  if (!q || q.length < 2) return;
  const ps = window.inventory.filter(i => i.name.toLowerCase().includes(q));
  const cs = window.customers.filter(c => c.name.toLowerCase().includes(q));
  let html = '';
  if (ps.length) html += `<div class="text-start mb-2"><strong>📦 পণ্য:</strong><br>${ps.slice(0,5).map(p => `${p.name} — স্টক: ${p.qty}, মূল্য: ৳${p.sellPrice}`).join('<br>')}</div>`;
  if (cs.length) html += `<div class="text-start"><strong>👥 কাস্টমার:</strong><br>${cs.slice(0,5).map(c => `${c.name} — বাকি: ৳${c.due}`).join('<br>')}</div>`;
  if (html) Swal.fire({ title:'সার্চ রেজাল্ট', html, icon:'info' });
  else Swal.fire({ title:'কিছু পাওয়া যায়নি', icon:'info' });
};

window.showNotifications = () => {
  const ls = window.inventory.filter(i => parseInt(i.qty) <= 5);
  const dc = window.customers.filter(c => parseFloat(c.due) > 0);
  Swal.fire({
    title:'🔔 নোটিফিকেশন',
    html: `<div class="text-start">
      <div class="mb-2"><i class="fas fa-exclamation-triangle text-warning me-2"></i>স্টক কম: <strong>${ls.length}</strong>টি পণ্য</div>
      <div class="mb-2"><i class="fas fa-hand-holding-usd text-danger me-2"></i>বাকি আছে: <strong>${dc.length}</strong>জন কাস্টমার</div>
      <div><i class="fas fa-chart-line text-info me-2"></i>আজকের বিক্রি: <strong>৳${document.getElementById('todaySales')?.textContent || '0'}</strong></div>
    </div>`,
    confirmButtonText:'ঠিক আছে'
  });
};

window.showUserMenu = () => {
  Swal.fire({
    title:'প্রোফাইল',
    html: `<div class="text-center"><div style="font-size:3rem;margin-bottom:10px;">👤</div>
      <h5>${window.currentUser?.email||'User'}</h5>
      <p class="text-muted mb-1">রোল: <strong>${window.currentUserRole}</strong></p>
      <p class="text-muted mb-1">দোকান: ${window.currentUserShopName||'—'}</p>
      <p class="text-muted">ঠিকানা: ${window.currentUserAddress||'—'}</p></div>`,
    showCancelButton:true, confirmButtonText:'লগ আউট', cancelButtonText:'বাতিল', confirmButtonColor:'#ef4444'
  }).then(r => { if (r.isConfirmed) logout(); });
};

/* ================== ENTER KEY ================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && loginForm.style.display !== 'none') login();
    else if (registerForm && registerForm.style.display !== 'none') register();
  }
});

/* ================== DOM READY ================== */
document.addEventListener('DOMContentLoaded', () => {
  const paid = document.getElementById('paidAmount');
  const disc = document.getElementById('discountInput');
  if (paid) paid.addEventListener('input', calculateCartTotal);
  if (disc) disc.addEventListener('input', calculateCartTotal);
});
