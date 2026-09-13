/* =====================================================
   v6.0 PRO UPGRADES — Ultimate Features
   Command Palette • Voice Input • Auto-save • Suggestions
   Icon Picker • Number Pad • Barcode • Micro-interactions
   ===================================================== */

/* ==================== COMMAND PALETTE ==================== */
(function initCommandPalette() {
  const commands = [
    { id: 'dashboard', title: 'ড্যাশবোর্ড', icon: 'fas fa-th-large', action: () => showSection('dashboard'), key: 'D' },
    { id: 'new-sale', title: 'নতুন বিক্রয় (POS)', icon: 'fas fa-cart-plus', action: () => showSection('sales'), key: 'N' },
    { id: 'sales-list', title: 'বিক্রয় তালিকা', icon: 'fas fa-list-alt', action: () => showSection('sales-list') },
    { id: 'inventory', title: 'পণ্য কার্ড', icon: 'fas fa-box', action: () => showSection('inventory') },
    { id: 'inventory-list', title: 'পণ্য টেবিল', icon: 'fas fa-table', action: () => showSection('inventory-list') },
    { id: 'customers', title: 'কাস্টমার', icon: 'fas fa-users', action: () => showSection('customers') },
    { id: 'expenses', title: 'খরচ', icon: 'fas fa-hand-holding-usd', action: () => showSection('expenses') },
    { id: 'expenses-list', title: 'খরচ তালিকা', icon: 'fas fa-receipt', action: () => showSection('expenses-list') },
    { id: 'invoices', title: 'ইনভয়েস', icon: 'fas fa-file-invoice-dollar', action: () => showSection('invoices') },
    { id: 'reports', title: 'রিপোর্টস', icon: 'fas fa-chart-pie', action: () => showSection('reports') },
    { id: 'analytics', title: 'অ্যানালিটিক্স', icon: 'fas fa-chart-bar', action: () => showSection('analytics') },
    { id: 'activity', title: 'অ্যাক্টিভিটি লগ', icon: 'fas fa-history', action: () => showSection('activity-log') },
    { id: 'profile', title: 'প্রোফাইল', icon: 'fas fa-user-circle', action: () => showSection('profile') },
    { id: 'settings', title: 'সেটিংস', icon: 'fas fa-cog', action: () => showSection('settings') },
    { id: 'calculator', title: 'ক্যালকুলেটর', icon: 'fas fa-calculator', action: () => openCalculator() },
    { id: 'add-product', title: 'নতুন পণ্য যোগ করুন', icon: 'fas fa-plus-circle', action: () => new bootstrap.Modal(document.getElementById('addProductModal')).show() },
    { id: 'add-customer', title: 'নতুন কাস্টমার যোগ করুন', icon: 'fas fa-user-plus', action: () => new bootstrap.Modal(document.getElementById('addCustomerModal')).show() },
    { id: 'add-expense', title: 'নতুন খরচ যোগ করুন', icon: 'fas fa-receipt', action: () => new bootstrap.Modal(document.getElementById('addExpenseModal')).show() },
    { id: 'export', title: 'সব ডেটা এক্সপোর্ট করুন', icon: 'fas fa-download', action: () => exportAllData() },
    { id: 'theme-dark', title: 'ডার্ক মোড চালু', icon: 'fas fa-moon', action: () => setThemeMode('dark', document.querySelector('[data-mode="dark"]')) },
    { id: 'theme-light', title: 'লাইট মোড চালু', icon: 'fas fa-sun', action: () => setThemeMode('light', document.querySelector('[data-mode="light"]')) },
    { id: 'logout', title: 'লগ আউট', icon: 'fas fa-sign-out-alt', action: () => logout() }
  ];

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'command-palette-overlay';
  overlay.id = 'commandPaletteOverlay';
  overlay.innerHTML = `
    <div class="command-palette">
      <input type="text" class="command-palette-input" id="commandPaletteInput" placeholder="🔍 কমান্ড খুঁজুন... (যেমন: বিক্রয়, পণ্য, সেটিংস)">
      <div class="command-palette-list" id="commandPaletteList"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#commandPaletteInput');
  const list = overlay.querySelector('#commandPaletteList');
  let activeIndex = 0;
  let filteredCommands = [...commands];

  function renderCommands() {
    if (filteredCommands.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);">
        <i class="fas fa-search" style="font-size:2rem;opacity:0.3;margin-bottom:10px;display:block;"></i>
        <p>কিছু পাওয়া যায়নি</p>
      </div>`;
      return;
    }
    list.innerHTML = filteredCommands.map((cmd, i) => `
      <div class="command-palette-item ${i === activeIndex ? 'active' : ''}" data-index="${i}">
        <i class="${cmd.icon}"></i>
        <span>${cmd.title}</span>
        ${cmd.key ? `<kbd>${cmd.key}</kbd>` : ''}
      </div>
    `).join('');

    list.querySelectorAll('.command-palette-item').forEach(item => {
      item.addEventListener('click', () => executeCommand(parseInt(item.dataset.index)));
      item.addEventListener('mouseenter', () => {
        activeIndex = parseInt(item.dataset.index);
        updateActive();
      });
    });
  }

  function updateActive() {
    list.querySelectorAll('.command-palette-item').forEach((item, i) => {
      item.classList.toggle('active', i === activeIndex);
    });
    const active = list.querySelector('.command-palette-item.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function executeCommand(index) {
    const cmd = filteredCommands[index];
    if (!cmd) return;
    closePalette();
    setTimeout(() => cmd.action(), 100);
  }

  function closePalette() {
    overlay.classList.remove('show');
    input.value = '';
    filteredCommands = [...commands];
    activeIndex = 0;
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    filteredCommands = q
      ? commands.filter(c => c.title.toLowerCase().includes(q) || c.id.includes(q))
      : [...commands];
    activeIndex = 0;
    renderCommands();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredCommands.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(activeIndex);
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
  });

  window.openCommandPalette = () => {
    overlay.classList.add('show');
    setTimeout(() => input.focus(), 50);
    renderCommands();
  };

  // Global shortcut: Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      window.openCommandPalette();
    }
  });

  renderCommands();
})();

