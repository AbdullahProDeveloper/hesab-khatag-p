/* ═══════════════════════════════════════════════════════════
   HesabKhata Enterprise Pro v9.0
   Ultimate Bilingual Professional Edition
   ═══════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, remove, update, get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ═══════════════════ FIREBASE INIT ═══════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyBiBGWukd3PNjxK6-gv_4qiCHmwAfO3GzQ",
  authDomain: "hesab-khata.firebaseapp.com",
  projectId: "hesab-khata",
  storageBucket: "hesab-khata.firebasestorage.app",
  messagingSenderId: "138943764760",
  appId: "1:138943764760:web:908c5abacc6122a55d266d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* ═══════════════════ TRANSLATIONS ═══════════════════ */
const TRANSLATIONS = {
  bn: {
    // Auth
    brand_tagline: 'বাংলাদেশের সেরা ব্যবসা ম্যানেজমেন্ট সলিউশন',
    feat_dashboard: 'রিয়েল-টাইম ড্যাশবোর্ড', feat_pos: 'সম্পূর্ণ POS সিস্টেম', feat_invoice: 'ইনভয়েস ও রিপোর্ট',
    feat_multiuser: 'মাল্টি-ইউজার সাপোর্ট', feat_secure: 'সুরক্ষিত ডেটা',
    welcome_back: 'স্বাগতম', login_subtitle: 'আপনার অ্যাকাউন্টে লগইন করুন',
    email: 'ইমেইল', password: 'পাসওয়ার্ড', remember_me: 'মনে রাখুন', forgot_password: 'পাসওয়ার্ড ভুলে গেছেন?',
    login_btn: 'নিরাপদ লগইন', no_account: 'নতুন ইউজার?', register_now: 'রেজিস্টার করুন',
    create_account: 'নতুন অ্যাকাউন্ট', register_subtitle: 'আপনার নিজস্ব ড্যাশবোর্ড পান',
    full_name: 'পূর্ণ নাম', phone: 'মোবাইল', shop_name: 'দোকানের নাম', address: 'ঠিকানা',
    confirm_password: 'পুনরায় পাসওয়ার্ড', terms_agree: 'আমি শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছি',
    register_btn: 'রেজিস্টার করুন', have_account: 'ইতিমধ্যে অ্যাকাউন্ট আছে?', login_now: 'লগইন',
    reset_password: 'পাসওয়ার্ড রিসেট', reset_subtitle: 'নিবন্ধিত ইমেইলে রিসেট লিংক পাঠানো হবে',
    send_reset: 'রিসেট লিংক পাঠান', back_to_login: 'লগইনে ফিরে যান',
    password_hint: 'পাসওয়ার্ড দিন',
    // Navigation
    nav_main: 'প্রধান', nav_tools: 'টুলস', nav_analytics: 'বিশ্লেষণ', nav_account: 'অ্যাকাউন্ট', nav_admin: 'অ্যাডমিন',
    dashboard: 'ড্যাশবোর্ড', sales: 'বিক্রয়', new_sale: 'নতুন বিক্রয় (POS)', sales_list: 'বিক্রয় তালিকা',
    products: 'পণ্য', product_cards: 'পণ্য কার্ড', product_table: 'পণ্য টেবিল', customers: 'কাস্টমার',
    expenses: 'খরচ', new_expense: 'নতুন খরচ', expenses_list: 'খরচ তালিকা',
    calculator: 'ক্যালকুলেটর', barcode: 'বারকোড স্ক্যানার', invoices: 'ইনভয়েস',
    master_list: 'মাস্টার লিস্ট', activity_log: 'অ্যাক্টিভিটি লগ', reports: 'রিপোর্টস', analytics: 'অ্যানালিটিক্স',
    profile: 'প্রোফাইল', settings: 'সেটিংস', admin_panel: 'অ্যাডমিন প্যানেল', logout: 'লগ আউট',
    // Header
    view_profile: 'প্রোফাইল দেখুন', edit_profile: 'প্রোফাইল সম্পাদনা', theme_settings: 'থিম ও সেটিংস',
    login_history: 'লগইন হিস্ট্রি', command_palette: 'কমান্ড প্যালেট',
    // Dashboard
    welcome: 'স্বাগতম', welcome_sub: 'আজকের ব্যবসার সারসংক্ষেপ এক নজরে দেখুন।',
    today_sales: 'আজকের বিক্রি', total_sales: 'মোট বিক্রি', total_due: 'মোট বাকি', total_expense: 'মোট খরচ',
    today_income: 'আজকের আয়', all_time: 'সব সময়ের', to_collect: 'আদায় করতে হবে', all_expenses: 'সব খরচ',
    today_tx: 'আজকের লেনদেন', net_profit: 'নিট লাভ', total_products: 'মোট পণ্য', total_customers: 'মোট কাস্টমার',
    sales_trend: 'সেলস ট্রেন্ড', days_7: '৭ দিন', days_30: '৩০ দিন', days_90: '৯০ দিন',
    quick_summary: 'দ্রুত সারাংশ', stock_alert: 'স্টক সতর্কতা', detailed_reports: 'বিস্তারিত রিপোর্ট',
    stock_alerts: 'স্টক সতর্কতা', recent_transactions: 'সাম্প্রতিক লেনদেন', view_all: 'সব দেখুন',
    recent_activity: 'সাম্প্রতিক কার্যক্রম',
    // POS
    step_product: 'পণ্য নির্বাচন', step_customer: 'কাস্টমার', step_payment: 'পেমেন্ট',
    search_add_product: 'পণ্য খুঁজুন ও যোগ করুন', quantity: 'পরিমাণ', add: 'যোগ',
    customer_select: 'কাস্টমার নির্বাচন', cash_sale: 'নগদ বিক্রয়', new: 'নতুন',
    tip: 'টিপস:', tip_credit: 'বাকিতে বিক্রি করতে কাস্টমার নির্বাচন করুন।',
    cart: 'কার্ট', clear: 'ক্লিয়ার', subtotal: 'সাবটোটাল', discount: 'ডিসকাউন্ট', grand_total: 'সর্বমোট',
    paid_amount: 'প্রাপ্ত টাকা', change: 'পরিবর্তন:', will_due: 'বাকি থাকবে:', complete_sale: 'বিক্রয় সম্পন্ন করুন',
    // Common
    export: 'এক্সপোর্ট', reset: 'রিসেট', all_status: 'সব স্ট্যাটাস', paid_status: 'পরিশোধিত', due_status: 'বাকি আছে',
    sort_newest: 'সর্বশেষ আগে', sort_oldest: 'পুরাতন আগে', sort_highest: 'বেশি টাকা আগে', sort_lowest: 'কম টাকা আগে',
    invoice: 'ইনভয়েস', customer: 'কাস্টমার', products_col: 'পণ্য', total: 'মোট', paid: 'পরিশোধিত', due: 'বাকি',
    date_time: 'তারিখ ও সময়', action: 'অ্যাকশন', search: 'খুঁজুন',
    all_stock: 'সব স্টক', low_stock: 'স্টক কম', stock_ok: 'স্টক ঠিক', stock_out: 'স্টক নেই',
    sort_name: 'নাম অনুসারে', sort_qty_asc: 'স্টক কম আগে', sort_qty_desc: 'স্টক বেশি আগে',
    sort_price_high: 'দাম বেশি আগে', sort_profit_high: 'লাভ বেশি আগে', sort_profit_desc: 'লাভ বেশি আগে',
    new_product: 'নতুন পণ্য', product_name: 'পণ্যের নাম', stock: 'স্টক', buy_price: 'ক্রয় মূল্য',
    sell_price: 'বিক্রয় মূল্য', profit_per_unit: 'লাভ/ইউনিট', total_profit: 'মোট লাভ', status: 'স্ট্যাটাস',
    new_customer: 'নতুন কাস্টমার', all_customers: 'সব কাস্টমার', has_due: 'বাকি আছে', no_due: 'বাকি নেই',
    high_due: 'বেশি বাকি (১০০০+)', sort_due_desc: 'বাকি বেশি আগে',
    customer_history: 'কাস্টমার যোগ করার ইতিহাস', name: 'নাম', initial_due: 'প্রাথমিক বাকি', date: 'তারিখ', time: 'সময়',
    expense_mgmt: 'খরচ ব্যবস্থাপনা', expense_trend: '৭ দিনের খরচ ট্রেন্ড', expense_summary: 'খরচ সারাংশ',
    today_expense: 'আজকের খরচ', month_expense: 'এই মাসের খরচ', description: 'বিবরণ', amount: 'টাকা',
    all_invoices: 'সব ইনভয়েস', all_data: 'সব ডেটা', activity_sub: 'আপনার সব কার্যক্রম বিস্তারিতভাবে দেখুন',
    total_activity: 'মোট কার্যক্রম', total_purchase: 'মোট ক্রয়', total_payment: 'বাকি পরিশোধ',
    all_types: 'সব ধরন', purchase: 'ক্রয়', payment: 'বাকি পরিশোধ',
    total_income: 'মোট আয়', total_cost: 'মোট খরচ (ক্রয়)', profit_margin: 'লাভের হার',
    avg_sale: 'গড় বিক্রয়', total_items_sold: 'মোট পণ্য বিক্রি', monthly_sales: 'মাসিক বিক্রয়',
    profit_analysis: 'লাভ বিশ্লেষণ', top_products: 'শীর্ষ পণ্য', payment_status: 'পেমেন্ট স্ট্যাটাস',
    personal_info: 'ব্যক্তিগত তথ্য', role: 'রোল', join_date: 'যোগদানের তারিখ', join_time: 'যোগদানের সময়',
    system_info: 'সিস্টেম তথ্য', user_id: 'ইউজার আইডি', ip_address: 'IP ঠিকানা', device: 'ডিভাইস',
    browser: 'ব্রাউজার', location: 'লোকেশন', last_login: 'সর্বশেষ লগইন', account_created: 'একাউন্ট তৈরি',
    account_status: 'একাউন্ট স্ট্যাটাস', active: 'সক্রিয়',
    theme: 'থিম', appearance: 'অ্যাপিয়ারেন্স', notifications: 'নোটিফিকেশন', data: 'ডেটা', security: 'সিকিউরিটি',
    color_select: 'রঙ নির্বাচন', c_indigo: 'ইন্ডিগো', c_blue: 'নীল', c_emerald: 'সবুজ', c_rose: 'গোলাপি',
    c_amber: 'সোনালী', c_purple: 'বেগুনি', c_cyan: 'সায়ান', c_slate: 'স্লেট', c_teal: 'টিল',
    dark_mode: 'ডার্ক মোড', light: 'লাইট', dark: 'ডার্ক', auto: 'অটো', reset_default: 'ডিফল্টে ফিরুন',
    layout: 'লেআউট', compact_mode: 'কমপ্যাক্ট মোড', compact_desc: 'আরো তথ্য একসাথে দেখান',
    animations: 'অ্যানিমেশন', anim_desc: 'স্মুথ ট্রানজিশন',
    notification_pref: 'নোটিফিকেশন পছন্দ', stock_alert_desc: 'স্টক কম হলে নোটিফাই',
    due_reminder: 'বাকি রিমাইন্ডার', due_reminder_desc: 'বাকি থাকলে নোটিফাই',
    sound_effect: 'সাউন্ড ইফেক্ট', sound_desc: 'সফল হলে শব্দ',
    data_mgmt: 'ডেটা ম্যানেজমেন্ট', export_all: 'সব ডেটা এক্সপোর্ট', export_desc: 'JSON ফাইলে সেভ',
    csv_export: 'CSV এক্সপোর্ট', csv_desc: 'CSV ফাইলে সেভ', import_data: 'ডেটা ইমপোর্ট',
    import_desc: 'JSON থেকে পুনরুদ্ধার', delete_all: 'সব ডেটা মুছুন', delete_all_desc: 'ফেরানো যাবে না',
    download: 'ডাউনলোড', upload: 'আপলোড', delete: 'মুছুন',
    save_history: 'লগইন হিস্ট্রি', save_history_desc: 'সর্বশেষ ৫০টি সংরক্ষণ',
    auto_logout: 'স্বয়ংক্রিয় লগ আউট', auto_logout_desc: '৩০ মিনিট নিষ্ক্রিয়',
    change_password: 'পাসওয়ার্ড পরিবর্তন', reset_link_msg: 'আপনার ইমেইলে রিসেট লিংক পাঠানো হবে।',
    // Admin
    admin_control: 'অ্যাডমিন কন্ট্রোল প্যানেল', admin_control_sub: 'সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ ও ইউজার ম্যানেজমেন্ট',
    total_users: 'মোট ইউজার', active_users: 'সক্রিয়', blocked_users: 'ব্লকড', total_shops: 'মোট দোকান',
    select_user: 'ইউজার নির্বাচন করুন', select_user_sub: 'যে ইউজারকে ম্যানেজ করবেন',
    select_placeholder: '— নির্বাচন করুন —', user: 'ইউজার', refresh: 'রিফ্রেশ',
    tab_overview: 'ওভারভিউ', tab_access: 'অ্যাকসেস', tab_profile: 'প্রোফাইল', tab_security: 'সিকিউরিটি', tab_danger: 'ডেঞ্জার',
    user_statistics: 'ইউজারের পরিসংখ্যান', financial_overview: 'আর্থিক ওভারভিউ',
    total_paid: 'মোট পরিশোধিত', stock_value: 'স্টক মূল্য', customer_due_total: 'কাস্টমার বাকি মোট',
    potential_profit: 'সম্ভাব্য লাভ', investment: 'মোট বিনিয়োগ',
    view_all_data: 'সব ডেটা দেখুন', view_all_data_sub: 'বিক্রয়, পণ্য, কাস্টমার',
    login_history_sub: 'IP, ডিভাইস, সময়',
    impersonate_title: 'ইউজার অ্যাকসেস:', impersonate_desc: 'এই ইউজারের অ্যাকাউন্টে ঢুকে সব কাজ করতে পারবেন।',
    impersonate_btn: 'এই ইউজার হিসেবে কাজ করুন', save_profile: 'প্রোফাইল সংরক্ষণ করুন',
    security_actions: 'সিকিউরিটি অ্যাকশন', reset_pwd: 'পাসওয়ার্ড রিসেট', reset_pwd_sub: 'ইমেইলে রিসেট লিংক পাঠান',
    send: 'পাঠান', force_logout: 'সেশন টার্মিনেট', force_logout_sub: 'জোরপূর্বক লগ আউট',
    terminate: 'টার্মিনেট', block_user: 'সাময়িক ব্লক', block_user_sub: 'নির্দিষ্ট সময়ের জন্য ব্লক',
    block: 'ব্লক', unblock_user: 'আনব্লক করুন', unblock_user_sub: 'আবার সক্রিয় করুন', unblock: 'আনব্লক',
    danger_zone: 'ডেঞ্জার জোন', danger_zone_sub: 'এই কাজগুলি ফেরানো যাবে না',
    reset_data: 'ইউজার ডেটা রিসেট', reset_data_sub: 'সব পণ্য, কাস্টমার, বিক্রয়, খরচ মুছুন',
    delete_user: 'সম্পূর্ণ ইউজার ডিলিট', delete_user_sub: 'সব ডেটা মুছে ফেলা হবে',
    all_users: 'সকল ইউজার', new_user: 'নতুন ইউজার', all_roles: 'সব রোল',
    block_duration: 'ব্লকের সময়কাল', block_reason: 'কারণ', unblock_at: 'আনব্লক হবে',
    create: 'তৈরি করুন', user_data: 'ইউজারের ডেটা', save: 'সংরক্ষণ', update: 'আপডেট',
    add_product: 'নতুন পণ্য যোগ করুন', barcode_optional: 'বারকোড (ঐচ্ছিক)',
    unit_profit: 'প্রতি ইউনিট লাভ', total_profit_potential: 'মোট সম্ভাব্য লাভ',
    edit_product: 'পণ্য সম্পাদনা', purchase_product: 'পণ্য ক্রয়',
    purchase_qty: 'ক্রয় পরিমাণ', purchase_price: 'ক্রয় মূল্য', current_stock: 'বর্তমান স্টক',
    new_stock: 'নতুন স্টক', complete_purchase: 'ক্রয় সম্পন্ন',
    add_customer: 'নতুন কাস্টমার', initial_due_opt: 'প্রাথমিক বাকি (ঐচ্ছিক)',
    edit_customer: 'কাস্টমার সম্পাদনা', pay_due: 'বাকি পরিশোধ', current_due: 'বর্তমান বাকি',
    pay_amount: 'পরিশোধের পরিমাণ', remaining_due: 'পরিশোধের পর বাকি', complete_payment: 'পরিশোধ সম্পন্ন',
    add_expense: 'নতুন খরচ', quick_select: 'দ্রুত নির্বাচন',
    e_rent: 'দোকান ভাড়া', e_electric: 'বিদ্যুৎ বিল', e_salary: 'বেতন', e_transport: 'যাতায়াত', e_packaging: 'প্যাকেজিং',
    quick_add_customer: 'দ্রুত কাস্টমার যোগ', product: 'পণ্য',
    barcode_scanner: 'বারকোড স্ক্যানার', barcode_hint: 'ক্যামেরার সামনে বারকোড ধরুন', manual_barcode: 'অথবা ম্যানুয়ালি লিখুন:',
    basic: 'সাধারণ', scientific: 'সাইন্টিফিক', history: 'হিস্ট্রি', copy: 'কপি', paste: 'পেস্ট',
    cancel: 'বাতিল', offline_msg: 'আপনি অফলাইনে আছেন',
    admin_mode: 'অ্যাডমিন মোড:', working_as: 'আপনি কাজ করছেন', as_user: 'হিসেবে', exit: 'প্রস্থান'
  },
  en: {
    brand_tagline: "Bangladesh's Best Business Management Solution",
    feat_dashboard: 'Real-time Dashboard', feat_pos: 'Complete POS System', feat_invoice: 'Invoice & Reports',
    feat_multiuser: 'Multi-user Support', feat_secure: 'Secure Data',
    welcome_back: 'Welcome Back', login_subtitle: 'Login to your account',
    email: 'Email', password: 'Password', remember_me: 'Remember me', forgot_password: 'Forgot password?',
    login_btn: 'Secure Login', no_account: 'New user?', register_now: 'Register',
    create_account: 'Create Account', register_subtitle: 'Get your own dashboard',
    full_name: 'Full Name', phone: 'Phone', shop_name: 'Shop Name', address: 'Address',
    confirm_password: 'Confirm Password', terms_agree: 'I agree to the Terms & Privacy Policy',
    register_btn: 'Register', have_account: 'Already have an account?', login_now: 'Login',
    reset_password: 'Password Reset', reset_subtitle: 'Reset link will be sent to your email',
    send_reset: 'Send Reset Link', back_to_login: 'Back to Login',
    password_hint: 'Enter password',
    nav_main: 'Main', nav_tools: 'Tools', nav_analytics: 'Analytics', nav_account: 'Account', nav_admin: 'Admin',
    dashboard: 'Dashboard', sales: 'Sales', new_sale: 'New Sale (POS)', sales_list: 'Sales List',
    products: 'Products', product_cards: 'Product Cards', product_table: 'Product Table', customers: 'Customers',
    expenses: 'Expenses', new_expense: 'New Expense', expenses_list: 'Expenses List',
    calculator: 'Calculator', barcode: 'Barcode Scanner', invoices: 'Invoices',
    master_list: 'Master List', activity_log: 'Activity Log', reports: 'Reports', analytics: 'Analytics',
    profile: 'Profile', settings: 'Settings', admin_panel: 'Admin Panel', logout: 'Logout',
    view_profile: 'View Profile', edit_profile: 'Edit Profile', theme_settings: 'Theme & Settings',
    login_history: 'Login History', command_palette: 'Command Palette',
    welcome: 'Welcome', welcome_sub: "Today's business summary at a glance.",
    today_sales: "Today's Sales", total_sales: 'Total Sales', total_due: 'Total Due', total_expense: 'Total Expenses',
    today_income: "Today's Income", all_time: 'All time', to_collect: 'To collect', all_expenses: 'All expenses',
    today_tx: "Today's Transactions", net_profit: 'Net Profit', total_products: 'Total Products', total_customers: 'Total Customers',
    sales_trend: 'Sales Trend', days_7: '7 Days', days_30: '30 Days', days_90: '90 Days',
    quick_summary: 'Quick Summary', stock_alert: 'Stock Alert', detailed_reports: 'Detailed Reports',
    stock_alerts: 'Stock Alerts', recent_transactions: 'Recent Transactions', view_all: 'View All',
    recent_activity: 'Recent Activity',
    step_product: 'Select Product', step_customer: 'Customer', step_payment: 'Payment',
    search_add_product: 'Search & Add Products', quantity: 'Quantity', add: 'Add',
    customer_select: 'Select Customer', cash_sale: 'Cash Sale', new: 'New',
    tip: 'Tip:', tip_credit: 'Select a customer for credit sales.',
    cart: 'Cart', clear: 'Clear', subtotal: 'Subtotal', discount: 'Discount', grand_total: 'Grand Total',
    paid_amount: 'Paid Amount', change: 'Change:', will_due: 'Will Due:', complete_sale: 'Complete Sale',
    export: 'Export', reset: 'Reset', all_status: 'All Status', paid_status: 'Paid', due_status: 'Due',
    sort_newest: 'Newest First', sort_oldest: 'Oldest First', sort_highest: 'Highest First', sort_lowest: 'Lowest First',
    invoice: 'Invoice', customer: 'Customer', products_col: 'Products', total: 'Total', paid: 'Paid', due: 'Due',
    date_time: 'Date & Time', action: 'Action', search: 'Search',
    all_stock: 'All Stock', low_stock: 'Low Stock', stock_ok: 'Stock OK', stock_out: 'Out of Stock',
    sort_name: 'By Name', sort_qty_asc: 'Low Stock First', sort_qty_desc: 'High Stock First',
    sort_price_high: 'High Price First', sort_profit_high: 'High Profit First', sort_profit_desc: 'High Profit First',
    new_product: 'New Product', product_name: 'Product Name', stock: 'Stock', buy_price: 'Buy Price',
    sell_price: 'Sell Price', profit_per_unit: 'Profit/Unit', total_profit: 'Total Profit', status: 'Status',
    new_customer: 'New Customer', all_customers: 'All Customers', has_due: 'Has Due', no_due: 'No Due',
    high_due: 'High Due (1000+)', sort_due_desc: 'Highest Due First',
    customer_history: 'Customer History', name: 'Name', initial_due: 'Initial Due', date: 'Date', time: 'Time',
    expense_mgmt: 'Expense Management', expense_trend: '7-Day Expense Trend', expense_summary: 'Expense Summary',
    today_expense: "Today's Expense", month_expense: 'Monthly Expense', description: 'Description', amount: 'Amount',
    all_invoices: 'All Invoices', all_data: 'All Data', activity_sub: 'View all your activities in detail',
    total_activity: 'Total Activities', total_purchase: 'Total Purchase', total_payment: 'Total Payment',
    all_types: 'All Types', purchase: 'Purchase', payment: 'Payment',
    total_income: 'Total Income', total_cost: 'Total Cost', profit_margin: 'Profit Margin',
    avg_sale: 'Average Sale', total_items_sold: 'Total Items Sold', monthly_sales: 'Monthly Sales',
    profit_analysis: 'Profit Analysis', top_products: 'Top Products', payment_status: 'Payment Status',
    personal_info: 'Personal Info', role: 'Role', join_date: 'Join Date', join_time: 'Join Time',
    system_info: 'System Info', user_id: 'User ID', ip_address: 'IP Address', device: 'Device',
    browser: 'Browser', location: 'Location', last_login: 'Last Login', account_created: 'Account Created',
    account_status: 'Account Status', active: 'Active',
    theme: 'Theme', appearance: 'Appearance', notifications: 'Notifications', data: 'Data', security: 'Security',
    color_select: 'Select Color', c_indigo: 'Indigo', c_blue: 'Blue', c_emerald: 'Emerald', c_rose: 'Rose',
    c_amber: 'Amber', c_purple: 'Purple', c_cyan: 'Cyan', c_slate: 'Slate', c_teal: 'Teal',
    dark_mode: 'Dark Mode', light: 'Light', dark: 'Dark', auto: 'Auto', reset_default: 'Reset to Default',
    layout: 'Layout', compact_mode: 'Compact Mode', compact_desc: 'Show more info together',
    animations: 'Animations', anim_desc: 'Smooth transitions',
    notification_pref: 'Notification Preferences', stock_alert_desc: 'Notify when stock is low',
    due_reminder: 'Due Reminder', due_reminder_desc: 'Notify when customer has due',
    sound_effect: 'Sound Effect', sound_desc: 'Play sound on success',
    data_mgmt: 'Data Management', export_all: 'Export All Data', export_desc: 'Save as JSON file',
    csv_export: 'CSV Export', csv_desc: 'Save as CSV file', import_data: 'Import Data',
    import_desc: 'Restore from JSON', delete_all: 'Delete All Data', delete_all_desc: 'Cannot be undone',
    download: 'Download', upload: 'Upload', delete: 'Delete',
    save_history: 'Login History', save_history_desc: 'Save last 50 logins',
    auto_logout: 'Auto Logout', auto_logout_desc: 'After 30 min idle',
    change_password: 'Change Password', reset_link_msg: 'Reset link will be sent to your email.',
    admin_control: 'Admin Control Panel', admin_control_sub: 'Complete system control & user management',
    total_users: 'Total Users', active_users: 'Active', blocked_users: 'Blocked', total_shops: 'Total Shops',
    select_user: 'Select User', select_user_sub: 'Select a user to manage',
    select_placeholder: '— Select —', user: 'User', refresh: 'Refresh',
    tab_overview: 'Overview', tab_access: 'Access', tab_profile: 'Profile', tab_security: 'Security', tab_danger: 'Danger',
    user_statistics: 'User Statistics', financial_overview: 'Financial Overview',
    total_paid: 'Total Paid', stock_value: 'Stock Value', customer_due_total: 'Customer Due Total',
    potential_profit: 'Potential Profit', investment: 'Total Investment',
    view_all_data: 'View All Data', view_all_data_sub: 'Sales, Products, Customers',
    login_history_sub: 'IP, Device, Time',
    impersonate_title: 'User Access:', impersonate_desc: 'Login to this user account and do all tasks.',
    impersonate_btn: 'Login as This User', save_profile: 'Save Profile',
    security_actions: 'Security Actions', reset_pwd: 'Reset Password', reset_pwd_sub: 'Send reset link to email',
    send: 'Send', force_logout: 'Force Logout', force_logout_sub: 'Force logout the user',
    terminate: 'Terminate', block_user: 'Temporary Block', block_user_sub: 'Block for specific duration',
    block: 'Block', unblock_user: 'Unblock User', unblock_user_sub: 'Reactivate the user', unblock: 'Unblock',
    danger_zone: 'Danger Zone', danger_zone_sub: 'These actions cannot be undone',
    reset_data: 'Reset User Data', reset_data_sub: 'Delete all products, customers, sales, expenses',
    delete_user: 'Delete User Completely', delete_user_sub: 'All data will be deleted',
    all_users: 'All Users', new_user: 'New User', all_roles: 'All Roles',
    block_duration: 'Block Duration', block_reason: 'Reason', unblock_at: 'Unblock at',
    create: 'Create', user_data: 'User Data', save: 'Save', update: 'Update',
    add_product: 'Add New Product', barcode_optional: 'Barcode (Optional)',
    unit_profit: 'Profit/Unit', total_profit_potential: 'Total Potential Profit',
    edit_product: 'Edit Product', purchase_product: 'Purchase Product',
    purchase_qty: 'Purchase Quantity', purchase_price: 'Purchase Price', current_stock: 'Current Stock',
    new_stock: 'New Stock', complete_purchase: 'Complete Purchase',
    add_customer: 'New Customer', initial_due_opt: 'Initial Due (Optional)',
    edit_customer: 'Edit Customer', pay_due: 'Pay Due', current_due: 'Current Due',
    pay_amount: 'Payment Amount', remaining_due: 'Remaining Due', complete_payment: 'Complete Payment',
    add_expense: 'New Expense', quick_select: 'Quick Select',
    e_rent: 'Shop Rent', e_electric: 'Electricity', e_salary: 'Salary', e_transport: 'Transport', e_packaging: 'Packaging',
    quick_add_customer: 'Quick Add Customer', product: 'Product',
    barcode_scanner: 'Barcode Scanner', barcode_hint: 'Point camera at barcode', manual_barcode: 'Or enter manually:',
    basic: 'Basic', scientific: 'Scientific', history: 'History', copy: 'Copy', paste: 'Paste',
    cancel: 'Cancel', offline_msg: 'You are offline',
    admin_mode: 'Admin Mode:', working_as: 'You are working as', as_user: 'as', exit: 'Exit'
  }
};