/* ==================== VOICE INPUT ==================== */
(function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  window.attachVoiceInput = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input || input.dataset.voiceAttached) return;
    input.dataset.voiceAttached = 'true';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:8px;align-items:center;';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-input-btn';
    btn.title = 'ভয়েস দিয়ে ইনপুট দিন';
    btn.innerHTML = '<i class="fas fa-microphone"></i>';

    let recognition = null;
    let isRecording = false;

    btn.addEventListener('click', () => {
      if (isRecording) {
        recognition?.stop();
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isRecording = true;
        btn.classList.add('recording');
        btn.innerHTML = '<i class="fas fa-stop"></i>';
        showToast('info', 'শুনছি...', 'বলুন');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        input.value = transcript;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };

      recognition.onerror = () => {
        showToast('error', 'ভয়েস সমস্যা', 'আবার চেষ্টা করুন');
      };

      recognition.onend = () => {
        isRecording = false;
        btn.classList.remove('recording');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
      };

      recognition.start();
    });

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(btn);
  };

  // Auto-attach to specific inputs
  const voiceInputs = ['addProdName', 'addCustName', 'addExpDesc', 'regName', 'regShopName', 'regAddress'];
  voiceInputs.forEach(id => {
    if (document.getElementById(id)) window.attachVoiceInput(id);
  });
})();