/* ═══════════════════ LANGUAGE SYSTEM ═══════════════════ */
let currentLang = localStorage.getItem('hk_lang') || 'bn';

window.switchLanguage = (lang) => {
  currentLang = lang;
  localStorage.setItem('hk_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-lang', lang);

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (TRANSLATIONS[lang][key]) el.placeholder = TRANSLATIONS[lang][key];
  });

  // Update lang code
  const codeEl = document.getElementById('currentLangCode');
  if (codeEl) codeEl.textContent = lang.toUpperCase();

  // Update active lang buttons
  document.querySelectorAll('.lang-btn, .lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  closeLangDropdown();
  showToast('success', lang === 'bn' ? 'ভাষা পরিবর্তন' : 'Language Changed', lang === 'bn' ? 'বাংলা' : 'English');
};

window.toggleLangDropdown = (e) => {
  e.stopPropagation();
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.toggle('show');
};
function closeLangDropdown() {
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.remove('show');
}
document.addEventListener('click', (e) => {
  const dd = document.getElementById('langDropdown');
  if (dd && !dd.contains(e.target) && !e.target.closest('.lang-switcher')) dd.classList.remove('show');
});

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}
window.t = t;

/* ═══════════════════ STATE ═══════════════════ */
const AppState = {
  currentUser: null, currentUserRole: 'Staff', currentUserData: {},
  currentUserShopName: '', currentUserAddress: '', currentUserFullName: '',
  inventory: [], customers: [], cart: [],
  lastSelectedProductId: null, currentCustomerDue: 0, currentCustomerId: null,
  charts: { sales: null, expense: null, category: null, payment: null, monthly: null, profit: null },
  allUsersCache: [], allSalesCache: [], allExpensesCache: [],
  activityLog: [], loginHistory: [],
  editingProductId: null, editingCustomerId: null, payingCustomerId: null,
  unsubscribers: [],
  userSettings: {}, currentIP: '—', currentLocation: '—',
  impersonatingUser: null, selectedAdminUser: null,
  barcodeReader: null
};

Object.keys(AppState).forEach(key => {
  Object.defineProperty(window, key, {
    get() { return AppState[key]; },
    set(v) { AppState[key] = v; },
    configurable: true
  });
});

const DEFAULT_SETTINGS = Object.freeze({
  color: 'indigo', mode: 'light', radius: 16, fontSize: 100,
  compactMode: false, animations: true,
  notifStock: true, notifDue: true, soundEffect: false,
  saveHistory: true, autoLogout: false
});

const LOW_STOCK_THRESHOLD = 5;
const MAX_ACTIVITY_LOG = 500;

/* ═══════════════════ UTILITIES ═══════════════════ */
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
};
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};
const $ = (id) => document.getElementById(id);
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
const setHtml = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

window.escapeHtml = escapeHtml;
window.$ = $;

function getDateBn(date) {
  try {
    const locale = currentLang === 'bn' ? 'bn-BD' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return date.toLocaleDateString(); }
}
function getTimeBn(date) {
  try {
    const locale = currentLang === 'bn' ? 'bn-BD' : 'en-US';
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch (e) { return date.toLocaleTimeString(); }
}
window.getDateBn = getDateBn;
window.getTimeBn = getTimeBn;
window.formatDateBn = (dateStr) => {
  try {
    const locale = currentLang === 'bn' ? 'bn-BD' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return dateStr; }
};

/** Format currency with locale */
function formatMoney(n) {
  const num = parseFloat(n) || 0;
  if (currentLang === 'bn') {
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toFixed(2).replace(/\d/g, d => bnDigits[d]);
  }
  return num.toFixed(2);
}
window.formatMoney = formatMoney;

/* ═══════════════════ LOADER ═══════════════════ */
window.showLoader = (show, text = null) => {
  const el = $('loaderOverlay');
  if (!el) return;
  const sub = $('loaderSubtext');
  if (sub && text) sub.textContent = text;
  el.classList.toggle('show', show);
  if (show) {
    const bar = $('loaderProgressBar');
    if (bar) { bar.style.width = '0%'; setTimeout(() => { bar.style.width = '30%'; }, 100); }
  }
};

/* ═══════════════════ TOAST ═══════════════════ */
window.showToast = (type, title, message = '') => {
  const container = $('toastContainer');
  if (!container) return;
  const icons = {
    success: 'fas fa-circle-check', error: 'fas fa-circle-xmark',
    warning: 'fas fa-triangle-exclamation', info: 'fas fa-circle-info'
  };
  const toast = document.createElement('div');
  toast.className = `toast-pro ${type}`;
  toast.innerHTML = `
    <div class="toast-accent"></div>
    <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
    <div class="toast-progress"></div>`;
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
  }, 3000);
};

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = type === 'success' ? 800 : type === 'error' ? 300 : 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

window.getFirebaseErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': currentLang === 'bn' ? 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে' : 'Email already in use',
    'auth/invalid-email': currentLang === 'bn' ? 'ইমেইল সঠিক নয়' : 'Invalid email',
    'auth/weak-password': currentLang === 'bn' ? 'পাসওয়ার্ড দুর্বল (কমপক্ষে ৬ অক্ষর)' : 'Weak password (min 6 chars)',
    'auth/user-not-found': currentLang === 'bn' ? 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই' : 'No account found',
    'auth/wrong-password': currentLang === 'bn' ? 'পাসওয়ার্ড ভুল' : 'Wrong password',
    'auth/invalid-credential': currentLang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল' : 'Invalid credentials',
    'auth/too-many-requests': currentLang === 'bn' ? 'অনেকবার চেষ্টা' : 'Too many attempts',
    'auth/network-request-failed': currentLang === 'bn' ? 'ইন্টারনেট সংযোগ নেই' : 'Network error',
    'auth/user-disabled': currentLang === 'bn' ? 'অ্যাকাউন্ট নিষ্ক্রিয়' : 'Account disabled'
  };
  return messages[code] || `Error: ${code}`;
};

/* ═══════════════════ CONFIRM DIALOG ═══════════════════ */
window.showConfirm = (title, text, options = {}) => {
  return new Promise((resolve) => {
    const modalEl = $('confirmModal');
    if (!modalEl) { resolve(confirm(`${title}\n${text}`)); return; }
    const modal = new bootstrap.Modal(modalEl);
    const iconEl = $('confirmIcon'), okBtn = $('confirmOk'), cancelBtn = $('confirmCancel');
    setText('confirmTitle', title || (currentLang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'));
    setText('confirmText', text || '');
    const type = options.type || 'question';
    const iconMap = {
      question: { icon: 'fas fa-question-circle', bg: 'var(--primary-soft)', color: 'var(--primary)' },
      warning: { icon: 'fas fa-triangle-exclamation', bg: 'var(--warning-soft)', color: 'var(--warning)' },
      danger: { icon: 'fas fa-trash', bg: 'var(--danger-soft)', color: 'var(--danger)' },
      success: { icon: 'fas fa-circle-check', bg: 'var(--success-soft)', color: 'var(--success)' }
    };
    const style = iconMap[type] || iconMap.question;
    iconEl.innerHTML = `<i class="${style.icon}"></i>`;
    iconEl.style.background = style.bg;
    iconEl.style.color = style.color;
    okBtn.textContent = options.okText || (currentLang === 'bn' ? 'হ্যাঁ' : 'Yes');
    cancelBtn.textContent = options.cancelText || (currentLang === 'bn' ? 'বাতিল' : 'Cancel');
    okBtn.style.background = options.danger ? 'linear-gradient(135deg,var(--danger),#dc2626)' : 'linear-gradient(135deg,var(--primary),var(--primary-dark))';
    const handleOk = () => { cleanup(); resolve(true); modal.hide(); };
    const handleCancel = () => { cleanup(); resolve(false); modal.hide(); };
    function cleanup() { okBtn.removeEventListener('click', handleOk); cancelBtn.removeEventListener('click', handleCancel); }
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.show();
  });
};

/* ═══════════════════ ACTIVITY LOG ═══════════════════ */
window.logActivity = (action, details, amount = null, extraData = {}) => {
  const now = new Date();
  const entry = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    action, details,
    amount: amount !== null ? parseFloat(amount) : null,
    date: now.toISOString().split('T')[0],
    time: getTimeBn(now), timestamp: now.getTime(), ...extraData
  };
  AppState.activityLog.unshift(entry);
  if (AppState.activityLog.length > MAX_ACTIVITY_LOG) AppState.activityLog.pop();
  try { localStorage.setItem('hk_activity_' + (AppState.currentUser?.uid || 'guest'), JSON.stringify(AppState.activityLog)); } catch (e) {}
  renderActivityLog(); renderActivityLogAdvanced(); updateActivityStats();
};

window.loadActivityLog = () => {
  try {
    const saved = localStorage.getItem('hk_activity_' + (AppState.currentUser?.uid || 'guest'));
    if (saved) AppState.activityLog = JSON.parse(saved);
  } catch (e) { AppState.activityLog = []; }
};

function getActivityMeta(action) {
  if (action.includes('বিক্রয়') || action.includes('Sale')) return { icon: 'fas fa-cart-plus', color: 'bg-success-soft' };
  if (action.includes('ক্রয়') || action.includes('Purchase')) return { icon: 'fas fa-shopping-cart', color: 'bg-warning-soft' };
  if (action.includes('পরিশোধ') || action.includes('Payment')) return { icon: 'fas fa-hand-holding-dollar', color: 'bg-info-soft' };
  if (action.includes('খরচ') || action.includes('Expense')) return { icon: 'fas fa-receipt', color: 'bg-danger-soft' };
  if (action.includes('কাস্টমার') || action.includes('Customer')) return { icon: 'fas fa-user', color: 'bg-info-soft' };
  if (action.includes('পণ্য') || action.includes('Product')) return { icon: 'fas fa-box', color: 'bg-primary-soft' };
  return { icon: 'fas fa-circle-info', color: 'bg-primary-soft' };
}

window.renderActivityLog = () => {
  const c = $('activityLogList');
  if (!c) return;
  c.innerHTML = '';
  if (AppState.activityLog.length === 0) {
    c.innerHTML = `<div class="text-center text-muted py-4"><i class="fas fa-clock-rotate-left fa-2x mb-2"></i><p>${t('total_activity')}: 0</p></div>`;
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
        <div class="activity-time"><i class="fas fa-clock me-1"></i>${escapeHtml(a.date)} • ${escapeHtml(a.time)}</div>
      </div>`;
    fragment.appendChild(div);
  });
  c.appendChild(fragment);
};

window.updateActivityStats = () => {
  const sumBy = (predicate) => AppState.activityLog.filter(predicate).reduce((s, a) => s + (a.amount || 0), 0);
  setText('actTotal', AppState.activityLog.length);
  setText('actSales', '৳' + formatMoney(sumBy(a => a.action.includes('বিক্রয়') && a.amount)));
  setText('actPurchase', '৳' + formatMoney(sumBy(a => a.action.includes('ক্রয়') && a.amount)));
  setText('actExpense', '৳' + formatMoney(sumBy(a => a.action.includes('খরচ') && a.amount)));
  setText('actPayment', '৳' + formatMoney(sumBy(a => a.action.includes('পরিশোধ') && a.amount)));
};

window.renderActivityLogAdvanced = () => {
  const c = $('activityTimelineList');
  if (!c) return;
  const q = ($('activitySearchInput')?.value || '').toLowerCase();
  const from = $('activityDateFrom')?.value || '';
  const to = $('activityDateTo')?.value || '';
  const type = $('activityTypeFilter')?.value || '';
  let filtered = [...AppState.activityLog];
  if (q) filtered = filtered.filter(a => a.action.toLowerCase().includes(q) || (a.details || '').toLowerCase().includes(q));
  if (from) filtered = filtered.filter(a => a.date >= from);
  if (to) filtered = filtered.filter(a => a.date <= to);
  if (type) filtered = filtered.filter(a => a.action.includes(type));
  filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  c.innerHTML = '';
  if (filtered.length === 0) {
    c.innerHTML = `<div class="empty-state"><i class="fas fa-magnifying-glass"></i><h5>${t('search')}: 0</h5></div>`;
    return;
  }
  const grouped = {};
  filtered.forEach(a => { if (!grouped[a.date]) grouped[a.date] = []; grouped[a.date].push(a); });
  const fragment = document.createDocumentFragment();
  Object.keys(grouped).sort().reverse().forEach(date => {
    const dayItems = grouped[date];
    const dayTotal = dayItems.filter(a => a.amount).reduce((s, a) => s + (a.amount || 0), 0);
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin:16px 0 10px;padding:8px 12px;background:var(--primary-soft);border-radius:10px;border-left:4px solid var(--primary);flex-wrap:wrap;';
    header.innerHTML = `<i class="fas fa-calendar-day text-primary"></i><strong>${escapeHtml(window.formatDateBn(date))}</strong><span class="tag tag-primary ms-auto">${dayItems.length}</span>${dayTotal > 0 ? `<span class="tag tag-success">৳${formatMoney(dayTotal)}</span>` : ''}`;
    fragment.appendChild(header);
    dayItems.forEach(a => {
      const meta = getActivityMeta(a.action);
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-icon ${meta.color}"><i class="${meta.icon}"></i></div>
        <div class="timeline-content">
          <div class="timeline-title"><span>${escapeHtml(a.action)}</span>${a.amount ? `<span class="timeline-amount amount-sale">৳${formatMoney(a.amount)}</span>` : ''}</div>
          <div class="timeline-desc">${escapeHtml(a.details || '—')}</div>
          <div class="timeline-meta">
            <span><i class="fas fa-clock"></i> ${escapeHtml(a.time)}</span>
            ${a.invoiceNo ? `<span><i class="fas fa-file-invoice"></i> ${escapeHtml(a.invoiceNo)}</span>` : ''}
          </div>
        </div>`;
      fragment.appendChild(item);
    });
  });
  c.appendChild(fragment);
};