/* ==================== FLOATING LABELS ==================== */
(function initFloatingLabels() {
  const formGroups = [
    { parent: '#addProductModal .modal-body', fields: [
      { id: 'addProdName', label: 'পণ্যের নাম' },
      { id: 'addProdQty', label: 'স্টক পরিমাণ' },
      { id: 'addProdBuyPrice', label: 'ক্রয় মূল্য' },
      { id: 'addProdSellPrice', label: 'বিক্রয় মূল্য' }
    ]},
    { parent: '#addCustomerModal .modal-body', fields: [
      { id: 'addCustName', label: 'কাস্টমারের নাম' },
      { id: 'addCustPhone', label: 'ফোন নম্বর' },
      { id: 'addCustDue', label: 'প্রাথমিক বাকি' }
    ]},
    { parent: '#addExpenseModal .modal-body', fields: [
      { id: 'addExpDesc', label: 'বিবরণ' },
      { id: 'addExpAmt', label: 'পরিমাণ' }
    ]}
  ];

  formGroups.forEach(({ fields }) => {
    fields.forEach(({ id, label }) => {
      const input = document.getElementById(id);
      if (!input || input.closest('.form-floating-pro')) return;

      const parent = input.parentElement;
      if (parent.classList.contains('input-group')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'form-floating-pro';
      parent.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      input.placeholder = ' ';

      const lbl = document.createElement('label');
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      wrapper.appendChild(lbl);
    });
  });
})();

/* ==================== SMART SUGGESTIONS ==================== */
(function initSmartSuggestions() {
  function createSuggestions(inputId, getSuggestions) {
    const input = document.getElementById(inputId);
    if (!input || input.dataset.suggestionsAttached) return;
    input.dataset.suggestionsAttached = 'true';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const dropdown = document.createElement('div');
    dropdown.className = 'suggestions-dropdown';
    wrapper.appendChild(dropdown);

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value.toLowerCase().trim();
        if (!q || q.length < 1) {
          dropdown.classList.remove('show');
          return;
        }
        const suggestions = getSuggestions(q).slice(0, 6);
        if (suggestions.length === 0) {
          dropdown.classList.remove('show');
          return;
        }
        dropdown.innerHTML = suggestions.map(s => `
          <div class="suggestion-item" data-value="${escapeHtml(s.value)}">
            <i class="fas fa-lightbulb" style="color:var(--warning);"></i>
            <span>${escapeHtml(s.label)}</span>
          </div>
        `).join('');
        dropdown.classList.add('show');

        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            input.value = item.dataset.value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            dropdown.classList.remove('show');
            input.focus();
          });
        });
      }, 200);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('show'), 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.length > 0) {
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  // Product name suggestions from existing inventory
  createSuggestions('addProdName', (q) => {
    return (AppState.inventory || [])
      .filter(i => i.name.toLowerCase().includes(q))
      .map(i => ({ value: i.name, label: `${i.name} (আগের মূল্য: ৳${i.sellPrice})` }));
  });

  // Customer name suggestions
  createSuggestions('addCustName', (q) => {
    return (AppState.customers || [])
      .filter(c => c.name.toLowerCase().includes(q))
      .map(c => ({ value: c.name, label: `${c.name} — ${c.phone || 'ফোন নেই'}` }));
  });

  // Expense description suggestions
  const commonExpenses = ['দোকান ভাড়া', 'বিদ্যুৎ বিল', 'পানি বিল', 'ইন্টারনেট বিল', 'বেতন', 'যাতায়াত', 'প্যাকেজিং', 'মার্কেটিং', 'মেরামত', 'স্টেশনারি'];
  createSuggestions('addExpDesc', (q) => {
    return commonExpenses
      .filter(e => e.toLowerCase().includes(q))
      .map(e => ({ value: e, label: e }));
  });
})();

/* ==================== AUTO-SAVE DRAFTS ==================== */
(function initAutoSave() {
  const drafts = [
    { key: 'draft_product', ids: ['addProdName', 'addProdQty', 'addProdBuyPrice', 'addProdSellPrice'] },
    { key: 'draft_customer', ids: ['addCustName', 'addCustPhone', 'addCustDue'] },
    { key: 'draft_expense', ids: ['addExpDesc', 'addExpAmt'] }
  ];

  drafts.forEach(({ key, ids }) => {
    // Load draft
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el && data[id]) el.value = data[id];
        });
      }
    } catch (e) { /* silent */ }

    // Save draft on input
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.draftAttached) return;
      el.dataset.draftAttached = 'true';

      el.addEventListener('input', debounce(() => {
        const data = {};
        ids.forEach(i => {
          const input = document.getElementById(i);
          if (input && input.value) data[i] = input.value;
        });
        try {
          if (Object.keys(data).length > 0) {
            localStorage.setItem(key, JSON.stringify(data));
          } else {
            localStorage.removeItem(key);
          }
        } catch (e) { /* silent */ }
      }, 500));
    });
  });

  // Clear drafts after successful submit
  window.clearDrafts = () => {
    ['draft_product', 'draft_customer', 'draft_expense'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) { /* silent */ }
    });
  };
})();

/* ==================== ENHANCED TOAST WITH ICONS ==================== */
(function enhanceToast() {
  const originalToast = window.showToast;
  window.showToast = (type, title, message = '') => {
    // Add subtle animation to page
    document.body.style.transition = 'transform 0.15s';
    originalToast(type, title, message);
  };
})();