window.resetActivityFilters = () => {
  ['activitySearchInput','activityDateFrom','activityDateTo','activityTypeFilter'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  renderActivityLogAdvanced();
};

window.exportActivityLog = () => {
  let c = 'Date,Time,Action,Details,Amount\n';
  AppState.activityLog.forEach(a => {
    c += `${a.date},${a.time},"${(a.action || '').replace(/"/g, '""')}","${(a.details || '').replace(/"/g, '""')}",${a.amount || 0}\n`;
  });
  downloadFile(c, `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('success', t('export'), 'activity-log.csv');
};

window.clearActivityLog = async () => {
  const ok = await showConfirm(t('clear'), t('clear') + '?', { type: 'danger', danger: true });
  if (!ok) return;
  AppState.activityLog = [];
  try { localStorage.removeItem('hk_activity_' + (AppState.currentUser?.uid || 'guest')); } catch (e) {}
  renderActivityLog(); renderActivityLogAdvanced(); updateActivityStats();
  showToast('success', t('clear'));
};

/* ═══════════════════ FILE DOWNLOAD ═══════════════════ */
function downloadFile(content, filename, mime = 'text/csv') {
  const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
window.downloadFile = downloadFile;

/* ═══════════════════ THEME ═══════════════════ */
window.applySettings = (settings) => {
  AppState.userSettings = { ...DEFAULT_SETTINGS, ...settings };
  const s = AppState.userSettings;
  document.documentElement.setAttribute('data-color', s.color);
  const actualMode = s.mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : s.mode;
  document.documentElement.setAttribute('data-mode', actualMode);
  document.documentElement.style.setProperty('--radius', s.radius + 'px');
  document.documentElement.style.setProperty('--radius-sm', (s.radius - 4 > 4 ? s.radius - 4 : 4) + 'px');
  document.documentElement.style.setProperty('--font-size', s.fontSize + '%');
  document.body.classList.toggle('compact', s.compactMode);
  document.body.classList.toggle('no-anim', !s.animations);
};

window.saveUserSettings = async () => {
  if (!AppState.currentUser) return;
  try { await update(ref(db, 'users/' + AppState.currentUser.uid), { settings: AppState.userSettings }); } catch (e) {}
};

window.loadUserSettings = (data) => {
  const saved = data?.settings || {};
  window.applySettings(saved);
  syncSettingsUI();
};

function syncSettingsUI() {
  const s = AppState.userSettings;
  document.querySelectorAll('.color-item').forEach(el => el.classList.toggle('active', el.dataset.color === s.color));
  document.querySelectorAll('.theme-mode-item').forEach(el => el.classList.toggle('active', el.dataset.mode === s.mode));
  const map = {
    compactMode: 'compactMode', animationsToggle: 'animations',
    notifStock: 'notifStock', notifDue: 'notifDue', soundEffect: 'soundEffect',
    saveHistory: 'saveHistory', autoLogout: 'autoLogout'
  };
  Object.keys(map).forEach(id => { const el = $(id); if (el) el.checked = !!s[map[id]]; });
}

window.setThemeColor = (color, el) => {
  AppState.userSettings.color = color;
  document.querySelectorAll('.color-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.documentElement.setAttribute('data-color', color);
  saveUserSettings();
  showToast('success', t('theme'), color);
};

window.setThemeMode = (mode, el) => {
  AppState.userSettings.mode = mode;
  document.querySelectorAll('.theme-mode-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const actual = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-mode', actual);
  saveUserSettings();
};

window.toggleCompact = (v) => { AppState.userSettings.compactMode = v; document.body.classList.toggle('compact', v); saveUserSettings(); };
window.toggleAnimations = (v) => { AppState.userSettings.animations = v; document.body.classList.toggle('no-anim', !v); saveUserSettings(); };
window.saveSetting = (key, v) => { AppState.userSettings[key] = v; saveUserSettings(); };

window.resetTheme = async () => {
  const ok = await showConfirm(t('reset'), t('reset_default') + '?', { type: 'warning' });
  if (!ok) return;
  window.applySettings(DEFAULT_SETTINGS);
  syncSettingsUI();
  await saveUserSettings();
  showToast('success', t('reset_default'));
};

window.switchSettingsTab = (tab, el) => {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const content = $('settings-' + tab);
  if (content) content.classList.add('active');
};

/* ═══════════════════ PASSWORD STRENGTH ═══════════════════ */
window.checkPasswordStrength = () => {
  const p = $('regPassword').value;
  const bar = $('strengthBar'), txt = $('strengthText');
  if (!bar || !txt) return;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.match(/[a-z]+/)) s++;
  if (p.match(/[A-Z]+/)) s++;
  if (p.match(/[0-9]+/)) s++;
  if (p.match(/[$@#&!]+/)) s++;
  if (p.length === 0) { bar.style.width = '0%'; bar.className = 'password-strength-bar'; txt.textContent = t('password_hint'); }
  else if (s <= 2) { bar.style.width = '20%'; bar.className = 'password-strength-bar strength-weak'; txt.textContent = currentLang === 'bn' ? 'দুর্বল' : 'Weak'; }
  else if (s === 3) { bar.style.width = '40%'; bar.className = 'password-strength-bar strength-fair'; txt.textContent = currentLang === 'bn' ? 'মাঝারি' : 'Fair'; }
  else if (s === 4) { bar.style.width = '70%'; bar.className = 'password-strength-bar strength-good'; txt.textContent = currentLang === 'bn' ? 'ভালো' : 'Good'; }
  else { bar.style.width = '100%'; bar.className = 'password-strength-bar strength-strong'; txt.textContent = currentLang === 'bn' ? 'শক্তিশালী' : 'Strong'; }
};

/* ═══════════════════ AUTH NAV ═══════════════════ */
window.showLogin = () => { $('loginForm').style.display = 'block'; $('registerForm').style.display = 'none'; $('forgotForm').style.display = 'none'; };
window.showRegister = () => { $('loginForm').style.display = 'none'; $('registerForm').style.display = 'block'; $('forgotForm').style.display = 'none'; };
window.showForgotPassword = () => { $('loginForm').style.display = 'none'; $('registerForm').style.display = 'none'; $('forgotForm').style.display = 'block'; };

window.togglePassword = (id, btn) => {
  const i = $(id);
  if (!i) return;
  if (i.type === 'password') { i.type = 'text'; btn.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
  else { i.type = 'password'; btn.innerHTML = '<i class="fas fa-eye"></i>'; }
};

/* ═══════════════════ LOGIN ═══════════════════ */
window.login = async () => {
  const email = $('loginEmail').value.trim();
  const pass = $('loginPassword').value;
  if (!email || !pass) { showToast('warning', t('login_btn'), currentLang === 'bn' ? 'সব ঘর পূরণ করুন' : 'Fill all fields'); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('error', t('email'), currentLang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Invalid email'); return; }
  const btn = $('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>' + t('login_btn');
  showLoader(true, currentLang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...');
  try {
    let found = null;
    try {
      const usersSnap = await get(ref(db, 'users'));
      if (usersSnap.exists()) { const users = usersSnap.val(); found = Object.values(users).find(u => u.email === email); }
    } catch (e) {}

    if (found) {
      const status = found.status || 'Active';
      if (status === 'Blocked') {
        const blockUntil = found.blockUntil ? new Date(found.blockUntil) : null;
        if (!blockUntil || blockUntil > new Date()) {
          const untilText = blockUntil ? getDateBn(blockUntil) + ' ' + getTimeBn(blockUntil) : (currentLang === 'bn' ? 'চিরতরে' : 'Forever');
          showLoader(false); btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-right-to-bracket me-2"></i>' + t('login_btn');
          await Swal.fire({
            icon: 'error',
            title: currentLang === 'bn' ? 'অ্যাকাউন্ট ব্লক করা হয়েছে' : 'Account Blocked',
            html: `<div style="text-align:left;"><p><strong>${currentLang === 'bn' ? 'কারণ' : 'Reason'}:</strong> ${escapeHtml(found.blockReason || 'Admin')}</p><p><strong>${t('unblock_at')}:</strong> ${escapeHtml(untilText)}</p></div>`,
            confirmButtonText: 'OK'
          });
          return;
        }
      }
      if (status === 'Suspended') {
        showLoader(false); btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket me-2"></i>' + t('login_btn');
        await Swal.fire({ icon: 'error', title: 'Suspended', text: currentLang === 'bn' ? 'অ্যাডমিনের সাথে যোগাযোগ করুন।' : 'Contact admin.', confirmButtonText: 'OK' });
        return;
      }
    }
    await signInWithEmailAndPassword(auth, email, pass);
    showToast('success', t('welcome_back'), '');
  } catch (e) {
    showToast('error', t('login_btn'), getFirebaseErrorMessage(e.code));
    showLoader(false); btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-right-to-bracket me-2"></i>' + t('login_btn');
  }
};

/* ═══════════════════ REGISTER ═══════════════════ */
window.register = async () => {
  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim();
  const phone = $('regPhone').value.trim();
  const shopName = $('regShopName').value.trim();
  const address = $('regAddress').value.trim();
  const pass = $('regPassword').value;
  const cp = $('regConfirmPassword').value;
  const terms = $('termsCheck').checked;
  if (!name || !email || !phone || !shopName || !address || !pass || !cp) { showToast('warning', t('register_btn'), currentLang === 'bn' ? 'সব ঘর পূরণ করুন' : 'Fill all fields'); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('error', t('email'), currentLang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Invalid email'); return; }
  if (!phone.match(/^01[3-9]\d{8}$/)) { showToast('error', t('phone'), '01XXXXXXXXX'); return; }
  if (pass.length < 6) { showToast('error', t('password'), currentLang === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'Min 6 chars'); return; }
  if (pass !== cp) { showToast('error', t('confirm_password'), currentLang === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Password mismatch'); return; }
  if (!terms) { showToast('warning', t('terms_agree')); return; }
  const btn = $('registerBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>' + t('register_btn');
  showLoader(true, currentLang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...');
  try {
    const ipInfo = await fetchIPInfo();
    const device = getDeviceInfo();
    const uc = await createUserWithEmailAndPassword(auth, email, pass);
    const user = uc.user;
    const now = new Date();
    await set(ref(db, 'users/' + user.uid), {
      uid: user.uid, fullName: name, email, phone, shopName, address,
      role: 'Staff', status: 'Active',
      createdAt: now.toISOString(),
      createdAtDate: now.toISOString().split('T')[0],
      createdAtTime: getTimeBn(now),
      registrationIp: ipInfo.ip || '—', registrationLocation: ipInfo.location || '—',
      registrationDevice: device.device, registrationBrowser: device.browser, registrationOS: device.os,
      settings: DEFAULT_SETTINGS
    });
    const histRef = push(ref(db, 'users/' + user.uid + '/loginHistory'));
    await set(histRef, { id: histRef.key, date: now.toISOString().split('T')[0], time: getTimeBn(now), timestamp: now.getTime(), ip: ipInfo.ip || '—', location: ipInfo.location || '—', device: device.device, browser: device.browser, os: device.os, action: 'Registration' });
    showToast('success', t('register_btn'));
    ['regName','regEmail','regPhone','regShopName','regAddress','regPassword','regConfirmPassword'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('termsCheck').checked = false;
  } catch (e) {
    showToast('error', t('register_btn'), getFirebaseErrorMessage(e.code));
    showLoader(false); btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-rocket me-2"></i>' + t('register_btn');
  }
};

window.resetPassword = async () => {
  const email = $('resetEmail').value.trim();
  if (!email) { showToast('warning', t('email')); return; }
  const btn = $('resetBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>' + t('send_reset');
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('success', t('send_reset'), email);
    $('resetEmail').value = '';
    setTimeout(showLogin, 1500);
  } catch (e) { showToast('error', t('send_reset'), getFirebaseErrorMessage(e.code)); }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>' + t('send_reset');
};

window.logout = async () => {
  const ok = await showConfirm(t('logout'), t('logout') + '?');
  if (!ok) return;
  try { await signOut(auth); showToast('info', t('logout')); } catch (e) {}
};

/* ═══════════════════ IP & DEVICE ═══════════════════ */
async function fetchIPInfo() {
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (!r.ok) throw new Error('Failed');
    const data = await r.json();
    AppState.currentIP = data.ip || '—';
    AppState.currentLocation = `${data.city || ''}${data.city && data.country_name ? ', ' : ''}${data.country_name || ''}` || '—';
    return { ip: AppState.currentIP, location: AppState.currentLocation };
  } catch (e) {
    try {
      const r2 = await fetch('https://api.ipify.org?format=json');
      const d2 = await r2.json();
      AppState.currentIP = d2.ip || '—';
      return { ip: AppState.currentIP, location: '—' };
    } catch (e2) { return { ip: '—', location: '—' }; }
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
  return { device, browser, os };
}

/* ═══════════════════ AUTH STATE ═══════════════════ */
onAuthStateChanged(auth, async (user) => {
  AppState.unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
  AppState.unsubscribers = [];

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
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-right-to-bracket me-2"></i>' + t('login_btn'); }
    const rbtn = $('registerBtn');
    if (rbtn) { rbtn.disabled = false; rbtn.innerHTML = '<i class="fas fa-rocket me-2"></i>' + t('register_btn'); }
    const fab = $('mainFab');
    if (fab) fab.style.display = 'none';
    return;
  }

  AppState.currentUser = user;
  showLoader(true, currentLang === 'bn' ? 'প্রোফাইল লোড হচ্ছে...' : 'Loading profile...');

  let ipInfo = { ip: '—', location: '—' };
  try { ipInfo = await fetchIPInfo(); } catch (e) {}
  const device = getDeviceInfo();

  let data = null;
  try {
    const snap = await get(ref(db, 'users/' + user.uid));
    if (!snap.exists()) {
      const now = new Date();
      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid, fullName: user.email.split('@')[0],
        email: user.email, phone: '', shopName: '', address: '',
        role: 'Staff', status: 'Active',
        createdAt: now.toISOString(),
        createdAtDate: now.toISOString().split('T')[0],
        createdAtTime: getTimeBn(now),
        settings: DEFAULT_SETTINGS
      });
      data = (await get(ref(db, 'users/' + user.uid))).val();
    } else { data = snap.val(); }
  } catch (e) {
    console.error(e);
    showLoader(false);
    return;
  }

  let activeData = data, activeUser = user;
  if (AppState.impersonatingUser && AppState.impersonatingUser !== user.uid) {
    try {
      const targetSnap = await get(ref(db, 'users/' + AppState.impersonatingUser));
      if (targetSnap.exists()) {
        activeData = targetSnap.val();
        activeUser = { uid: AppState.impersonatingUser, email: activeData.email };
      }
    } catch (e) {}
  }

  AppState.currentUserData = activeData;
  AppState.currentUserRole = activeData.role || 'Staff';
  AppState.currentUserShopName = activeData.shopName || '';
  AppState.currentUserAddress = activeData.address || '';
  AppState.currentUserFullName = activeData.fullName || 'User';
  const isAdmin = AppState.currentUserRole === 'Admin';

  if (!AppState.impersonatingUser) {
    (async () => {
      try {
        const now = new Date();
        const newLoginEntry = { date: now.toISOString().split('T')[0], time: getTimeBn(now), timestamp: now.getTime(), ip: ipInfo.ip || '—', location: ipInfo.location || '—', device: device.device, browser: device.browser, os: device.os, action: 'Login' };
        await update(ref(db, 'users/' + user.uid), {
          lastLogin: newLoginEntry, lastIp: ipInfo.ip || '—', lastLocation: ipInfo.location || '—',
          lastDevice: device.device, lastBrowser: device.browser, lastOS: device.os
        });
        const histRef = push(ref(db, 'users/' + user.uid + '/loginHistory'));
        await set(histRef, { id: histRef.key, ...newLoginEntry });
      } catch (e) {}
    })();
  }

  try { loadUserSettings(activeData); } catch (e) {}

  try {
    const initial = (activeUser.email[0] || 'U').toUpperCase();
    setText('userAvatar', initial); setText('dropdownAvatar', initial);
    setText('userName', activeData.fullName || 'User');
    setText('welcomeName', activeData.fullName || 'User');
    setText('userRoleLabel', AppState.currentUserRole);
    setText('dropdownName', activeData.fullName || 'User');
    setText('dropdownEmail', activeUser.email);
    setText('dropdownRole', AppState.currentUserRole);
    const navAdmin = $('nav-admin'), adminDivider = $('adminDivider'), adminLabel = $('adminLabel');
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
    }
    const fab = $('mainFab');
    if (fab) fab.style.display = 'flex';
  } catch (e) {}

  try { loadActivityLog(); } catch (e) {}
  try { initApp(); } catch (e) {}
  try { renderProfile(); } catch (e) {}
  try { loadLoginHistory(); } catch (e) {}

  if (isAdmin) { try { loadAllUsers(); } catch (e) {} }

  try { showSection('dashboard'); } catch (e) {}
  showLoader(false);

  setTimeout(() => {
    try { showToast('success', t('welcome'), activeData.fullName || 'User'); } catch (e) {}
  }, 300);
});

/* ═══════════════════ INIT APP ═══════════════════ */
function initApp() {
  if (!AppState.currentUser) return;
  const uid = AppState.impersonatingUser || AppState.currentUser.uid;

  AppState.unsubscribers.push(onValue(ref(db, 'users/' + uid + '/inventory'), (snap) => {
    AppState.inventory = snap.val() ? Object.values(snap.val()) : [];
    renderProductCards(); renderInventoryTable(); renderCustomerSelect();
    renderLowStock(); updateQuickStats();
  }));

  AppState.unsubscribers.push(onValue(ref(db, 'users/' + uid + '/customers'), (snap) => {
    AppState.customers = snap.val() ? Object.values(snap.val()) : [];
    renderCustomerCards(); renderCustomerHistoryList(); renderCustomerSelect(); updateQuickStats();
  }));

  AppState.unsubscribers.push(onValue(ref(db, 'users/' + uid + '/sales'), (snap) => {
    const sales = snap.val() ? Object.values(snap.val()) : [];
    AppState.allSalesCache = sales;
    renderDashboard(sales); renderInvoices(sales); renderRecentTransactions(sales);
    renderSalesList(sales); renderAnalytics(sales); renderReports(sales); renderMasterList();
  }));

  AppState.unsubscribers.push(onValue(ref(db, 'users/' + uid + '/expenses'), (snap) => {
    const exp = snap.val() ? Object.values(snap.val()) : [];
    AppState.allExpensesCache = exp;
    renderExpenses(exp); updateTotalExpense(exp); renderExpenseChart(exp); renderMasterList();
  }));

  const ps = $('productSearch');
  if (ps && !ps.dataset.bound) {
    ps.dataset.bound = 'true';
    ps.addEventListener('input', debounce(function (e) {
      const q = e.target.value.toLowerCase();
      const res = $('productSearchResults');
      res.innerHTML = '';
      if (q.length > 0) {
        const matches = AppState.inventory.filter(i => i.name.toLowerCase().includes(q) && parseInt(i.qty) > 0);
        matches.forEach(item => {
          res.innerHTML += `<button class="list-group-item list-group-item-action d-flex justify-content-between" onclick="selectProduct('${item.id}')">
            <span><strong>${escapeHtml(item.name)}</strong> <small class="text-muted">(${t('stock')}:${item.qty})</small></span>
            <b class="text-primary">৳${item.sellPrice}</b>
          </button>`;
        });
      }
    }, 250));
  }

  ['addProdQty','addProdBuyPrice','addProdSellPrice'].forEach(id => {
    const el = $(id);
    if (el && !el.dataset.bound) { el.dataset.bound = 'true'; el.addEventListener('input', updateAddProdLive); }
  });
  ['purchaseQty','purchasePrice'].forEach(id => {
    const el = $(id);
    if (el && !el.dataset.bound) { el.dataset.bound = 'true'; el.addEventListener('input', updatePurchaseLive); }
  });

  setText('currentDate', getDateBn(new Date()));
  if (AppState.currentUserRole === 'Admin') loadAllUsers();
}

/* ═══════════════════ LIVE PREVIEWS ═══════════════════ */
function updateAddProdLive() {
  const qty = parseFloat($('addProdQty').value) || 0;
  const buy = parseFloat($('addProdBuyPrice').value) || 0;
  const sell = parseFloat($('addProdSellPrice').value) || 0;
  const profit = sell - buy;
  setText('addProdProfit', '৳' + formatMoney(profit));
  setText('addProdTotalProfit', '৳' + formatMoney(profit * qty));
}

function updatePurchaseLive() {
  const qty = parseFloat($('purchaseQty').value) || 0;
  const price = parseFloat($('purchasePrice').value) || 0;
  setText('purchaseTotalCost', formatMoney(qty * price));
  const cur = parseFloat($('purchaseCurrentStock').textContent) || 0;
  setText('purchaseNewStock', (cur + qty).toString());
}

window.previewPayDue = () => {
  const amount = parseFloat($('payAmount').value) || 0;
  const curDue = parseFloat($('payCurrentDue').value.replace(/[^\d.]/g, '')) || 0;
  const remaining = Math.max(0, curDue - amount);
  setText('payRemainingDue', '৳' + formatMoney(remaining));
  setHtml('payStatus', remaining <= 0 ? `<span class="tag tag-success">${currentLang === 'bn' ? 'সম্পূর্ণ পরিশোধ' : 'Fully Paid'}</span>` : `<span class="tag tag-warning">${currentLang === 'bn' ? 'আংশিক' : 'Partial'}</span>`);
};

window.quickExpense = (desc) => { const el = $('addExpDesc'); if (el) el.value = desc; };
window.openAddCustomerQuick = () => { new bootstrap.Modal($('quickAddCustomerModal')).show(); };
window.increaseQty = () => { const el = $('productQty'); if (el) el.value = (parseInt(el.value) || 0) + 1; };
window.decreaseQty = () => { const el = $('productQty'); if (el) el.value = Math.max(1, (parseInt(el.value) || 1) - 1); };

/* ═══════════════════ PRODUCTS ═══════════════════ */
window.renderProductCards = () => {
  const c = $('productCardsContainer');
  if (!c) return;
  const f = getFilteredInventory();
  setText('inventoryCardCount', `${f.length} ${t('products')}`);
  if (f.length === 0) {
    c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-boxes"></i><h5>${t('products')}: 0</h5><button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addProductModal"><i class="fas fa-plus"></i>${t('new_product')}</button></div></div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  f.forEach(p => {
    const low = parseInt(p.qty) <= LOW_STOCK_THRESHOLD;
    const badge = low ? `<span class="badge-stock low"><i class="fas fa-circle-exclamation"></i>${t('low_stock')}</span>` : `<span class="badge-stock ok"><i class="fas fa-circle-check"></i>${t('stock_ok')}</span>`;
    const div = document.createElement('div');
    div.className = 'col-xl-3 col-md-4 col-sm-6';
    div.innerHTML = `<div class="product-card">
      <div class="product-icon"><i class="fas fa-box"></i></div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="product-price">৳${p.sellPrice}</div>
      ${badge}
      <span class="ms-1 small text-muted">${t('stock')}: ${p.qty}</span>
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editProduct('${p.id}')"><i class="fas fa-pen"></i></button>
        <button class="action-btn sell" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="action-btn buy" onclick="purchaseProductModal('${p.id}')"><i class="fas fa-cart-shopping"></i></button>
        <button class="action-btn del" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = ''; c.appendChild(fragment);
};

window.renderInventoryTable = () => {
  const tbody = $('inventoryTableBody');
  if (!tbody) return;
  const f = getFilteredInventoryList();
  setText('inventoryTableCount', `${f.length} ${t('products')}`);
  if (f.length === 0) { tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  let totalStock = 0, totalProfit = 0, lowCount = 0;
  f.forEach((p, i) => {
    const ppu = parseFloat(p.sellPrice) - parseFloat(p.buyPrice);
    const tp = ppu * parseInt(p.qty);
    totalStock += parseInt(p.qty);
    totalProfit += tp;
    if (parseInt(p.qty) <= LOW_STOCK_THRESHOLD) lowCount++;
    const badge = parseInt(p.qty) <= LOW_STOCK_THRESHOLD ? `<span class="tag tag-danger">${t('low_stock')}</span>` : `<span class="tag tag-success">${t('stock_ok')}</span>`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${p.qty}</td>
      <td>৳${p.buyPrice}</td>
      <td>৳${p.sellPrice}</td>
      <td class="text-success">৳${formatMoney(ppu)}</td>
      <td class="text-success fw-bold">৳${formatMoney(tp)}</td>
      <td>${badge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="sellProduct('${p.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('inventory','${p.id}')"><i class="fas fa-trash"></i></button>
      </td>`;
    fragment.appendChild(tr);
  });
  tbody.innerHTML = ''; tbody.appendChild(fragment);
  const footer = $('inventoryTableFooter');
  if (footer) {
    footer.innerHTML = `
      <div class="table-footer-stat"><small>${t('total_products')}</small><strong>${f.length}</strong></div>
      <div class="table-footer-stat"><small>${t('stock')}</small><strong>${totalStock}</strong></div>
      <div class="table-footer-stat"><small>${t('total_profit')}</small><strong class="text-success">৳${formatMoney(totalProfit)}</strong></div>
      <div class="table-footer-stat"><small>${t('low_stock')}</small><strong class="text-danger">${lowCount}</strong></div>`;
  }
};

function getFilteredInventory() {
  const q = ($('inventorySearchFilter')?.value || '').toLowerCase();
  const sf = $('inventoryStockFilter')?.value || '';
  const sort = $('inventorySortFilter')?.value || 'name';
  let arr = AppState.inventory.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (sf === 'low' && parseInt(i.qty) > LOW_STOCK_THRESHOLD) return false;
    if (sf === 'ok' && parseInt(i.qty) <= LOW_STOCK_THRESHOLD) return false;
    if (sf === 'out' && parseInt(i.qty) > 0) return false;
    return true;
  });
  arr.sort((a, b) => {
    if (sort === 'qty-asc') return parseInt(a.qty) - parseInt(b.qty);
    if (sort === 'qty-desc') return parseInt(b.qty) - parseInt(a.qty);
    if (sort === 'price-high') return parseFloat(b.sellPrice) - parseFloat(a.sellPrice);
    if (sort === 'profit-high') return (parseFloat(b.sellPrice) - parseFloat(b.buyPrice)) - (parseFloat(a.sellPrice) - parseFloat(a.buyPrice));
    return a.name.localeCompare(b.name);
  });
  return arr;
}

function getFilteredInventoryList() {
  const q = ($('inventoryListSearchFilter')?.value || '').toLowerCase();
  const sort = $('inventoryListSort')?.value || 'name';
  let arr = AppState.inventory.filter(i => !q || i.name.toLowerCase().includes(q));
  arr.sort((a, b) => {
    if (sort === 'qty-asc') return parseInt(a.qty) - parseInt(b.qty);
    if (sort === 'qty-desc') return parseInt(b.qty) - parseInt(a.qty);
    if (sort === 'profit-desc') return (parseFloat(b.sellPrice) - parseFloat(b.buyPrice)) * parseInt(b.qty) - (parseFloat(a.sellPrice) - parseFloat(a.buyPrice)) * parseInt(a.qty);
    return a.name.localeCompare(b.name);
  });
  return arr;
}
window.filterInventory = () => renderProductCards();
window.filterInventoryList = () => renderInventoryTable();

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
  if (!name || qty === '' || buy === '' || sell === '') { showToast('warning', t('product')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/inventory/' + AppState.editingProductId), { name, qty, buyPrice: buy, sellPrice: sell });
    showToast('success', t('update'), name);
    bootstrap.Modal.getInstance($('editProductModal')).hide();
  } catch (e) { showToast('error', t('update'), e.message); }
  showLoader(false);
};

window.sellProduct = (id) => {
  const p = AppState.inventory.find(i => i.id === id);
  if (!p) return;
  showSection('sales');
  AppState.lastSelectedProductId = id;
  $('productSearch').value = p.name;
  $('productQty').value = '1';
};

window.purchaseProductModal = (id) => {
  const p = AppState.inventory.find(i => i.id === id);
  if (!p) return;
  $('purchaseProdName').value = p.name;
  $('purchaseQty').value = '1';
  $('purchasePrice').value = p.buyPrice;
  setText('purchaseCurrentStock', p.qty);
  setText('purchaseNewStock', (parseInt(p.qty) + 1).toString());
  setText('purchaseTotalCost', formatMoney(p.buyPrice));
  new bootstrap.Modal($('purchaseProductModal')).show();
};

window.purchaseProduct = async () => {
  const name = $('purchaseProdName').value;
  const qty = parseInt($('purchaseQty').value);
  const price = parseFloat($('purchasePrice').value);
  if (!qty || qty <= 0) { showToast('error', t('purchase_qty')); return; }
  if (!price || price < 0) { showToast('error', t('purchase_price')); return; }
  const p = AppState.inventory.find(i => i.name === name);
  if (!p) return;
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const newQty = parseInt(p.qty) + qty;
    await update(ref(db, 'users/' + uid + '/inventory/' + p.id), { qty: newQty, buyPrice: price });
    logActivity('পণ্য ক্রয়', `${name} - ${qty} × ৳${price}`, qty * price);
    showToast('success', t('complete_purchase'), `${t('new_stock')}: ${newQty}`);
    bootstrap.Modal.getInstance($('purchaseProductModal')).hide();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.addInventory = async () => {
  const n = $('addProdName').value.trim();
  const q = $('addProdQty').value;
  const b = $('addProdBuyPrice').value;
  const s = $('addProdSellPrice').value;
  const barcode = $('addProdBarcode')?.value.trim() || '';
  if (!n || q === '' || b === '' || s === '') { showToast('warning', t('product_name')); return; }
  if (parseFloat(q) < 0 || parseFloat(b) < 0 || parseFloat(s) < 0) { showToast('error', t('product_name')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/inventory'));
    await set(r, { id: r.key, name: n, qty: q, buyPrice: b, sellPrice: s, barcode, createdAt: new Date().toISOString() });
    logActivity('নতুন পণ্য', `${n} (${q})`);
    bootstrap.Modal.getInstance($('addProductModal')).hide();
    showToast('success', t('new_product'), n);
    ['addProdName','addProdQty','addProdBuyPrice','addProdSellPrice','addProdBarcode'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    updateAddProdLive();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

/* ═══════════════════ CUSTOMERS ═══════════════════ */
window.renderCustomerCards = () => {
  const c = $('customerCardsContainer');
  if (!c) return;
  const f = getFilteredCustomers();
  setText('customerCount', `${f.length} ${t('customers')}`);
  if (f.length === 0) {
    c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-users"></i><h5>${t('customers')}: 0</h5><button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addCustomerModal"><i class="fas fa-plus"></i>${t('new_customer')}</button></div></div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  f.forEach(cust => {
    const hasDue = parseFloat(cust.due) > 0;
    const badge = hasDue ? `<span class="badge-stock low"><i class="fas fa-circle-exclamation"></i>${t('due')}: ৳${cust.due}</span>` : `<span class="badge-stock ok"><i class="fas fa-circle-check"></i>${t('no_due')}</span>`;
    const div = document.createElement('div');
    div.className = 'col-xl-3 col-md-4 col-sm-6';
    div.innerHTML = `<div class="customer-card">
      <div class="customer-icon"><i class="fas fa-user"></i></div>
      <div class="customer-name">${escapeHtml(cust.name)}</div>
      <div class="customer-phone"><i class="fas fa-phone me-1"></i>${escapeHtml(cust.phone || '—')}</div>
      ${badge}
      <div class="product-actions mt-2">
        <button class="action-btn edit" onclick="editCustomer('${cust.id}')"><i class="fas fa-pen"></i></button>
        <button class="action-btn sell" onclick="sellToCustomer('${cust.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="action-btn pay" onclick="payDueModal('${cust.id}')"><i class="fas fa-hand-holding-dollar"></i></button>
        <button class="action-btn del" onclick="deleteItem('customers','${cust.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = ''; c.appendChild(fragment);
  renderCustomerHistoryList();
};

function getFilteredCustomers() {
  const q = ($('customerSearchFilter')?.value || '').toLowerCase();
  const df = $('customerDueFilter')?.value || '';
  const sort = $('customerSortFilter')?.value || 'name';
  let arr = AppState.customers.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (df === 'due' && parseFloat(c.due) <= 0) return false;
    if (df === 'clear' && parseFloat(c.due) > 0) return false;
    if (df === 'high-due' && parseFloat(c.due) < 1000) return false;
    return true;
  });
  arr.sort((a, b) => {
    if (sort === 'due-desc') return parseFloat(b.due || 0) - parseFloat(a.due || 0);
    if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return a.name.localeCompare(b.name);
  });
  return arr;
}
window.filterCustomers = () => renderCustomerCards();

window.renderCustomerHistoryList = () => {
  const tbody = $('customerHistoryTableBody');
  if (!tbody) return;
  const q = ($('custHistorySearch')?.value || '').toLowerCase();
  const from = $('custHistoryDateFrom')?.value || '';
  const to = $('custHistoryDateTo')?.value || '';
  let filtered = [...AppState.customers];
  if (q) filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
  if (from) filtered = filtered.filter(c => (c.createdAt || '').slice(0, 10) >= from);
  if (to) filtered = filtered.filter(c => (c.createdAt || '').slice(0, 10) <= to);
  filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  filtered.forEach((c, i) => {
    const created = c.createdAt ? new Date(c.createdAt) : null;
    const hasDue = parseFloat(c.due) > 0;
    const statusBadge = hasDue ? `<span class="tag tag-warning">৳${c.due}</span>` : `<span class="tag tag-success">${t('no_due')}</span>`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.phone || '—')}</td>
      <td>৳${c.due || 0}</td>
      <td>${created ? getDateBn(created) : '—'}</td>
      <td>${created ? getTimeBn(created) : '—'}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCustomer('${c.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="sellToCustomer('${c.id}')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn btn-sm btn-outline-warning" onclick="payDueModal('${c.id}')"><i class="fas fa-hand-holding-dollar"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('customers','${c.id}')"><i class="fas fa-trash"></i></button>
      </td>`;
    fragment.appendChild(tr);
  });
  tbody.innerHTML = ''; tbody.appendChild(fragment);
};

window.resetCustomerHistoryFilters = () => {
  ['custHistorySearch','custHistoryDateFrom','custHistoryDateTo'].forEach(id => { const el = $(id); if (el) el.value = ''; });
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
  if (!name) { showToast('warning', t('name')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/customers/' + AppState.editingCustomerId), { name, phone });
    showToast('success', t('update'), name);
    bootstrap.Modal.getInstance($('editCustomerModal')).hide();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.sellToCustomer = (id) => {
  const c = AppState.customers.find(i => i.id === id);
  if (!c) return;
  showSection('sales');
  $('customerSelect').value = id;
  updateCustomerDue();
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
  if (!amount || amount <= 0) { showToast('error', t('pay_amount')); return; }
  if (amount > (parseFloat(c.due) || 0)) { showToast('warning', t('pay_amount')); return; }
  const newDue = Math.max(0, (parseFloat(c.due) || 0) - amount);
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await update(ref(db, 'users/' + uid + '/customers/' + AppState.payingCustomerId), { due: newDue });
    logActivity('বাকি পরিশোধ', `${c.name} - ৳${amount}`, amount);
    showToast('success', t('complete_payment'), '৳' + newDue);
    bootstrap.Modal.getInstance($('payDueModal')).hide();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.quickAddCustomer = async () => {
  const name = $('quickCustName').value.trim();
  const phone = $('quickCustPhone').value.trim();
  if (!name || !phone) { showToast('warning', t('name')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/customers'));
    await set(r, { id: r.key, name, phone, due: 0, createdAt: new Date().toISOString() });
    logActivity('নতুন কাস্টমার', `${name} - ${phone}`, 0);
    showLoader(false);
    bootstrap.Modal.getInstance($('quickAddCustomerModal')).hide();
    $('quickCustName').value = ''; $('quickCustPhone').value = '';
    showToast('success', t('new_customer'), name);
    setTimeout(() => { $('customerSelect').value = r.key; updateCustomerDue(); }, 400);
  } catch (e) { showLoader(false); showToast('error', e.message); }
};

window.addCustomer = async () => {
  const n = $('addCustName').value.trim();
  const p = $('addCustPhone').value.trim();
  const d = $('addCustDue').value || 0;
  if (!n || !p) { showToast('warning', t('name')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/customers'));
    await set(r, { id: r.key, name: n, phone: p, due: parseFloat(d), createdAt: new Date().toISOString() });
    logActivity('নতুন কাস্টমার', `${n} - ${p}`, parseFloat(d));
    bootstrap.Modal.getInstance($('addCustomerModal')).hide();
    showToast('success', t('new_customer'), n);
    ['addCustName','addCustPhone','addCustDue'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

/* ═══════════════════ EXPENSES ═══════════════════ */
window.renderExpenses = (exp) => {
  const tbody = $('expenseTableBody');
  if (!tbody) return;
  setText('expenseCount', `${exp.length} ${t('expenses')}`);
  if (exp.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  let total = 0;
  exp.slice().reverse().forEach(e => {
    total += parseFloat(e.amount || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(e.title)}</strong></td>
      <td class="text-danger fw-bold">৳${e.amount}</td>
      <td>${e.date ? getDateBn(new Date(e.date)) : '—'}</td>
      <td>${escapeHtml(e.time || '—')}</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="deleteItem('expenses','${e.id}')"><i class="fas fa-trash"></i></button></td>`;
    fragment.appendChild(tr);
  });
  tbody.innerHTML = ''; tbody.appendChild(fragment);
  const footer = $('expenseTableFooter');
  if (footer) {
    const avg = exp.length ? total / exp.length : 0;
    footer.innerHTML = `
      <div class="table-footer-stat"><small>${t('total_expense')}</small><strong>${exp.length}</strong></div>
      <div class="table-footer-stat"><small>${t('amount')}</small><strong class="text-danger">৳${formatMoney(total)}</strong></div>
      <div class="table-footer-stat"><small>${t('avg_sale')}</small><strong>৳${formatMoney(avg)}</strong></div>`;
  }
};

window.filterExpenseList = () => {
  let exp = [...AppState.allExpensesCache];
  const q = ($('expenseSearchFilter')?.value || '').toLowerCase();
  const from = $('expenseDateFrom')?.value;
  const to = $('expenseDateTo')?.value;
  const sort = $('expenseSortFilter')?.value || 'newest';
  if (q) exp = exp.filter(e => e.title.toLowerCase().includes(q));
  if (from) exp = exp.filter(e => e.date >= from);
  if (to) exp = exp.filter(e => e.date <= to);
  exp.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sort === 'highest') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sort === 'lowest') return parseFloat(a.amount) - parseFloat(b.amount);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  renderExpenses(exp);
};

window.resetExpenseFilters = () => {
  ['expenseSearchFilter','expenseDateFrom','expenseDateTo','expenseSortFilter'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  renderExpenses(AppState.allExpensesCache);
};

window.renderExpenseChart = (exp) => {
  const ctx = $('expenseChart')?.getContext('2d');
  if (!ctx) return;
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    last7.push({ label: ds.slice(5), amount: exp.filter(e => e.date === ds).reduce((s, e) => s + parseFloat(e.amount || 0), 0) });
  }
  if (AppState.charts.expense) AppState.charts.expense.destroy();
  AppState.charts.expense = new Chart(ctx, {
    type: 'bar',
    data: { labels: last7.map(d => d.label), datasets: [{ label: t('expenses'), data: last7.map(d => d.amount), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
  const today = new Date().toISOString().split('T')[0];
  const tm = today.slice(0, 7);
  setText('todayExpense', '৳' + formatMoney(exp.filter(e => e.date === today).reduce((s, e) => s + parseFloat(e.amount || 0), 0)));
  setText('monthExpense', '৳' + formatMoney(exp.filter(e => e.date && e.date.startsWith(tm)).reduce((s, e) => s + parseFloat(e.amount || 0), 0)));
  setText('totalExpenseQuick', '৳' + formatMoney(exp.reduce((s, e) => s + parseFloat(e.amount || 0), 0)));
};

window.addExpense = async () => {
  const tt = $('addExpDesc').value.trim();
  const a = $('addExpAmt').value;
  if (!tt || !a) { showToast('warning', t('description')); return; }
  if (parseFloat(a) <= 0) { showToast('error', t('amount')); return; }
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/expenses'));
    const now = new Date();
    await set(r, { id: r.key, title: tt, amount: a, date: now.toISOString().split('T')[0], time: getTimeBn(now), createdAt: now.toISOString() });
    logActivity('নতুন খরচ', tt, parseFloat(a));
    bootstrap.Modal.getInstance($('addExpenseModal')).hide();
    showToast('success', t('new_expense'), `${tt} - ৳${a}`);
    ['addExpDesc','addExpAmt'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

/* ═══════════════════ SALES LIST ═══════════════════ */
window.renderSalesList = (sales) => {
  const tbody = $('salesTableBody');
  if (!tbody) return;
  setText('salesListCount', `${sales.length} ${t('sales')}`);
  if (sales.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  sales.slice().reverse().forEach(s => {
    const d = s.date ? new Date(s.date) : new Date();
    const cls = parseFloat(s.due) > 0 ? 'text-danger' : 'text-success';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(s.invoiceNo || 'N/A')}</strong></td>
      <td>${escapeHtml(s.customerName || '—')}</td>
      <td>${escapeHtml(s.name || '')}</td>
      <td class="fw-bold">৳${s.totalAmount}</td>
      <td class="text-success">৳${s.paid || 0}</td>
      <td class="${cls} fw-bold">৳${s.due || 0}</td>
      <td>${getDateBn(d)}<br><small class="text-muted">${escapeHtml(s.time || '—')}</small></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
        <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
        <button class="btn btn-sm btn-outline-info" onclick="shareInvoice('${s.id}')"><i class="fas fa-share-nodes"></i></button>
      </td>`;
    fragment.appendChild(tr);
  });
  tbody.innerHTML = ''; tbody.appendChild(fragment);
  const footer = $('salesTableFooter');
  if (footer) {
    const totalAmount = sales.reduce((s, x) => s + parseFloat(x.totalAmount || 0), 0);
    const totalPaid = sales.reduce((s, x) => s + parseFloat(x.paid || 0), 0);
    const totalDue = sales.reduce((s, x) => s + parseFloat(x.due || 0), 0);
    footer.innerHTML = `
      <div class="table-footer-stat"><small>${t('sales_list')}</small><strong>${sales.length}</strong></div>
      <div class="table-footer-stat"><small>${t('total')}</small><strong class="text-primary">৳${formatMoney(totalAmount)}</strong></div>
      <div class="table-footer-stat"><small>${t('paid')}</small><strong class="text-success">৳${formatMoney(totalPaid)}</strong></div>
      <div class="table-footer-stat"><small>${t('due')}</small><strong class="text-danger">৳${formatMoney(totalDue)}</strong></div>`;
  }
};

window.filterSalesList = () => {
  let sales = [...AppState.allSalesCache];
  const q = ($('salesSearchFilter')?.value || '').toLowerCase();
  const from = $('salesDateFrom')?.value;
  const to = $('salesDateTo')?.value;
  const st = $('salesStatusFilter')?.value;
  const sort = $('salesSortFilter')?.value || 'newest';
  if (q) sales = sales.filter(s => (s.invoiceNo || '').toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q));
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);
  if (st === 'paid') sales = sales.filter(s => parseFloat(s.due) <= 0);
  if (st === 'due') sales = sales.filter(s => parseFloat(s.due) > 0);
  sales.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sort === 'highest') return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
    if (sort === 'lowest') return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  renderSalesList(sales);
};

window.resetSalesFilters = () => {
  ['salesSearchFilter','salesDateFrom','salesDateTo','salesStatusFilter','salesSortFilter'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  renderSalesList(AppState.allSalesCache);
};

/* ═══════════════════ DASHBOARD ═══════════════════ */
window.renderDashboard = (sales) => {
  const today = new Date().toISOString().split('T')[0];
  setText('totalSales', formatMoney(sales.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0)));
  setText('todaySales', formatMoney(sales.filter(i => i.date === today).reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0)));
  setText('totalDue', formatMoney(sales.reduce((s, i) => s + parseFloat(i.due || 0), 0)));
  setText('repDue', $('totalDue')?.textContent || '0');
  setText('todayTxCount', sales.filter(i => i.date === today).length);
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
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    labels.push(ds.slice(5));
    data.push(AppState.allSalesCache.filter(s => s.date === ds).reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0));
  }
  if (AppState.charts.sales) AppState.charts.sales.destroy();
  const ctx = $('salesChart')?.getContext('2d');
  if (!ctx) return;
  AppState.charts.sales = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: t('sales'), data, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#6366f1', pointRadius: 5, borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
};

window.renderInvoices = (sales) => {
  const c = $('invoiceCardsContainer');
  if (!c) return;
  const q = ($('invoiceSearchFilter')?.value || '').toLowerCase();
  const filter = $('invoiceFilter')?.value || '';
  let filtered = sales.slice().reverse();
  if (q) filtered = filtered.filter(s => (s.invoiceNo || '').toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q));
  if (filter === 'paid') filtered = filtered.filter(s => parseFloat(s.due) <= 0);
  if (filter === 'due') filtered = filtered.filter(s => parseFloat(s.due) > 0);
  if (filtered.length === 0) { c.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><h5>${t('invoices')}: 0</h5></div></div>`; return; }
  const fragment = document.createDocumentFragment();
  filtered.slice(0, 60).forEach(s => {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4';
    div.innerHTML = `<div class="card-premium p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div class="fw-bold text-primary">${escapeHtml(s.invoiceNo)}</div>
          <small class="text-muted">${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</small>
        </div>
        <span class="tag ${parseFloat(s.due) > 0 ? 'tag-warning' : 'tag-success'}">${parseFloat(s.due) > 0 ? t('due_status') : t('paid_status')}</span>
      </div>
      <div class="mb-2"><small class="text-muted">${t('customer')}:</small> <strong>${escapeHtml(s.customerName || '—')}</strong></div>
      <div class="d-flex justify-content-between align-items-center">
        <div><small class="text-muted">${t('total')}</small><div class="fw-bold text-primary">৳${s.totalAmount}</div></div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" onclick="printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-sm btn-outline-success" onclick="downloadInvoice('${s.id}')"><i class="fas fa-download"></i></button>
        </div>
      </div>
    </div>`;
    fragment.appendChild(div);
  });
  c.innerHTML = ''; c.appendChild(fragment);
};

window.filterInvoices = () => renderInvoices(AppState.allSalesCache);

window.updateTotalExpense = (exp) => {
  const totalExpense = exp.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  setText('totalExpense', formatMoney(totalExpense));
  setText('repExpense', formatMoney(totalExpense));
  const ts = parseFloat(($('totalSales')?.textContent || '0').replace(/[^\d.]/g, '')) || 0;
  const net = ts - totalExpense;
  setText('repProfit', formatMoney(net));
  setText('netProfitQuick', '৳' + formatMoney(net));
  setText('netProfitQuick2', '৳' + formatMoney(net));
};

window.renderCustomerSelect = () => {
  const s = $('customerSelect');
  if (!s) return;
  const curVal = s.value;
  s.innerHTML = `<option value="">${currentLang === 'bn' ? 'সাধারণ কাস্টমার (নগদ)' : 'General Customer (Cash)'}</option>`;
  AppState.customers.forEach(c => { s.innerHTML += `<option value="${c.id}" data-due="${c.due || 0}">${escapeHtml(c.name)} (৳${c.due || 0})</option>`; });
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
    setHtml('customerDueBadge', `<i class="fas fa-circle-exclamation me-1"></i>${t('due')}: ৳${formatMoney(due)}`);
  } else {
    AppState.currentCustomerDue = 0;
    AppState.currentCustomerId = null;
    setHtml('customerDueBadge', `<i class="fas fa-circle-check me-1"></i>${t('cash_sale')}`);
  }
  calculateCartTotal();
};

window.selectProduct = (id) => {
  AppState.lastSelectedProductId = id;
  const item = AppState.inventory.find(i => i.id === id);
  if (item) {
    $('productSearch').value = item.name;
    $('productSearchResults').innerHTML = '';
  }
};

window.updateQuickStats = () => { /* legacy */ };
function updateQuickStats() {
  setText('totalProducts', AppState.inventory.length);
  setText('totalProducts2', AppState.inventory.length);
  setText('totalCustomers', AppState.customers.length);
  setText('totalCustomers2', AppState.customers.length);
  const low = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD).length;
  setText('lowStockCount', low);
  setText('lowStockBadge', low);
  updateNotifDot();
}

function updateNotifDot() {
  const ls = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);
  const dc = AppState.customers.filter(c => parseFloat(c.due) > 0);
  const dot = $('notifDot');
  if (dot) dot.style.display = (ls.length + dc.length) > 0 ? 'block' : 'none';
}

window.renderLowStock = () => {
  const l = $('lowStockList');
  if (!l) return;
  l.innerHTML = '';
  const lowItems = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);
  if (lowItems.length === 0) { l.innerHTML = `<li class="list-group-item text-muted px-0">✓ ${t('stock_ok')}</li>`; return; }
  const fragment = document.createDocumentFragment();
  lowItems.forEach(i => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
    li.innerHTML = `<span><i class="fas fa-box text-danger me-2"></i>${escapeHtml(i.name)}</span><span class="tag tag-danger">${i.qty}</span>`;
    fragment.appendChild(li);
  });
  l.appendChild(fragment);
};

window.renderRecentTransactions = (sales) => {
  const l = $('recentTransactions');
  if (!l) return;
  l.innerHTML = '';
  if (sales.length === 0) { l.innerHTML = `<li class="list-group-item text-muted px-0">0</li>`; return; }
  const fragment = document.createDocumentFragment();
  sales.slice().reverse().slice(0, 5).forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
    li.innerHTML = `<span><i class="fas fa-receipt text-primary me-2"></i>${escapeHtml(s.invoiceNo)}<br><small class="text-muted">${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</small></span><span class="fw-bold">৳${s.totalAmount}</span>`;
    fragment.appendChild(li);
  });
  l.appendChild(fragment);
};

/* ═══════════════════ CART ═══════════════════ */
window.addToCartFromSearch = () => {
  const id = AppState.lastSelectedProductId;
  if (!id) { showToast('warning', t('product')); return; }
  const item = AppState.inventory.find(i => i.id === id);
  if (!item) return;
  const qty = parseInt($('productQty').value) || 1;
  if (parseInt(item.qty) < qty) { showToast('error', t('stock'), `${item.qty}`); return; }
  const idx = AppState.cart.findIndex(i => i.id === id);
  if (idx > -1) { AppState.cart[idx].qty += qty; }
  else { AppState.cart.push({ id: item.id, name: item.name, price: parseFloat(item.sellPrice), qty }); }
  renderCart();
  AppState.lastSelectedProductId = null;
  $('productSearch').value = '';
  $('productSearchResults').innerHTML = '';
  $('productQty').value = '1';
  showToast('success', t('add'), `${item.name} × ${qty}`);
};

window.removeFromCart = (i) => { AppState.cart.splice(i, 1); renderCart(); };

window.clearCart = async () => {
  const ok = await showConfirm(t('clear'), t('cart') + '?', { type: 'warning' });
  if (ok) { AppState.cart = []; renderCart(); showToast('info', t('clear')); }
};

window.renderCart = () => {
  const c = $('cartItemsList');
  if (!c) return;
  c.innerHTML = '';
  setText('cartCountBadge', AppState.cart.length);
  if (AppState.cart.length === 0) {
    c.innerHTML = `<div class="empty-state py-4"><i class="fas fa-shopping-cart"></i><p class="mb-0">${t('cart')}: 0</p></div>`;
    setText('cartTotal', '0.00'); setText('cartSubtotal', '0.00');
    setText('cartDiscount', '0.00'); setText('duePreview', '৳0.00');
    const btn = $('completeSaleBtn'); if (btn) btn.disabled = true;
    return;
  }
  let subtotal = 0;
  const fragment = document.createDocumentFragment();
  AppState.cart.forEach((item, i) => {
    const tot = item.price * item.qty;
    subtotal += tot;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border);';
    div.innerHTML = `
      <div>
        <div class="fw-bold">${escapeHtml(item.name)}</div>
        <div class="small text-muted">৳${item.price} × ${item.qty}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">৳${formatMoney(tot)}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${i})"><i class="fas fa-times"></i></button>
      </div>`;
    fragment.appendChild(div);
  });
  c.appendChild(fragment);
  setText('cartSubtotal', formatMoney(subtotal));
  calculateCartTotal();
};

window.calculateCartTotal = () => {
  const subtotal = parseFloat(($('cartSubtotal')?.textContent || '0').replace(/[^\d.]/g, '')) || 0;
  const discount = parseFloat($('discountInput')?.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const paid = parseFloat($('paidAmount')?.value) || 0;
  const change = Math.max(0, paid - total);
  const due = Math.max(0, total - paid);
  setText('cartDiscount', formatMoney(discount));
  setText('cartTotal', formatMoney(total));
  setText('changeAmount', '৳' + formatMoney(change));
  setText('duePreview', '৳' + formatMoney(due));
  const cc = $('cartLiveCard'); if (cc) cc.classList.toggle('active', AppState.cart.length > 0);
  const btn = $('completeSaleBtn'); if (btn) btn.disabled = AppState.cart.length === 0;
  const s1 = $('step1'), s2 = $('step2');
  if (s1) s1.classList.toggle('done', AppState.cart.length > 0);
  if (s2) s2.classList.toggle('active', AppState.cart.length > 0);
};

window.completeSale = async () => {
  if (AppState.cart.length === 0) { showToast('warning', t('cart')); return; }
  const s = $('customerSelect');
  const cId = s.value;
  const cDue = parseFloat(s.options[s.selectedIndex]?.getAttribute('data-due')) || 0;
  const paid = parseFloat($('paidAmount').value) || 0;
  const discount = parseFloat($('discountInput').value) || 0;
  const subtotal = parseFloat(($('cartSubtotal').textContent || '0').replace(/[^\d.]/g, '')) || 0;
  const total = Math.max(0, subtotal - discount);
  const due = Math.max(0, total - paid);
  if (due > 0 && !cId) { showToast('warning', t('customer')); return; }
  const ok = await showConfirm(t('complete_sale'), `${t('total')}: ৳${formatMoney(total)} | ${t('paid')}: ৳${formatMoney(paid)} | ${t('due')}: ৳${formatMoney(due)}`, { type: 'success', okText: t('complete_sale') });
  if (!ok) return;
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    const r = push(ref(db, 'users/' + uid + '/sales'));
    const cName = s.options[s.selectedIndex]?.text.split('(')[0].trim() || 'Cash';
    const now = new Date();
    const invoiceNo = 'INV-' + Date.now().toString().slice(-6);
    await set(r, {
      id: r.key, invoiceNo, name: AppState.cart.map(i => i.name).join(', '),
      qty: AppState.cart.reduce((a, b) => a + b.qty, 0), totalAmount: total, paid, due,
      customerId: cId, customerName: cName,
      date: now.toISOString().split('T')[0], time: getTimeBn(now), createdAt: now.toISOString()
    });
    if (due > 0 && cId) { await update(ref(db, 'users/' + uid + '/customers/' + cId), { due: cDue + due }); }
    for (const item of AppState.cart) {
      const inv = AppState.inventory.find(i => i.id === item.id);
      if (inv) { await update(ref(db, 'users/' + uid + '/inventory/' + inv.id), { qty: parseInt(inv.qty) - item.qty }); }
    }
    logActivity('বিক্রয়', `${cName} - ${AppState.cart.length} items`, total, { customerName: cName, invoiceNo });
    AppState.cart = [];
    renderCart();
    $('paidAmount').value = '';
    $('discountInput').value = '0';
    showToast('success', t('complete_sale'), `৳${formatMoney(total)}`);
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

/* ═══════════════════ INVOICE ═══════════════════ */
window.printInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Invoice ${escapeHtml(s.invoiceNo)}</title><style>body{font-family:Arial;padding:20px}.header{text-align:center;border-bottom:2px solid #6366f1;padding-bottom:20px;margin-bottom:20px}.header h1{color:#6366f1}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border:1px solid #ddd;text-align:left}th{background:#6366f1;color:#fff}.print-btn{display:block;margin:20px auto;padding:10px 30px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer}@media print{.print-btn{display:none}}</style></head><body>
  <div class="header"><h1>HesabKhata Enterprise</h1><p>${escapeHtml(AppState.currentUserShopName)}</p><p>${escapeHtml(AppState.currentUserAddress)}</p></div>
  <p><strong>Invoice:</strong> ${escapeHtml(s.invoiceNo)} | <strong>Date:</strong> ${escapeHtml(s.date)} ${escapeHtml(s.time || '')}</p>
  <p><strong>Customer:</strong> ${escapeHtml(s.customerName)}</p>
  <table><tr><th>Product</th><th>Amount</th></tr><tr><td>${escapeHtml(s.name)}</td><td>৳${s.totalAmount}</td></tr></table>
  <p><strong>Paid:</strong> ৳${s.paid} | <strong>Due:</strong> ৳${s.due}</p>
  <button class="print-btn" onclick="window.print()">Print</button></body></html>`);
  w.document.close();
};

window.downloadInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const c = `HesabKhata Enterprise\nInvoice: ${s.invoiceNo}\nDate: ${s.date} ${s.time || ''}\nCustomer: ${s.customerName}\nProducts: ${s.name}\nTotal: ৳${s.totalAmount}\nPaid: ৳${s.paid}\nDue: ৳${s.due}`;
  downloadFile(c, `Invoice-${s.invoiceNo}.txt`, 'text/plain');
  showToast('success', t('download'));
};

window.shareInvoice = (id) => {
  const s = AppState.allSalesCache.find(x => x.id === id);
  if (!s) return;
  const tt = `📄 HesabKhata\nInvoice: ${s.invoiceNo}\nDate: ${s.date}\nCustomer: ${s.customerName}\nTotal: ৳${s.totalAmount}\nDue: ৳${s.due}`;
  if (navigator.share) navigator.share({ title: 'Invoice', text: tt }).catch(() => {});
  else navigator.clipboard.writeText(tt).then(() => showToast('success', t('copy')));
};

/* ═══════════════════ EXPORTS ═══════════════════ */
window.exportSales = () => {
  let c = 'Invoice,Customer,Products,Total,Paid,Due,Date,Time\n';
  AppState.allSalesCache.forEach(s => { c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date},${s.time || ''}\n`; });
  downloadFile(c, 'sales.csv');
  showToast('success', t('export'));
};

window.exportInventory = () => {
  let c = 'Name,Qty,BuyPrice,SellPrice,Profit\n';
  AppState.inventory.forEach(i => { c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice},${(i.sellPrice - i.buyPrice).toFixed(2)}\n`; });
  downloadFile(c, 'inventory.csv');
  showToast('success', t('export'));
};

window.exportExpenses = () => {
  let c = 'Description,Amount,Date,Time\n';
  AppState.allExpensesCache.forEach(e => { c += `${e.title},${e.amount},${e.date},${e.time || ''}\n`; });
  downloadFile(c, 'expenses.csv');
  showToast('success', t('export'));
};

window.exportMasterList = () => {
  const type = $('masterDataType').value;
  let c = '';
  if (type === 'all' || type === 'sales') {
    c += '\n=== SALES ===\nInvoice,Customer,Products,Total,Paid,Due,Date,Time\n';
    AppState.allSalesCache.forEach(s => { c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date},${s.time || ''}\n`; });
  }
  if (type === 'all' || type === 'inventory') {
    c += '\n=== INVENTORY ===\nName,Qty,Buy,Sell\n';
    AppState.inventory.forEach(i => { c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice}\n`; });
  }
  if (type === 'all' || type === 'customers') {
    c += '\n=== CUSTOMERS ===\nName,Phone,Due\n';
    AppState.customers.forEach(x => { c += `${x.name},${x.phone},${x.due}\n`; });
  }
  if (type === 'all' || type === 'expenses') {
    c += '\n=== EXPENSES ===\nDesc,Amount,Date,Time\n';
    AppState.allExpensesCache.forEach(e => { c += `${e.title},${e.amount},${e.date},${e.time || ''}\n`; });
  }
  downloadFile(c, 'master-list.csv');
  showToast('success', t('export'));
};

/* ═══════════════════ BACKUP / RESTORE ═══════════════════ */
window.exportAllData = () => {
  const backup = {
    exportedAt: new Date().toISOString(), version: '9.0',
    user: { email: AppState.currentUser.email, uid: AppState.currentUser.uid, fullName: AppState.currentUserFullName, shopName: AppState.currentUserShopName, address: AppState.currentUserAddress, role: AppState.currentUserRole },
    inventory: AppState.inventory, customers: AppState.customers,
    sales: AppState.allSalesCache, expenses: AppState.allExpensesCache,
    activityLog: AppState.activityLog, loginHistory: AppState.loginHistory,
    settings: AppState.userSettings
  };
  downloadFile(JSON.stringify(backup, null, 2), `hesabkhata-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('success', t('export_all'));
};

window.exportAllCSV = () => {
  let c = `=== HESABKHATA BACKUP ===\nDate: ${new Date().toLocaleString()}\n\n`;
  c += '=== INVENTORY ===\nName,Qty,Buy,Sell\n';
  AppState.inventory.forEach(i => { c += `${i.name},${i.qty},${i.buyPrice},${i.sellPrice}\n`; });
  c += '\n=== CUSTOMERS ===\nName,Phone,Due\n';
  AppState.customers.forEach(x => { c += `${x.name},${x.phone},${x.due}\n`; });
  c += '\n=== SALES ===\nInvoice,Customer,Products,Total,Paid,Due,Date\n';
  AppState.allSalesCache.forEach(s => { c += `${s.invoiceNo},${s.customerName},"${s.name}",${s.totalAmount},${s.paid},${s.due},${s.date}\n`; });
  c += '\n=== EXPENSES ===\nDesc,Amount,Date\n';
  AppState.allExpensesCache.forEach(e => { c += `${e.title},${e.amount},${e.date}\n`; });
  downloadFile(c, `hesabkhata-full-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('success', t('csv_export'));
};

window.importData = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      const ok = await showConfirm(t('import_data'), t('import_data') + '?', { type: 'warning' });
      if (!ok) return;
      showLoader(true);
      const uid = AppState.impersonatingUser || AppState.currentUser.uid;
      if (data.inventory) for (const item of data.inventory) await set(ref(db, 'users/' + uid + '/inventory/' + item.id), item);
      if (data.customers) for (const item of data.customers) await set(ref(db, 'users/' + uid + '/customers/' + item.id), item);
      if (data.sales) for (const item of data.sales) await set(ref(db, 'users/' + uid + '/sales/' + item.id), item);
      if (data.expenses) for (const item of data.expenses) await set(ref(db, 'users/' + uid + '/expenses/' + item.id), item);
      showToast('success', t('import_data'));
    } catch (err) { showToast('error', 'Error'); }
    showLoader(false);
    e.target.value = '';
  };
  reader.readAsText(file);
};

window.confirmDeleteAll = async () => {
  const ok = await showConfirm(t('delete_all'), t('delete_all') + '?', { type: 'danger', danger: true });
  if (!ok) return;
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await remove(ref(db, 'users/' + uid + '/inventory'));
    await remove(ref(db, 'users/' + uid + '/customers'));
    await remove(ref(db, 'users/' + uid + '/sales'));
    await remove(ref(db, 'users/' + uid + '/expenses'));
    showToast('success', t('delete_all'));
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.deleteItem = async (col, id) => {
  const ok = await showConfirm(t('delete'), t('delete') + '?', { type: 'danger', danger: true });
  if (!ok) return;
  showLoader(true);
  try {
    const uid = AppState.impersonatingUser || AppState.currentUser.uid;
    await remove(ref(db, 'users/' + uid + '/' + col + '/' + id));
    showToast('success', t('delete'));
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

/* ═══════════════════ ANALYTICS & REPORTS ═══════════════════ */
function renderAnalytics(sales) {
  const pc = {};
  sales.forEach(s => { (s.name ? s.name.split(', ') : []).forEach(n => { pc[n] = (pc[n] || 0) + 1; }); });
  const top = Object.entries(pc).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (AppState.charts.category) AppState.charts.category.destroy();
  const cc = $('categoryChart')?.getContext('2d');
  if (cc) {
    AppState.charts.category = new Chart(cc, {
      type: 'doughnut',
      data: { labels: top.map(p => p[0]), datasets: [{ data: top.map(p => p[1]), backgroundColor: ['#6366f1','#06b6d4','#f43f5e','#f59e0b','#10b981'], borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  const paid = sales.reduce((s, i) => s + parseFloat(i.paid || 0), 0);
  const due = sales.reduce((s, i) => s + parseFloat(i.due || 0), 0);
  if (AppState.charts.payment) AppState.charts.payment.destroy();
  const pc2 = $('paymentChart')?.getContext('2d');
  if (pc2) {
    AppState.charts.payment = new Chart(pc2, {
      type: 'pie',
      data: { labels: [t('paid'), t('due')], datasets: [{ data: [paid, due], backgroundColor: ['#10b981','#ef4444'], borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function renderReports(sales) {
  const exp = AppState.allExpensesCache;
  const ts = sales.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0);
  const te = exp.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  setText('repSales', formatMoney(ts));
  setText('repExpense', formatMoney(te));
  setText('repProfit', formatMoney(ts - te));

  // Additional calculations
  const totalCost = sales.reduce((s, i) => s + parseFloat(i.totalAmount || 0) - parseFloat(i.paid || 0) * 0, 0); // Placeholder
  const totalItemsSold = sales.reduce((s, i) => s + (parseInt(i.qty) || 0), 0);
  const avgSale = sales.length ? ts / sales.length : 0;
  const profitMargin = ts > 0 ? ((ts - te) / ts * 100) : 0;

  setText('repItemsSold', totalItemsSold);
  setText('repAvgSale', '৳' + formatMoney(avgSale));
  setText('repProfitMargin', formatMoney(profitMargin) + '%');

  // Total cost = sum of buyPrice * qty for sold items — approximation
  let estimatedCost = 0;
  sales.forEach(s => {
    // Approximate cost based on items sold
    estimatedCost += parseFloat(s.totalAmount || 0) * 0.7; // 70% assumed cost
  });
  setText('repTotalCost', '৳' + formatMoney(estimatedCost));

  const months = {};
  sales.forEach(s => { const m = s.date?.slice(0, 7); if (m) months[m] = (months[m] || 0) + parseFloat(s.totalAmount || 0); });
  const ml = Object.keys(months).sort().slice(-6);
  if (AppState.charts.monthly) AppState.charts.monthly.destroy();
  const mc = $('monthlyReportChart')?.getContext('2d');
  if (mc) {
    AppState.charts.monthly = new Chart(mc, {
      type: 'bar',
      data: { labels: ml, datasets: [{ label: t('monthly_sales'), data: ml.map(m => months[m]), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
  const em = {};
  exp.forEach(e => { const m = e.date?.slice(0, 7); if (m) em[m] = (em[m] || 0) + parseFloat(e.amount || 0); });
  if (AppState.charts.profit) AppState.charts.profit.destroy();
  const pc = $('profitChart')?.getContext('2d');
  if (pc) {
    AppState.charts.profit = new Chart(pc, {
      type: 'line',
      data: {
        labels: ml,
        datasets: [
          { label: t('total_income'), data: ml.map(m => months[m] || 0), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
          { label: t('total_expense'), data: ml.map(m => em[m] || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }
}

/* ═══════════════════ MASTER LIST ═══════════════════ */
window.renderMasterList = () => {
  const type = $('masterDataType')?.value || 'all';
  const q = ($('masterSearchFilter')?.value || '').toLowerCase();
  const from = $('masterDateFrom')?.value || '';
  const to = $('masterDateTo')?.value || '';
  const th = $('masterTableHead'), tb = $('masterTableBody');
  if (!th || !tb) return;
  let headers = [], rows = [];
  if (type === 'all' || type === 'sales') {
    AppState.allSalesCache.forEach(s => {
      if (q && !(s.invoiceNo || '').toLowerCase().includes(q) && !(s.customerName || '').toLowerCase().includes(q)) return;
      if (from && s.date < from) return;
      if (to && s.date > to) return;
      rows.push([`<span class="tag tag-primary">${t('sales')}</span>`, s.invoiceNo, s.customerName, '৳' + s.totalAmount, s.date, s.time || '—']);
    });
  }
  if (type === 'all' || type === 'inventory') {
    AppState.inventory.forEach(p => {
      if (q && !p.name.toLowerCase().includes(q)) return;
      rows.push([`<span class="tag tag-success">${t('products')}</span>`, p.name, p.qty, '৳' + p.buyPrice, '৳' + p.sellPrice, '—']);
    });
  }
  if (type === 'all' || type === 'customers') {
    AppState.customers.forEach(c => {
      if (q && !c.name.toLowerCase().includes(q)) return;
      rows.push([`<span class="tag tag-info">${t('customers')}</span>`, c.name, c.phone, '৳' + (c.due || 0), '—', '—']);
    });
  }
  if (type === 'all' || type === 'expenses') {
    AppState.allExpensesCache.forEach(e => {
      if (q && !e.title.toLowerCase().includes(q)) return;
      if (from && e.date < from) return;
      if (to && e.date > to) return;
      rows.push([`<span class="tag tag-danger">${t('expenses')}</span>`, e.title, '৳' + e.amount, e.date, e.time || '—', '']);
    });
  }
  if (type === 'all') headers = [t('action'), t('description'), t('name'), t('amount'), t('date'), t('time')];
  else if (type === 'sales') headers = [t('action'), t('invoice'), t('customer'), t('total'), t('date'), t('time')];
  else if (type === 'inventory') headers = [t('action'), t('product'), t('stock'), t('buy_price'), t('sell_price'), t('time')];
  else if (type === 'customers') headers = [t('action'), t('name'), t('phone'), t('due'), t('date'), t('time')];
  else if (type === 'expenses') headers = [t('action'), t('description'), t('amount'), t('date'), t('time'), ''];
  th.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  if (rows.length === 0) { tb.innerHTML = `<tr><td colspan="${headers.length}" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = r.map(c => `<td>${c}</td>`).join('');
    fragment.appendChild(tr);
  });
  tb.innerHTML = ''; tb.appendChild(fragment);
};

/* ═══════════════════ PROFILE ═══════════════════ */
function renderProfile() {
  const data = AppState.currentUserData || {};
  const user = AppState.currentUser;
  if (!user) return;
  const email = AppState.impersonatingUser ? data.email : user.email;
  const initial = (email[0] || 'U').toUpperCase();
  setText('profileAvatar', initial);
  setText('profileFullName', data.fullName || '—');
  setText('profileEmail', email);
  setText('profileRole', AppState.currentUserRole);
  setText('infoFullName', data.fullName || '—');
  setText('infoEmail', email);
  setText('infoPhone', data.phone || '—');
  setText('infoShopName', data.shopName || '—');
  setText('infoAddress', data.address || '—');
  setText('infoRole', AppState.currentUserRole);
  setText('infoCreatedDate', data.createdAtDate || '—');
  setText('infoCreatedTime', data.createdAtTime || '—');
  setText('infoUid', user.uid);
  setText('infoIp', data.lastIp || data.registrationIp || AppState.currentIP || '—');
  setText('infoDevice', data.lastDevice || data.registrationDevice || '—');
  setText('infoBrowser', data.lastBrowser || data.registrationBrowser || '—');
  setText('infoLocation', data.lastLocation || data.registrationLocation || '—');
  setText('infoLastLogin', data.lastLogin ? `${data.lastLogin.date} • ${data.lastLogin.time}` : '—');
  setText('infoCreated', data.createdAt ? new Date(data.createdAt).toLocaleString() : '—');
  const status = data.status || 'Active';
  const statusEl = $('infoAccountStatus');
  if (statusEl) { statusEl.textContent = status; statusEl.className = status === 'Active' ? 'text-success' : 'text-danger'; }
}
window.renderProfile = renderProfile;