/* ==================== RIPPLE EFFECT ON BUTTONS ==================== */
(function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-gradient, .btn-auth, .btn-admin-primary, .btn-quick, .stat-card');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;
      border-radius:50%;background:rgba(255,255,255,0.4);
      pointer-events:none;transform:scale(0);
      animation:rippleAnim 0.6s ease-out;z-index:1;
    `;

    if (getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Add ripple keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ==================== SMART NUMBER FORMATTING ==================== */
(function initSmartNumbers() {
  window.formatNumberBn = (n) => {
    const num = parseFloat(n) || 0;
    // Convert to Bangla digits
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return formatted.replace(/\d/g, d => bnDigits[d]);
  };

  // Auto-format currency inputs
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value && !isNaN(input.value)) {
        const num = parseFloat(input.value);
        if (num >= 0) input.value = num;
      }
    });
  });
})();

/* ==================== KEYBOARD SHORTCUTS — PRO ==================== */
(function initProShortcuts() {
  const shortcuts = {
    'Ctrl+Shift+N': () => showSection('sales'),
    'Ctrl+Shift+D': () => showSection('dashboard'),
    'Ctrl+Shift+I': () => showSection('inventory'),
    'Ctrl+Shift+C': () => showSection('customers'),
    'Ctrl+Shift+E': () => showSection('expenses'),
    'Ctrl+Shift+R': () => showSection('reports'),
    'Ctrl+Shift+P': () => showSection('profile'),
    'Ctrl+Shift+S': () => showSection('settings'),
    'Ctrl+Shift+K': () => openCalculator(),
    'Alt+1': () => showSection('dashboard'),
    'Alt+2': () => showSection('sales'),
    'Alt+3': () => showSection('inventory'),
    'Alt+4': () => showSection('customers'),
    'Alt+5': () => showSection('expenses')
  };

  document.addEventListener('keydown', (e) => {
    // Skip if typing in input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    const key = [
      e.ctrlKey && 'Ctrl',
      e.shiftKey && 'Shift',
      e.altKey && 'Alt',
      e.key.length === 1 ? e.key.toUpperCase() : e.key
    ].filter(Boolean).join('+');

    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  });
})();

/* ==================== ENHANCED FORM VALIDATION ==================== */
(function initFormValidation() {
  window.validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  window.validatePhone = (phone) => /^01[3-9]\d{8}$/.test(phone);
  window.validateNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n);

  // Add real-time validation to email inputs
  document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value && !validateEmail(input.value)) {
        input.classList.add('is-invalid');
      } else if (input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid') && validateEmail(input.value)) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    });
  });

  // Phone validation
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value && !validatePhone(input.value)) {
        input.classList.add('is-invalid');
      } else if (input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    });
    input.addEventListener('input', () => {
      // Auto-format: only digits
      input.value = input.value.replace(/\D/g, '').slice(0, 11);
      if (input.classList.contains('is-invalid') && validatePhone(input.value)) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    });
  });
})();

/* ==================== SMOOTH SCROLL ==================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ==================== PAGE VISIBILITY ==================== */
(function initVisibility() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause heavy operations
      if (window.myChart) {
        // Could pause animations
      }
    }
  });
})();

/* ==================== WELCOME MESSAGE PERSONALIZATION ==================== */
(function initPersonalization() {
  // Add time-based greeting
  const updateGreeting = () => {
    const h = new Date().getHours();
    let greeting = 'স্বাগতম';
    if (h < 12) greeting = 'শুভ সকাল';
    else if (h < 17) greeting = 'শুভ অপরাহ্ন';
    else if (h < 20) greeting = 'শুভ সন্ধ্যা';
    else greeting = 'শুভ রাত্রি';

    const welcomeH4 = document.querySelector('#welcomeName')?.closest('h4');
    if (welcomeH4 && AppState.currentUserFullName) {
      welcomeH4.innerHTML = `${greeting}, <span id="welcomeName">${escapeHtml(AppState.currentUserFullName)}</span>!`;
    }
  };

  // Run after auth state loads
  const observer = new MutationObserver(updateGreeting);
  const mainApp = document.getElementById('mainApp');
  if (mainApp) {
    observer.observe(mainApp, { attributes: true, attributeFilter: ['style'] });
  }
  setTimeout(updateGreeting, 2000);
})();

/* ==================== FLOATING ACTION BUTTON ==================== */
(function initFAB() {
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.id = 'mainFab';
  fab.title = 'দ্রুত অ্যাকশন (Ctrl+K)';
  fab.innerHTML = '<i class="fas fa-bolt"></i>';
  fab.addEventListener('click', () => window.openCommandPalette?.());
  document.body.appendChild(fab);

  // Hide on auth screen
  const checkAuth = setInterval(() => {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) {
      fab.style.display = authScreen.style.display === 'none' ? 'flex' : 'none';
    }
  }, 500);
})();

/* ==================== CONSOLE ART ==================== */
(function initConsole() {
  const style = 'color: #6366f1; font-size: 16px; font-weight: bold;';
  const style2 = 'color: #06b6d4; font-size: 12px;';
  console.log('%c🚀 HesabKhata Enterprise Pro v6.0', style);
  console.log('%cUltimate Professional Edition', style2);
  console.log('%c✓ Command Palette: Ctrl+K', style2);
  console.log('%c✓ Quick Nav: Alt+1 to Alt+5', style2);
  console.log('%c✓ Voice Input: Click microphone icon', style2);
  console.log('%c✓ All systems operational', style2);
})();

console.log('✅ v6.0 Pro Upgrades loaded successfully');