window.openProfile = (e) => { if (e) e.preventDefault(); closeUserDropdown(); showSection('profile'); };
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
window.openSettings = (e) => { if (e) e.preventDefault(); closeUserDropdown(); showSection('settings'); };
window.openLoginHistory = (e) => { if (e) e.preventDefault(); closeUserDropdown(); new bootstrap.Modal($('loginHistoryModal')).show(); };
window.openChangePassword = () => { $('pwdEmail').value = AppState.currentUser.email; new bootstrap.Modal($('changePasswordModal')).show(); };

window.saveProfile = async () => {
  const name = $('editProfileName').value.trim();
  const phone = $('editProfilePhone').value.trim();
  const shopName = $('editProfileShopName').value.trim();
  const address = $('editProfileAddress').value.trim();
  if (!name) { showToast('warning', t('full_name')); return; }
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
    ['userName','welcomeName','dropdownName'].forEach(id => setText(id, name));
    renderProfile();
    showToast('success', t('save_profile'));
    bootstrap.Modal.getInstance($('editProfileModal')).hide();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.sendPasswordReset = async () => {
  try {
    await sendPasswordResetEmail(auth, AppState.currentUser.email);
    showToast('success', t('send_reset'), AppState.currentUser.email);
    bootstrap.Modal.getInstance($('changePasswordModal')).hide();
  } catch (e) { showToast('error', e.message); }
};

/* ═══════════════════ LOGIN HISTORY ═══════════════════ */
function loadLoginHistory() {
  if (!AppState.currentUser) return;
  const uid = AppState.impersonatingUser || AppState.currentUser.uid;
  AppState.unsubscribers.push(onValue(ref(db, 'users/' + uid + '/loginHistory'), (snap) => {
    const data = snap.val() ? Object.values(snap.val()) : [];
    data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    AppState.loginHistory = data;
    renderLoginHistory();
  }));
}

function renderLoginHistory() {
  const el = $('loginHistoryList'), cnt = $('loginHistoryCount'), modalEl = $('loginHistoryModalContent');
  if (cnt) cnt.textContent = AppState.loginHistory.length;
  const html = AppState.loginHistory.length === 0
    ? `<div class="text-center text-muted py-3"><i class="fas fa-clock-rotate-left fa-2x mb-2"></i><p>0</p></div>`
    : AppState.loginHistory.slice(0, 20).map(h => `
        <div class="login-history-item">
          <div class="lh-icon"><i class="fas fa-right-to-bracket"></i></div>
          <div class="lh-content">
            <div class="lh-title">${escapeHtml(h.action || 'Login')}</div>
            <div class="lh-meta">
              <span><i class="fas fa-calendar"></i> ${escapeHtml(h.date)} ${escapeHtml(h.time)}</span>
              <span><i class="fas fa-globe"></i> ${escapeHtml(h.ip)}</span>
              <span><i class="fas fa-desktop"></i> ${escapeHtml(h.device)}</span>
            </div>
          </div>
        </div>`).join('');
  if (el) el.innerHTML = html;
  if (modalEl) modalEl.innerHTML = html;
}

/* ═══════════════════ USER DROPDOWN ═══════════════════ */
window.toggleUserDropdown = (e) => {
  e.stopPropagation();
  const dd = $('userDropdown');
  if (dd) dd.classList.toggle('show');
};
function closeUserDropdown() { const dd = $('userDropdown'); if (dd) dd.classList.remove('show'); }
document.addEventListener('click', (e) => {
  const dd = $('userDropdown');
  if (dd && !dd.contains(e.target) && !e.target.closest('.user-menu-btn')) dd.classList.remove('show');
});

/* ═══════════════════ ADMIN PANEL ═══════════════════ */
function loadAllUsers() {
  if (!AppState.currentUser) return;
  AppState.unsubscribers.push(onValue(ref(db, 'users'), (snap) => {
    const users = snap.val() ? Object.values(snap.val()) : [];
    AppState.allUsersCache = users;
    populateAdminUserDropdown(users);
    renderAdminUsersList();
    renderAdminGlobalStats(users);
  }));
}

function populateAdminUserDropdown(users) {
  const sel = $('adminUserSelect');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="">${t('select_placeholder')}</option>`;
  users.forEach(u => {
    if (u.uid === AppState.currentUser.uid) return;
    sel.innerHTML += `<option value="${u.uid}">${escapeHtml(u.fullName || u.email)} — ${escapeHtml(u.role || 'Staff')}</option>`;
  });
  if (cur) sel.value = cur;
}

function renderAdminGlobalStats(users) {
  setText('adminTotalUsers', users.length);
  setText('adminActiveUsers', users.filter(u => (u.status || 'Active') === 'Active').length);
  setText('adminBlockedUsers', users.filter(u => u.status === 'Blocked').length);
  setText('adminTotalShops', users.filter(u => u.shopName).length);
}

window.renderAdminUsersList = () => {
  const tbody = $('adminUsersListTable');
  if (!tbody) return;
  const q = ($('adminUserSearch')?.value || '').toLowerCase();
  const rf = $('adminRoleFilter')?.value || '';
  const sf = $('adminStatusFilter')?.value || '';
  let users = [...AppState.allUsersCache];
  if (q) users = users.filter(u => (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  if (rf) users = users.filter(u => (u.role || 'Staff') === rf);
  if (sf) users = users.filter(u => (u.status || 'Active') === sf);
  if (users.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">0</td></tr>`; return; }
  const fragment = document.createDocumentFragment();
  users.forEach(u => {
    const rb = u.role === 'Admin' ? 'tag-warning' : u.role === 'Manager' ? 'tag-primary' : 'tag-success';
    const sb = u.status === 'Blocked' ? 'tag-danger' : u.status === 'Suspended' ? 'tag-warning' : 'tag-success';
    const cur = u.uid === AppState.currentUser.uid;
    const cdate = u.createdAt ? new Date(u.createdAt) : null;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(u.fullName || '—')}</strong>${cur ? ' <span class="tag tag-info">You</span>' : ''}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="tag ${rb}">${escapeHtml(u.role || 'Staff')}</span></td>
      <td><span class="tag ${sb}">${escapeHtml(u.status || 'Active')}</span></td>
      <td>${cdate ? getDateBn(cdate) : '—'}</td>
      <td>${cur ? '—' : `
        <button class="btn btn-sm btn-outline-primary" onclick="selectAdminUser('${u.uid}')"><i class="fas fa-hand-pointer"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="adminDeleteUserById('${u.uid}','${escapeHtml(u.email)}')"><i class="fas fa-trash"></i></button>`}
      </td>`;
    fragment.appendChild(tr);
  });
  tbody.innerHTML = ''; tbody.appendChild(fragment);
};

window.selectAdminUser = (uid) => {
  const sel = $('adminUserSelect');
  if (sel) { sel.value = uid; onAdminUserSelect(); }
};

window.onAdminUserSelect = () => {
  const uid = $('adminUserSelect')?.value;
  if (!uid) { clearUserSelection(); return; }
  const user = AppState.allUsersCache.find(u => u.uid === uid);
  if (!user) { clearUserSelection(); return; }
  AppState.selectedAdminUser = user;
  const panel = $('selectedUserPanel'); if (panel) panel.style.display = 'block';
  const badge = $('selectedUserBadge');
  if (badge) { badge.style.display = 'inline-flex'; setText('selectedUserBadgeName', user.fullName || user.email); }
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
  ['inventory','customers','sales','expenses'].forEach(type => {
    onValue(ref(db, 'users/' + uid + '/' + type), (snap) => {
      const data = snap.val() ? Object.values(snap.val()) : [];
      const count = data.length;
      const el = $('adStat' + type.charAt(0).toUpperCase() + type.slice(1));
      if (el) el.textContent = count;

      // Money calculations
      if (type === 'sales') {
        const totalSales = data.reduce((s, x) => s + parseFloat(x.totalAmount || 0), 0);
        const totalPaid = data.reduce((s, x) => s + parseFloat(x.paid || 0), 0);
        const totalDue = data.reduce((s, x) => s + parseFloat(x.due || 0), 0);
        setText('adMoneySales', '৳' + formatMoney(totalSales));
        setText('adMoneyPaid', '৳' + formatMoney(totalPaid));
        setText('adMoneyDue', '৳' + formatMoney(totalDue));
      }
      if (type === 'expenses') {
        const totalExp = data.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
        setText('adMoneyExpense', '৳' + formatMoney(totalExp));
      }
      if (type === 'inventory') {
        const stockValue = data.reduce((s, x) => s + (parseFloat(x.buyPrice || 0) * parseInt(x.qty || 0)), 0);
        const potentialProfit = data.reduce((s, x) => s + ((parseFloat(x.sellPrice || 0) - parseFloat(x.buyPrice || 0)) * parseInt(x.qty || 0)), 0);
        setText('adMoneyStockValue', '৳' + formatMoney(stockValue));
        setText('adMoneyPotential', '৳' + formatMoney(potentialProfit));
        setText('adMoneyInvestment', '৳' + formatMoney(stockValue));
      }
      if (type === 'customers') {
        const custDue = data.reduce((s, x) => s + parseFloat(x.due || 0), 0);
        setText('adMoneyCustDue', '৳' + formatMoney(custDue));
      }

      // Calculate net profit
      const salesTotal = AppState.allUsersCache.find(u => u.uid === uid) ? 0 : 0;
      setTimeout(() => {
        const ts = parseFloat(($('adMoneySales')?.textContent || '0').replace(/[^\d.]/g, '')) || 0;
        const te = parseFloat(($('adMoneyExpense')?.textContent || '0').replace(/[^\d.]/g, '')) || 0;
        setText('adMoneyProfit', '৳' + formatMoney(ts - te));
      }, 100);
    }, { onlyOnce: true });
  });
}

window.clearUserSelection = () => {
  AppState.selectedAdminUser = null;
  const sel = $('adminUserSelect'); if (sel) sel.value = '';
  const panel = $('selectedUserPanel'); if (panel) panel.style.display = 'none';
  const badge = $('selectedUserBadge'); if (badge) badge.style.display = 'none';
};

window.refreshUserList = () => { showToast('success', t('refresh')); };

window.switchAdminTab = (tab, el) => {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const content = $('admin-tab-' + tab);
  if (content) content.classList.add('active');
};

window.impersonateUser = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('impersonate_btn'), AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email, { type: 'warning' });
  if (!ok) return;
  AppState.impersonatingUser = AppState.selectedAdminUser.uid;
  showToast('success', t('admin_mode'), AppState.selectedAdminUser.fullName);
  setTimeout(() => onAuthStateChanged_reload(), 100);
};

window.exitImpersonation = async () => {
  if (!AppState.impersonatingUser) return;
  AppState.impersonatingUser = null;
  showToast('info', t('exit'));
  setTimeout(() => onAuthStateChanged_reload(), 100);
};

async function onAuthStateChanged_reload() {
  const user = auth.currentUser;
  if (!user) return;
  AppState.unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
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
  setText('userAvatar', initial); setText('dropdownAvatar', initial);
  setText('userName', data.fullName || 'User');
  setText('welcomeName', data.fullName || 'User');
  setText('userRoleLabel', AppState.currentUserRole);
  setText('dropdownName', data.fullName || 'User');
  setText('dropdownEmail', email);
  setText('dropdownRole', AppState.currentUserRole);
  const isAdmin = AppState.currentUserRole === 'Admin';
  const navAdmin = $('nav-admin'), adminDivider = $('adminDivider'), adminLabel = $('adminLabel');
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
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  setText('viewDataUserName', AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email);
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
  if (data.length === 0) { c.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h5>0</h5></div>`; return; }
  if (type === 'sales') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>${t('invoice')}</th><th>${t('customer')}</th><th>${t('total')}</th><th>${t('paid')}</th><th>${t('due')}</th><th>${t('date')}</th></tr></thead>
      <tbody>${data.map(s => `<tr><td>${escapeHtml(s.invoiceNo)}</td><td>${escapeHtml(s.customerName)}</td><td>৳${s.totalAmount}</td><td>৳${s.paid || 0}</td><td>৳${s.due || 0}</td><td>${escapeHtml(s.date)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'inventory') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>${t('product')}</th><th>${t('stock')}</th><th>${t('buy_price')}</th><th>${t('sell_price')}</th></tr></thead>
      <tbody>${data.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${p.qty}</td><td>৳${p.buyPrice}</td><td>৳${p.sellPrice}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'customers') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>${t('name')}</th><th>${t('phone')}</th><th>${t('due')}</th></tr></thead>
      <tbody>${data.map(x => `<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.phone)}</td><td>৳${x.due || 0}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (type === 'expenses') {
    c.innerHTML = `<div class="table-responsive"><table class="table modern-table">
      <thead><tr><th>${t('description')}</th><th>${t('amount')}</th><th>${t('date')}</th></tr></thead>
      <tbody>${data.map(e => `<tr><td>${escapeHtml(e.title)}</td><td>৳${e.amount}</td><td>${escapeHtml(e.date)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }
};

window.adminLoginHistory = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const snap = await get(ref(db, 'users/' + AppState.selectedAdminUser.uid + '/loginHistory'));
  const history = snap.val() ? Object.values(snap.val()) : [];
  history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const html = history.length === 0
    ? '<div class="empty-state"><i class="fas fa-clock-rotate-left"></i><h5>0</h5></div>'
    : history.map(h => `<div class="login-history-item"><div class="lh-icon"><i class="fas fa-right-to-bracket"></i></div><div class="lh-content"><div class="lh-title">${escapeHtml(h.action || 'Login')}</div><div class="lh-meta"><span><i class="fas fa-calendar"></i> ${escapeHtml(h.date)} ${escapeHtml(h.time)}</span><span><i class="fas fa-globe"></i> ${escapeHtml(h.ip)}</span><span><i class="fas fa-desktop"></i> ${escapeHtml(h.device)}</span></div></div></div>`).join('');
  Swal.fire({ title: AppState.selectedAdminUser.fullName || AppState.selectedAdminUser.email, html: `<div style="max-height:400px;overflow-y:auto;text-align:left;">${html}</div>`, width: 600, confirmButtonText: 'OK' });
};

window.adminSaveProfile = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const data = {
    fullName: $('adEditName').value.trim(),
    phone: $('adEditPhone').value.trim(),
    shopName: $('adEditShopName').value.trim(),
    address: $('adEditAddress').value.trim(),
    role: $('adEditRole').value,
    status: $('adEditStatus').value
  };
  if (!data.fullName) { showToast('warning', t('full_name')); return; }
  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), data);
    showToast('success', t('save_profile'));
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminResetPassword = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('reset_pwd'), AppState.selectedAdminUser.email, { type: 'warning' });
  if (!ok) return;
  try {
    await sendPasswordResetEmail(auth, AppState.selectedAdminUser.email);
    showToast('success', t('send'));
  } catch (e) { showToast('error', e.message); }
};

window.adminForceLogout = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('force_logout'), '?', { type: 'warning' });
  if (!ok) return;
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), { forceLogout: Date.now() });
    showToast('success', t('terminate'));
  } catch (e) { showToast('error', e.message); }
};

window.adminBlockUser = () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
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
  if (unit === 'forever') { setText('blockPreviewEnd', currentLang === 'bn' ? 'চিরতরে' : 'Forever'); return; }
  if (unit === 'minutes') end.setMinutes(end.getMinutes() + dur);
  else if (unit === 'hours') end.setHours(end.getHours() + dur);
  else if (unit === 'days') end.setDate(end.getDate() + dur);
  else if (unit === 'weeks') end.setDate(end.getDate() + dur * 7);
  else if (unit === 'months') end.setMonth(end.getMonth() + dur);
  setText('blockPreviewEnd', getDateBn(end) + ' ' + getTimeBn(end));
}

window.confirmAdminBlock = async () => {
  if (!AppState.selectedAdminUser) return;
  const dur = parseInt($('blockDuration').value) || 1;
  const unit = $('blockUnit').value;
  const reason = $('blockReason').value.trim() || 'Admin';
  let blockUntil = null;
  if (unit !== 'forever') {
    const end = new Date();
    if (unit === 'minutes') end.setMinutes(end.getMinutes() + dur);
    else if (unit === 'hours') end.setHours(end.getHours() + dur);
    else if (unit === 'days') end.setDate(end.getDate() + dur);
    else if (unit === 'weeks') end.setDate(end.getDate() + dur * 7);
    else if (unit === 'months') end.setMonth(end.getMonth() + dur);
    blockUntil = end.toISOString();
  }
  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), { status: 'Blocked', blockUntil, blockReason: reason });
    showToast('success', t('block'));
    bootstrap.Modal.getInstance($('adminBlockModal')).hide();
    onAdminUserSelect();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminUnblockUser = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('unblock'), '?', { type: 'success' });
  if (!ok) return;
  showLoader(true);
  try {
    await update(ref(db, 'users/' + AppState.selectedAdminUser.uid), { status: 'Active', blockUntil: null, blockReason: null });
    showToast('success', t('unblock'));
    onAdminUserSelect();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminResetUserData = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('reset_data'), '?', { type: 'danger', danger: true });
  if (!ok) return;
  showLoader(true);
  try {
    const uid = AppState.selectedAdminUser.uid;
    await remove(ref(db, 'users/' + uid + '/inventory'));
    await remove(ref(db, 'users/' + uid + '/customers'));
    await remove(ref(db, 'users/' + uid + '/sales'));
    await remove(ref(db, 'users/' + uid + '/expenses'));
    showToast('success', t('reset'));
    onAdminUserSelect();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminDeleteUser = async () => {
  if (!AppState.selectedAdminUser) { showToast('warning', t('select_user')); return; }
  const ok = await showConfirm(t('delete_user'), '?', { type: 'danger', danger: true, okText: t('delete') });
  if (!ok) return;
  showLoader(true);
  try {
    await remove(ref(db, 'users/' + AppState.selectedAdminUser.uid));
    showToast('success', t('delete'));
    clearUserSelection();
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminDeleteUserById = async (uid, email) => {
  if (uid === AppState.currentUser.uid) { showToast('warning', t('delete_user')); return; }
  const ok = await showConfirm(t('delete_user'), email, { type: 'danger', danger: true });
  if (!ok) return;
  showLoader(true);
  try {
    await remove(ref(db, 'users/' + uid));
    showToast('success', t('delete'));
  } catch (e) { showToast('error', e.message); }
  showLoader(false);
};

window.adminCreateUser = () => {
  ['newUserName','newUserEmail','newUserPhone','newUserShop','newUserAddress'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  $('newUserRole').value = 'Staff';
  $('newUserPassword').value = generateRandomPassword();
  new bootstrap.Modal($('adminNewUserModal')).show();
};

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}
window.generatePassword = () => { $('newUserPassword').value = generateRandomPassword(); };

window.confirmAdminCreateUser = async () => {
  const name = $('newUserName').value.trim();
  const email = $('newUserEmail').value.trim();
  const phone = $('newUserPhone').value.trim();
  const role = $('newUserRole').value;
  const shopName = $('newUserShop').value.trim();
  const address = $('newUserAddress').value.trim();
  const password = $('newUserPassword').value.trim();
  if (!name || !email || !password) { showToast('warning', t('full_name')); return; }
  if (password.length < 6) { showToast('error', t('password')); return; }
  const ok = await showConfirm(t('create'), email, { type: 'question' });
  if (!ok) return;
  showLoader(true);
  try {
    const adminEmail = auth.currentUser.email;
    const uc = await createUserWithEmailAndPassword(auth, email, password);
    const newUid = uc.user.uid;
    const now = new Date();
    await set(ref(db, 'users/' + newUid), {
      uid: newUid, fullName: name, email, phone, shopName, address,
      role, status: 'Active',
      createdAt: now.toISOString(),
      createdAtDate: now.toISOString().split('T')[0],
      createdAtTime: getTimeBn(now),
      createdByAdmin: adminEmail,
      settings: DEFAULT_SETTINGS
    });
    await signOut(auth);
    await Swal.fire({
      icon: 'success', title: '✓',
      html: `<div style="text-align:left;"><p><strong>${t('full_name')}:</strong> ${escapeHtml(name)}</p><p><strong>${t('email')}:</strong> ${escapeHtml(email)}</p><p><strong>${t('password')}:</strong> <code style="background:#f1f5f9;padding:4px 8px;border-radius:6px;">${escapeHtml(password)}</code></p></div>`,
      confirmButtonText: 'OK'
    });
    bootstrap.Modal.getInstance($('adminNewUserModal')).hide();
  } catch (e) {
    showToast('error', t('create'), getFirebaseErrorMessage(e.code));
    showLoader(false);
  }
};

/* ═══════════════════ NAVIGATION ═══════════════════ */
window.toggleSidebar = () => {
  const sidebar = $('sidebar'), overlay = $('overlay');
  if (sidebar) sidebar.classList.toggle('show');
  if (overlay) overlay.classList.toggle('show');
};
window.closeSidebar = () => {
  const sidebar = $('sidebar'), overlay = $('overlay');
  if (sidebar) sidebar.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
};

window.showSection = (sec) => {
  document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
  const s = $(sec + '-section');
  if (s) { s.style.display = 'block'; s.classList.add('fade-in'); }
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  const nav = $('nav-' + sec);
  if (nav) nav.classList.add('active');

  const titleMap = {
    dashboard: t('dashboard'), sales: t('new_sale'), 'sales-list': t('sales_list'),
    inventory: t('product_cards'), 'inventory-list': t('product_table'), customers: t('customers'),
    expenses: t('expense_mgmt'), 'expenses-list': t('expenses_list'), invoices: t('invoices'),
    'master-list': t('master_list'), 'activity-log': t('activity_log'),
    reports: t('reports'), analytics: t('analytics'), profile: t('profile'),
    settings: t('settings'), admin: t('admin_panel')
  };
  const subtitleMap = {
    dashboard: t('welcome_sub'), sales: t('search_add_product'),
    'sales-list': t('sales_list'), inventory: t('product_cards'),
    'inventory-list': t('product_table'), customers: t('customers'),
    expenses: t('expense_mgmt'), 'expenses-list': t('expenses_list'),
    invoices: t('invoices'), 'master-list': t('master_list'),
    'activity-log': t('activity_sub'), reports: t('detailed_reports'),
    analytics: t('analytics'), profile: t('personal_info'),
    settings: t('theme_settings'), admin: t('admin_control_sub')
  };
  setText('pageTitle', titleMap[sec] || t('dashboard'));
  setText('pageSubtitle', subtitleMap[sec] || '');

  if (sec === 'sales' || sec === 'sales-list') $('salesSubmenu')?.classList.add('show');
  if (sec === 'inventory' || sec === 'inventory-list') $('inventorySubmenu')?.classList.add('show');
  if (sec === 'expenses' || sec === 'expenses-list') $('expensesSubmenu')?.classList.add('show');

  if (sec === 'activity-log') { renderActivityLogAdvanced(); updateActivityStats(); }
  if (sec === 'profile') { renderProfile(); renderLoginHistory(); }
  if (sec === 'admin') renderAdminUsersList();
  closeSidebar();
};

/* ═══════════════════ NOTIFICATIONS ═══════════════════ */
window.showNotifications = () => {
  const ls = AppState.inventory.filter(i => parseInt(i.qty) <= LOW_STOCK_THRESHOLD);
  const dc = AppState.customers.filter(c => parseFloat(c.due) > 0);
  Swal.fire({
    title: '🔔',
    html: `<div class="text-start">
      <div class="mb-2"><i class="fas fa-triangle-exclamation text-warning me-2"></i>${t('stock_alerts')}: <strong>${ls.length}</strong></div>
      <div class="mb-2"><i class="fas fa-hand-holding-dollar text-danger me-2"></i>${t('total_due')}: <strong>${dc.length}</strong></div>
      <div><i class="fas fa-chart-line text-info me-2"></i>${t('today_sales')}: <strong>৳${$('todaySales')?.textContent || '0'}</strong></div>
    </div>`,
    confirmButtonText: 'OK'
  });
};

window.toggleFullscreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
};

/* ═══════════════════ BARCODE ═══════════════════ */
window.openBarcodeScanner = () => {
  const modal = new bootstrap.Modal($('barcodeModal'));
  modal.show();
  if (typeof ZXing === 'undefined') return;
  $('manualBarcode').value = '';
  setTimeout(() => {
    try {
      AppState.barcodeReader = new ZXing.BrowserMultiFormatReader();
      AppState.barcodeReader.decodeFromVideoDevice(null, 'barcodeReader', (result) => {
        if (result) {
          $('manualBarcode').value = result.text;
          searchByBarcode();
          closeBarcodeScanner();
        }
      });
    } catch (e) {}
  }, 500);
};

window.closeBarcodeScanner = () => {
  try { AppState.barcodeReader?.reset(); } catch (e) {}
  AppState.barcodeReader = null;
  const modal = bootstrap.Modal.getInstance($('barcodeModal'));
  if (modal) modal.hide();
};

window.searchByBarcode = () => {
  const code = $('manualBarcode').value.trim();
  if (!code) { showToast('warning', t('barcode')); return; }
  const item = AppState.inventory.find(i => (i.barcode || '') === code || i.name.toLowerCase() === code.toLowerCase());
  if (item) {
    closeBarcodeScanner();
    showSection('sales');
    AppState.lastSelectedProductId = item.id;
    $('productSearch').value = item.name;
    showToast('success', t('product'), item.name);
  } else {
    showToast('error', t('product'), code);
  }
};

/* ═══════════════════ CALCULATOR ═══════════════════ */
const calcState = { current: '0', previous: null, operator: null, waitingForOperand: false, angleMode: 'DEG', history: [], expression: '' };

window.openCalculator = (e) => {
  if (e) e.preventDefault();
  new bootstrap.Modal($('calculatorModal')).show();
  updateCalcDisplay();
};

window.switchCalcMode = (mode, el) => {
  document.querySelectorAll('.calc-tab').forEach(tt => tt.classList.remove('active'));
  el.classList.add('active');
  $('calcPadBasic').style.display = mode === 'basic' ? 'grid' : 'none';
  $('calcPadSci').style.display = mode === 'scientific' ? 'block' : 'none';
};

window.calcNum = (n) => {
  if (calcState.waitingForOperand) { calcState.current = n; calcState.waitingForOperand = false; }
  else { calcState.current = calcState.current === '0' ? n : calcState.current + n; }
  updateCalcDisplay();
};

window.calcAction = (action) => {
  const cur = parseFloat(calcState.current) || 0;
  switch (action) {
    case 'clear': calcState.current = '0'; calcState.previous = null; calcState.operator = null; calcState.waitingForOperand = false; calcState.expression = ''; break;
    case 'backspace': calcState.current = calcState.current.length > 1 ? calcState.current.slice(0, -1) : '0'; break;
    case 'decimal': if (calcState.waitingForOperand) { calcState.current = '0.'; calcState.waitingForOperand = false; } else if (!calcState.current.includes('.')) calcState.current += '.'; break;
    case 'negate': calcState.current = calcState.current.startsWith('-') ? calcState.current.slice(1) : '-' + calcState.current; break;
    case 'percent': calcState.current = String(cur / 100); break;
    case 'add': case 'subtract': case 'multiply': case 'divide':
      if (calcState.operator && !calcState.waitingForOperand) performCalc();
      calcState.previous = parseFloat(calcState.current);
      calcState.operator = action;
      calcState.waitingForOperand = true;
      calcState.expression = `${calcState.previous} ${getOpSymbol(action)}`;
      break;
    case 'equals': if (calcState.operator !== null) { performCalc(); calcState.operator = null; calcState.previous = null; calcState.waitingForOperand = true; } break;
    case 'openParen': calcState.current = calcState.current === '0' ? '(' : calcState.current + '('; break;
    case 'closeParen': calcState.current += ')'; break;
    case 'copy': navigator.clipboard.writeText(calcState.current).then(() => showToast('success', t('copy'))); break;
    case 'paste': navigator.clipboard.readText().then(tt => { if (!isNaN(parseFloat(tt))) { calcState.current = tt; updateCalcDisplay(); } }).catch(() => {}); break;
  }
  updateCalcDisplay();
};

function performCalc() {
  const prev = calcState.previous, cur = parseFloat(calcState.current);
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
}

function getOpSymbol(op) { return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op] || ''; }

window.calcFunc = (fn) => {
  let cur = parseFloat(calcState.current) || 0, result = cur;
  try {
    switch (fn) {
      case 'sin': result = Math.sin(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur); break;
      case 'cos': result = Math.cos(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur); break;
      case 'tan': result = Math.tan(calcState.angleMode === 'DEG' ? cur * Math.PI / 180 : cur); break;
      case 'log': result = Math.log10(cur); break;
      case 'ln': result = Math.log(cur); break;
      case 'sqrt': result = Math.sqrt(cur); break;
      case 'cbrt': result = Math.cbrt(cur); break;
      case 'square': result = cur * cur; break;
      case 'cube': result = cur * cur * cur; break;
      case 'inverse': result = cur === 0 ? 0 : 1 / cur; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'fact': if (cur > 170) { showToast('error'); return; } result = 1; for (let i = 2; i <= cur; i++) result *= i; break;
      case 'deg': calcState.angleMode = 'DEG'; updateCalcDisplay(); return;
    }
    calcState.current = String(result);
  } catch (e) {}
  calcState.waitingForOperand = true;
  updateCalcDisplay();
};

function updateCalcDisplay() {
  const input = $('calcInput'), hist = $('calcHistory');
  if (input) input.value = calcState.current;
  if (hist) hist.textContent = calcState.expression || (calcState.history[0] || '');
}
window.clearCalcHistory = () => { calcState.history = []; updateCalcDisplay(); };

/* ═══════════════════ COMMAND PALETTE ═══════════════════ */
(function initCommandPalette() {
  const commands = [
    { id: 'dashboard', title: t('dashboard'), icon: 'fas fa-chart-line', action: () => showSection('dashboard') },
    { id: 'new-sale', title: t('new_sale'), icon: 'fas fa-cart-plus', action: () => showSection('sales') },
    { id: 'sales-list', title: t('sales_list'), icon: 'fas fa-list-check', action: () => showSection('sales-list') },
    { id: 'inventory', title: t('product_cards'), icon: 'fas fa-box', action: () => showSection('inventory') },
    { id: 'customers', title: t('customers'), icon: 'fas fa-users', action: () => showSection('customers') },
    { id: 'expenses', title: t('expenses'), icon: 'fas fa-hand-holding-dollar', action: () => showSection('expenses') },
    { id: 'invoices', title: t('invoices'), icon: 'fas fa-file-invoice-dollar', action: () => showSection('invoices') },
    { id: 'reports', title: t('reports'), icon: 'fas fa-chart-pie', action: () => showSection('reports') },
    { id: 'analytics', title: t('analytics'), icon: 'fas fa-chart-column', action: () => showSection('analytics') },
    { id: 'activity', title: t('activity_log'), icon: 'fas fa-clock-rotate-left', action: () => showSection('activity-log') },
    { id: 'profile', title: t('profile'), icon: 'fas fa-user-circle', action: () => showSection('profile') },
    { id: 'settings', title: t('settings'), icon: 'fas fa-gear', action: () => showSection('settings') },
    { id: 'calculator', title: t('calculator'), icon: 'fas fa-calculator', action: () => openCalculator() },
    { id: 'barcode', title: t('barcode'), icon: 'fas fa-barcode', action: () => openBarcodeScanner() },
    { id: 'add-product', title: t('add_product'), icon: 'fas fa-plus-circle', action: () => new bootstrap.Modal($('addProductModal')).show() },
    { id: 'add-customer', title: t('add_customer'), icon: 'fas fa-user-plus', action: () => new bootstrap.Modal($('addCustomerModal')).show() },
    { id: 'add-expense', title: t('add_expense'), icon: 'fas fa-receipt', action: () => new bootstrap.Modal($('addExpenseModal')).show() },
    { id: 'logout', title: t('logout'), icon: 'fas fa-right-from-bracket', action: () => logout() }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'command-palette-overlay';
  overlay.innerHTML = `<div class="command-palette"><input type="text" class="command-palette-input" id="commandPaletteInput" placeholder="🔍 ..."><div class="command-palette-list" id="commandPaletteList"></div></div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#commandPaletteInput');
  const list = overlay.querySelector('#commandPaletteList');
  let activeIndex = 0, filteredCommands = [...commands];

  function render() {
    list.innerHTML = filteredCommands.map((cmd, i) => `<div class="command-palette-item ${i === activeIndex ? 'active' : ''}" data-index="${i}"><i class="${cmd.icon}"></i><span>${cmd.title}</span></div>`).join('');
    list.querySelectorAll('.command-palette-item').forEach(item => {
      item.addEventListener('click', () => execute(parseInt(item.dataset.index)));
      item.addEventListener('mouseenter', () => { activeIndex = parseInt(item.dataset.index); render(); });
    });
  }

  function execute(index) {
    const cmd = filteredCommands[index];
    if (!cmd) return;
    overlay.classList.remove('show');
    input.value = '';
    setTimeout(() => cmd.action(), 100);
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    filteredCommands = q ? commands.filter(c => c.title.toLowerCase().includes(q) || c.id.includes(q)) : [...commands];
    activeIndex = 0; render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filteredCommands.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(activeIndex); }
    else if (e.key === 'Escape') { overlay.classList.remove('show'); }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });

  window.openCommandPalette = () => { overlay.classList.add('show'); setTimeout(() => input.focus(), 50); render(); };

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); e.stopPropagation(); window.openCommandPalette(); }
  });

  render();
})();

/* ═══════════════════ KEYBOARD SHORTCUTS ═══════════════════ */
document.addEventListener('keydown', (e) => {
  const calcModal = $('calculatorModal');
  if (calcModal && calcModal.classList.contains('show')) {
    if (e.key >= '0' && e.key <= '9') calcNum(e.key);
    else if (e.key === '.') calcAction('decimal');
    else if (e.key === '+') calcAction('add');
    else if (e.key === '-') calcAction('subtract');
    else if (e.key === '*') calcAction('multiply');
    else if (e.key === '/') { e.preventDefault(); calcAction('divide'); }
    else if (e.key === 'Enter' || e.key === '=') calcAction('equals');
    else if (e.key === 'Backspace') calcAction('backspace');
    else if (e.key === 'Escape') calcAction('clear');
    return;
  }
  if (e.key === 'Enter') {
    const loginForm = $('loginForm'), registerForm = $('registerForm'), authScreen = $('authScreen');
    if (loginForm && loginForm.style.display !== 'none' && authScreen.style.display !== 'none') login();
    else if (registerForm && registerForm.style.display !== 'none') register();
  }
  if (e.key === 'Escape') { closeUserDropdown(); closeLangDropdown(); }
});

/* ═══════════════════ FAB ═══════════════════ */
(function initFAB() {
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.id = 'mainFab';
  fab.title = 'Ctrl+K';
  fab.innerHTML = '<i class="fas fa-bolt"></i>';
  fab.addEventListener('click', () => window.openCommandPalette?.());
  document.body.appendChild(fab);
})();

/* ═══════════════════ ONLINE/OFFLINE ═══════════════════ */
window.addEventListener('online', () => {
  const banner = $('offlineBanner');
  if (banner) banner.style.display = 'none';
});
window.addEventListener('offline', () => {
  const banner = $('offlineBanner');
  if (banner) banner.style.display = 'block';
});

/* ═══════════════════ DOM READY ═══════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  switchLanguage(currentLang);

  const paid = $('paidAmount'), disc = $('discountInput');
  if (paid) paid.addEventListener('input', calculateCartTotal);
  if (disc) disc.addEventListener('input', calculateCartTotal);

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (AppState.userSettings.mode === 'auto') document.documentElement.setAttribute('data-mode', mq.matches ? 'dark' : 'light');
  });
});

/* ═══════════════════ AUTO LOGOUT ═══════════════════ */
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (AppState.userSettings.autoLogout && AppState.currentUser) {
    idleTimer = setTimeout(() => { logout(); }, 30 * 60 * 1000);
  }
}
['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

/* ═══════════════════ CLEANUP ═══════════════════ */
window.addEventListener('beforeunload', () => {
  AppState.unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
});

/* ═══════════════════ CONSOLE ═══════════════════ */
console.log('%c🚀 HesabKhata Enterprise Pro v9.0', 'color:#6366f1;font-size:16px;font-weight:bold;');
console.log('%cBilingual • Admin Panel • v9.0', 'color:#06b6d4;font-size:12px;');
