import { useState, useEffect, useCallback } from "react";

// ─── Persistent Storage Helpers ───────────────────────────────────────────────
const STORAGE_KEYS = { slots: "salon_slots", bookings: "salon_bookings" };

async function loadData(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveData(key, data) {
  try { await window.storage.set(key, JSON.stringify(data)); } catch {}
}

// ─── Email Simulation ─────────────────────────────────────────────────────────
function sendEmailSimulation(to, subject, body) {
  console.log(`📧 Email to ${to}\nSubject: ${subject}\n${body}`);
}

// ─── Palette & Design System ──────────────────────────────────────────────────
const SERVICES = [
  { id: "weave", name: "Weave Installations", duration: 180, price: 350 },
  { id: "blowout", name: "Blowout", duration: 45, price: 55 },
  { id: "treatment", name: "Deep Treatment", duration: 90, price: 110 },
  { id: "facial", name: "Facial & Skincare", duration: 60, price: 95 },
  { id: "makeup", name: "Makeup Application", duration: 60, price: 120 },
];

const STYLISTS = ["Zara M.", "Lerato K.", "Amara D.", "Thandi N."];

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #FAF6F1;
    --warm: #F5EDE3;
    --blush: #E8C5B0;
    --rose: #C97B5E;
    --deep: #7A3B2E;
    --charcoal: #2C2420;
    --muted: #9B7E74;
    --white: #FFFFFF;
    --shadow: rgba(44, 36, 32, 0.12);
    --border: rgba(201, 123, 94, 0.2);
    --success: #4A7C59;
    --danger: #B94040;
    --gold: #C9973E;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--charcoal); min-height: 100vh; }

  /* ── NAV ── */
  .nav {
    background: var(--charcoal);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; position: sticky; top: 0; z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nav-brand { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--blush); letter-spacing: 0.04em; }
  .nav-brand span { color: var(--rose); font-style: italic; }
  .nav-tabs { display: flex; gap: 0.25rem; }
  .nav-tab {
    padding: 0.5rem 1.25rem; border-radius: 6px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.2s;
    background: transparent; color: var(--muted);
  }
  .nav-tab:hover { color: var(--blush); }
  .nav-tab.active { background: var(--rose); color: var(--white); }

  /* ── HERO ── */
  .hero {
    background: linear-gradient(135deg, var(--charcoal) 0%, #4A2218 60%, var(--deep) 100%);
    padding: 4rem 2rem; text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C97B5E' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .hero-tag { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--blush); margin-bottom: 0.75rem; opacity: 0.8; }
  .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); color: var(--white); line-height: 1.1; }
  .hero h1 em { color: var(--blush); font-style: italic; }
  .hero p { color: var(--muted); margin-top: 1rem; font-weight: 300; max-width: 480px; margin-inline: auto; }

  /* ── LAYOUT ── */
  .page { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  @media (max-width: 820px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .grid-3 { grid-template-columns: 1fr; } }

  /* ── CARD ── */
  .card {
    background: var(--white); border-radius: 16px;
    border: 1px solid var(--border); padding: 1.75rem;
    box-shadow: 0 2px 12px var(--shadow);
  }
  .card-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--deep); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
  .card-title .icon { font-size: 1rem; }

  /* ── FORM ── */
  .field { margin-bottom: 1.1rem; }
  .field label { display: block; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.4rem; }
  .field input, .field select, .field textarea {
    width: 100%; padding: 0.65rem 0.9rem; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--cream);
    font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: var(--charcoal);
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: var(--rose); box-shadow: 0 0 0 3px rgba(201,123,94,0.12);
  }
  .field textarea { resize: vertical; min-height: 80px; }

  /* ── BUTTON ── */
  .btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.4rem; border-radius: 8px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
    transition: all 0.2s; letter-spacing: 0.02em;
  }
  .btn-primary { background: var(--rose); color: var(--white); }
  .btn-primary:hover { background: var(--deep); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201,123,94,0.35); }
  .btn-secondary { background: var(--warm); color: var(--deep); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--blush); }
  .btn-danger { background: var(--danger); color: var(--white); }
  .btn-danger:hover { opacity: 0.85; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--warm); color: var(--deep); }
  .btn-sm { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
  .btn-full { width: 100%; justify-content: center; }

  /* ── BADGE ── */
  .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.04em; }
  .badge-open { background: #E8F5ED; color: var(--success); }
  .badge-full { background: #FDEDED; color: var(--danger); }
  .badge-past { background: var(--warm); color: var(--muted); }
  .badge-confirmed { background: #EDF4FF; color: #2563EB; }
  .badge-cancelled { background: #FDEDED; color: var(--danger); }

  /* ── SLOT CARD ── */
  .slot-card {
    background: var(--white); border-radius: 12px; padding: 1.25rem;
    border: 1.5px solid var(--border); transition: all 0.2s; position: relative; overflow: hidden;
  }
  .slot-card:hover { border-color: var(--rose); box-shadow: 0 4px 16px var(--shadow); }
  .slot-card.booked { border-color: var(--blush); }
  .slot-card-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--rose); }
  .slot-card.booked .slot-card-accent { background: var(--gold); }
  .slot-service { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--deep); margin-bottom: 0.3rem; }
  .slot-meta { font-size: 0.8rem; color: var(--muted); display: flex; flex-direction: column; gap: 0.2rem; }
  .slot-meta span { display: flex; align-items: center; gap: 0.3rem; }
  .slot-price { font-size: 1.1rem; font-weight: 600; color: var(--rose); margin-top: 0.75rem; }
  .slot-actions { margin-top: 0.9rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }

  /* ── BOOKING CARD ── */
  .booking-card {
    background: var(--white); border-radius: 12px; padding: 1.25rem;
    border: 1px solid var(--border); display: flex; gap: 1rem; align-items: flex-start;
    transition: box-shadow 0.2s;
  }
  .booking-card:hover { box-shadow: 0 4px 16px var(--shadow); }
  .booking-icon { font-size: 1.6rem; }
  .booking-info { flex: 1; }
  .booking-service { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--deep); }
  .booking-meta { font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem; }
  .booking-client { font-weight: 500; color: var(--charcoal); font-size: 0.88rem; margin-top: 0.3rem; }

  /* ── SECTION HEADER ── */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--deep); }
  .section-sub { font-size: 0.85rem; color: var(--muted); margin-top: 0.2rem; }

  /* ── STATS ── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
  @media (max-width: 700px) { .stats-row { grid-template-columns: 1fr 1fr; } }
  .stat-box { background: var(--white); border-radius: 12px; padding: 1.25rem; border: 1px solid var(--border); text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--rose); }
  .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-top: 0.2rem; }

  /* ── MODAL OVERLAY ── */
  .overlay { position: fixed; inset: 0; background: rgba(44,36,32,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--white); border-radius: 20px; padding: 2rem; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.2s ease; box-shadow: 0 20px 60px rgba(44,36,32,0.3); }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--deep); margin-bottom: 1.5rem; }
  .modal-footer { display: flex; gap: 0.75rem; margin-top: 1.5rem; justify-content: flex-end; }

  /* ── TOAST ── */
  .toast { position: fixed; bottom: 2rem; right: 2rem; z-index: 500; background: var(--charcoal); color: var(--white); padding: 0.9rem 1.4rem; border-radius: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 0.6rem; box-shadow: 0 8px 24px rgba(0,0,0,0.25); animation: slideUp 0.25s ease; max-width: 340px; }
  .toast.success { border-left: 4px solid var(--success); }
  .toast.error { border-left: 4px solid var(--danger); }
  .toast.info { border-left: 4px solid var(--rose); }

  /* ── EMPTY STATE ── */
  .empty { text-align: center; padding: 3rem 1rem; color: var(--muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
  .empty p { font-size: 0.9rem; }

  /* ── DIVIDER ── */
  .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }

  /* ── FILTER BAR ── */
  .filter-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .filter-chip { padding: 0.35rem 0.9rem; border-radius: 20px; border: 1.5px solid var(--border); background: var(--white); color: var(--muted); font-size: 0.8rem; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .filter-chip:hover { border-color: var(--rose); color: var(--rose); }
  .filter-chip.active { background: var(--rose); color: var(--white); border-color: var(--rose); }

  /* ── EMAIL PREVIEW ── */
  .email-preview { background: var(--warm); border-radius: 10px; padding: 1.1rem; font-size: 0.82rem; color: var(--charcoal); border-left: 3px solid var(--rose); font-family: monospace; line-height: 1.6; white-space: pre-wrap; }

  /* ── FULL CALENDAR ── */
  .full-cal-wrap { background: var(--white); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 2px 12px var(--shadow); overflow: hidden; margin-bottom: 2rem; }
  .full-cal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, var(--charcoal) 0%, #4A2218 100%); }
  .full-cal-month { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--blush); letter-spacing: 0.02em; }
  .full-cal-legend { display: flex; align-items: center; gap: 1rem; padding: 0.7rem 1.5rem; background: var(--warm); border-bottom: 1px solid var(--border); font-size: 0.75rem; color: var(--muted); }
  .full-cal-legend span { display: flex; align-items: center; gap: 0.3rem; }
  .full-cal-legend .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rose); display: inline-block; }
  .full-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
  .full-cal-label { text-align: center; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); padding: 0.6rem 0; font-weight: 600; border-bottom: 1px solid var(--border); background: var(--cream); }
  .full-cal-day {
    min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    transition: all 0.15s; position: relative; padding: 0.4rem 0.2rem; gap: 2px;
  }
  .full-cal-day:nth-child(7n) { border-right: none; }
  .full-cal-day:hover:not(.fcd-empty):not(.fcd-disabled) { background: var(--warm); }
  .full-cal-day.fcd-today .fcd-num { background: var(--charcoal); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
  .full-cal-day.fcd-selected { background: rgba(201,123,94,0.08); }
  .full-cal-day.fcd-selected .fcd-num { background: var(--rose); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
  .full-cal-day.fcd-disabled { opacity: 0.28; cursor: default; pointer-events: none; }
  .full-cal-day.fcd-empty { cursor: default; pointer-events: none; background: var(--cream); opacity: 0.5; }
  .fcd-num { font-size: 0.88rem; line-height: 1; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
  .fcd-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--rose); }
  .fcd-slots-count { font-size: 0.6rem; color: var(--rose); font-weight: 600; letter-spacing: 0.02em; }
  @media (max-width: 600px) {
    .full-cal-day { min-height: 42px; }
    .fcd-slots-count { display: none; }
    .full-cal-month { font-size: 1rem; }
  }
  @media (max-width: 380px) {
    .full-cal-day { min-height: 36px; }
    .fcd-num { font-size: 0.78rem; width: 24px; height: 24px; }
    .full-cal-label { font-size: 0.62rem; padding: 0.4rem 0; }
  }

  /* ── MINI CALENDAR (kept for modals) ── */
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.4rem; }
  .cal-day-label { text-align: center; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding-bottom: 0.4rem; font-weight: 500; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 0.85rem; cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; position: relative; }
  .cal-day:hover { border-color: var(--rose); background: var(--warm); }
  .cal-day.today { font-weight: 600; color: var(--rose); }
  .cal-day.has-slots::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--rose); }
  .cal-day.selected { background: var(--rose); color: white; border-color: var(--rose); }
  .cal-day.disabled { opacity: 0.3; cursor: default; pointer-events: none; }
  .cal-day.empty { cursor: default; pointer-events: none; }

  /* ── TABS within page ── */
  .inner-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.75rem; }
  .inner-tab { padding: 0.65rem 1.25rem; font-size: 0.85rem; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; background: none; border-top: none; border-left: none; border-right: none; font-family: 'DM Sans', sans-serif; }
  .inner-tab:hover { color: var(--rose); }
  .inner-tab.active { color: var(--rose); border-bottom-color: var(--rose); }

  .checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.88rem; }
  .checkbox-label input { accent-color: var(--rose); width: 16px; height: 16px; }

  .time-slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
  @media (max-width: 480px) { .time-slots-grid { grid-template-columns: repeat(3, 1fr); } }
  .time-chip { padding: 0.5rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--cream); text-align: center; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
  .time-chip:hover { border-color: var(--rose); background: var(--warm); }
  .time-chip.selected { background: var(--rose); color: white; border-color: var(--rose); }
  .time-chip.booked { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
`;

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const icons = { success: "✓", error: "✕", info: "✦" };
  return <div className={`toast ${type}`}><span>{icons[type]}</span><span>{message}</span></div>;
}

// ─── Modal Component ──────────────────────────────────────────────────────────
function Modal({ title, children, onClose, footer }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Full-Width Calendar ───────────────────────────────────────────────────────
function FullCalendar({ selectedDate, onSelect, slotsByDate = {} }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const today = todayStr();

  const prevMonth = () => setViewMonth(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const nextMonth = () => setViewMonth(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true, key: `e${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr, isToday: dateStr === today, isPast: dateStr < today, isSelected: dateStr === selectedDate, count: slotsByDate[dateStr] || 0 });
  }

  return (
    <div className="full-cal-wrap">
      <div className="full-cal-header">
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--blush)", borderColor: "rgba(232,197,176,0.25)" }} onClick={prevMonth}>←</button>
        <span className="full-cal-month">{monthName}</span>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--blush)", borderColor: "rgba(232,197,176,0.25)" }} onClick={nextMonth}>→</button>
      </div>
      <div className="full-cal-legend">
        <span><span className="dot" /> Available slots</span>
        <span style={{ marginLeft: "auto", color: selectedDate ? "var(--rose)" : "var(--muted)", fontWeight: selectedDate ? 600 : 400 }}>
          {selectedDate ? `Showing: ${new Date(selectedDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}` : "Tap a date to filter"}
        </span>
        {selectedDate && (
          <button onClick={() => onSelect(null)} style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline", padding: 0 }}>Clear</button>
        )}
      </div>
      <div className="full-cal-grid">
        {DAY_LABELS.map(d => <div key={d} className="full-cal-label">{d}</div>)}
        {cells.map(cell => {
          if (cell.empty) return <div key={cell.key} className="full-cal-day fcd-empty" />;
          const cls = ["full-cal-day", cell.isPast ? "fcd-disabled" : "", cell.isToday ? "fcd-today" : "", cell.isSelected ? "fcd-selected" : ""].filter(Boolean).join(" ");
          return (
            <div key={cell.dateStr} className={cls} onClick={() => !cell.isPast && onSelect(cell.isSelected ? null : cell.dateStr)}>
              <div className="fcd-num">{cell.day}</div>
              {cell.count > 0 && !cell.isPast && <>
                <div className="fcd-dot" />
                <div className="fcd-slots-count">{cell.count} open</div>
              </>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect, markedDates = [] }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const today = todayStr();

  const prevMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", color: "var(--deep)" }}>{monthName}</span>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
      </div>
      <div className="cal-grid">
        {days.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="cal-day empty" />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === today;
          const isPast = dateStr < today;
          const isSelected = dateStr === selectedDate;
          const hasSlots = markedDates.includes(dateStr);
          return (
            <div
              key={day}
              className={`cal-day${isToday ? " today" : ""}${isPast ? " disabled" : ""}${isSelected ? " selected" : ""}${hasSlots ? " has-slots" : ""}`}
              onClick={() => !isPast && onSelect(dateStr)}
            >{day}</div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPortal({ slots, bookings, onAddSlot, onDeleteSlot, onCancelBooking, showToast }) {
  const [activeTab, setActiveTab] = useState("slots");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Stats
  const totalSlots = slots.length;
  const bookedCount = bookings.filter(b => b.status === "confirmed").length;
  const revenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => {
    const svc = SERVICES.find(sv => sv.id === b.serviceId);
    return s + (svc?.price || 0);
  }, 0);
  const upcoming = bookings.filter(b => b.status === "confirmed" && b.date >= todayStr()).length;

  const filteredSlots = slots.filter(s => {
    if (filterStatus === "open") return !bookings.find(b => b.slotId === s.id && b.status === "confirmed");
    if (filterStatus === "booked") return bookings.find(b => b.slotId === s.id && b.status === "confirmed");
    if (filterStatus === "past") return s.date < todayStr();
    return true;
  });

  const getSlotBooking = (slotId) => bookings.find(b => b.slotId === slotId && b.status === "confirmed");

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box"><div className="stat-num">{totalSlots}</div><div className="stat-label">Total Slots</div></div>
        <div className="stat-box"><div className="stat-num">{bookedCount}</div><div className="stat-label">Confirmed</div></div>
        <div className="stat-box"><div className="stat-num">{upcoming}</div><div className="stat-label">Upcoming</div></div>
        <div className="stat-box"><div className="stat-num" style={{ fontSize: "1.5rem" }}>R{revenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div>
      </div>

      {/* Inner Tabs */}
      <div className="inner-tabs">
        <button className={`inner-tab${activeTab === "slots" ? " active" : ""}`} onClick={() => setActiveTab("slots")}>Manage Slots</button>
        <button className={`inner-tab${activeTab === "bookings" ? " active" : ""}`} onClick={() => setActiveTab("bookings")}>All Bookings</button>
      </div>

      {activeTab === "slots" && (
        <>
          <div className="section-header">
            <div>
              <div className="section-title">Appointment Slots</div>
              <div className="section-sub">{totalSlots} slots created</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Create Slot</button>
          </div>
          <div className="filter-bar">
            {["all", "open", "booked", "past"].map(f => (
              <button key={f} className={`filter-chip${filterStatus === f ? " active" : ""}`} onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {filteredSlots.length === 0 ? (
            <div className="empty"><div className="empty-icon">📅</div><p>No slots found. Create your first slot!</p></div>
          ) : (
            <div className="grid-3">
              {filteredSlots.sort((a, b) => a.date > b.date ? 1 : -1).map(slot => {
                const svc = SERVICES.find(s => s.id === slot.serviceId);
                const booking = getSlotBooking(slot.id);
                const isPast = slot.date < todayStr();
                return (
                  <div key={slot.id} className={`slot-card${booking ? " booked" : ""}`}>
                    <div className="slot-card-accent" />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="slot-service">{svc?.name}</div>
                      <span className={`badge${isPast ? " badge-past" : booking ? " badge-full" : " badge-open"}`}>
                        {isPast ? "Past" : booking ? "Booked" : "Open"}
                      </span>
                    </div>
                    <div className="slot-meta">
                      <span>📅 {formatDate(slot.date)}</span>
                      <span>🕐 {formatTime(slot.time)} · {svc?.duration} min</span>
                      <span>💇 {slot.stylist}</span>
                      {booking && <span>👤 {booking.clientName}</span>}
                    </div>
                    <div className="slot-price">R{svc?.price}</div>
                    <div className="slot-actions">
                      {booking && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSlot({ slot, booking, svc })}>View</button>
                      )}
                      {!isPast && !booking && (
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          onDeleteSlot(slot.id);
                          showToast("Slot deleted", "info");
                        }}>Delete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "bookings" && (
        <>
          <div className="section-header">
            <div>
              <div className="section-title">All Bookings</div>
              <div className="section-sub">{bookings.length} total</div>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No bookings yet.</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[...bookings].sort((a, b) => a.date > b.date ? 1 : -1).map(booking => {
                const svc = SERVICES.find(s => s.id === booking.serviceId);
                const slot = slots.find(s => s.id === booking.slotId);
                return (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-icon">💅</div>
                    <div className="booking-info">
                      <div className="booking-service">{svc?.name}</div>
                      <div className="booking-meta">
                        {formatDate(booking.date)} at {slot ? formatTime(slot.time) : "—"} · {slot?.stylist}
                      </div>
                      <div className="booking-client">{booking.clientName} · {booking.clientEmail}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                      <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--rose)" }}>R{svc?.price}</span>
                      {booking.status === "confirmed" && (
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          onCancelBooking(booking.id);
                          showToast("Booking cancelled", "info");
                        }}>Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddSlotModal
          onClose={() => setShowAddModal(false)}
          onAdd={(slot) => { onAddSlot(slot); setShowAddModal(false); showToast("Slot created!", "success"); }}
        />
      )}

      {selectedSlot && (
        <BookingDetailModal
          {...selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onCancel={() => {
            onCancelBooking(selectedSlot.booking.id);
            setSelectedSlot(null);
            showToast("Booking cancelled", "info");
          }}
        />
      )}
    </div>
  );
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────
function AddSlotModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ serviceId: SERVICES[0].id, date: todayStr(), time: "09:00", stylist: STYLISTS[0], notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const svc = SERVICES.find(s => s.id === form.serviceId);

  const submit = () => {
    if (!form.date || !form.time) return;
    onAdd({ id: `slot_${Date.now()}`, ...form, createdAt: new Date().toISOString() });
  };

  return (
    <Modal title="✦ Create New Slot" onClose={onClose} footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Create Slot</button>
      </>
    }>
      <div className="field">
        <label>Service</label>
        <select value={form.serviceId} onChange={e => set("serviceId", e.target.value)}>
          {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} — R{s.price} ({s.duration} min)</option>)}
        </select>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} min={todayStr()} onChange={e => set("date", e.target.value)} />
        </div>
        <div className="field">
          <label>Time</label>
          <input type="time" value={form.time} onChange={e => set("time", e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Stylist</label>
        <select value={form.stylist} onChange={e => set("stylist", e.target.value)}>
          {STYLISTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Internal Notes (optional)</label>
        <textarea placeholder="Any prep notes for this slot..." value={form.notes} onChange={e => set("notes", e.target.value)} />
      </div>
      {svc && (
        <div style={{ background: "var(--warm)", borderRadius: 10, padding: "0.9rem", fontSize: "0.85rem", color: "var(--deep)" }}>
          <strong>{svc.name}</strong> · {svc.duration} minutes · <strong>R{svc.price}</strong><br />
          {form.date && form.time && <span>{formatDate(form.date)} at {formatTime(form.time)} with {form.stylist}</span>}
        </div>
      )}
    </Modal>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────
function BookingDetailModal({ slot, booking, svc, onClose, onCancel }) {
  return (
    <Modal title="Booking Details" onClose={onClose} footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        {booking.status === "confirmed" && (
          <button className="btn btn-danger" onClick={onCancel}>Cancel Booking</button>
        )}
      </>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
        <div><strong>Service:</strong> {svc?.name}</div>
        <div><strong>Date:</strong> {formatDate(slot.date)}</div>
        <div><strong>Time:</strong> {formatTime(slot.time)}</div>
        <div><strong>Stylist:</strong> {slot.stylist}</div>
        <div><strong>Price:</strong> R{svc?.price}</div>
        <div className="divider" />
        <div><strong>Client:</strong> {booking.clientName}</div>
        <div><strong>Email:</strong> {booking.clientEmail}</div>
        <div><strong>Phone:</strong> {booking.clientPhone || "—"}</div>
        {booking.notes && <div><strong>Notes:</strong> {booking.notes}</div>}
        <div><strong>Status:</strong> <span className={`badge badge-${booking.status}`}>{booking.status}</span></div>
        <div><strong>Booked at:</strong> {new Date(booking.createdAt).toLocaleString()}</div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function ClientPortal({ slots, bookings, onBook, showToast }) {
  const [step, setStep] = useState("browse"); // browse | book | confirm | mybookings
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterService, setFilterService] = useState("all");
  const [clientInfo, setClientInfo] = useState({ name: "", email: "", phone: "", notes: "" });
  const [myEmail, setMyEmail] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [showEmailLookup, setShowEmailLookup] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const today = todayStr();
  const availableSlots = slots.filter(s => {
    const isBooked = bookings.find(b => b.slotId === s.id && b.status === "confirmed");
    const isPast = s.date < today;
    return !isBooked && !isPast;
  });

  const datesWithSlots = [...new Set(availableSlots.map(s => s.date))];

  const displaySlots = availableSlots
    .filter(s => filterService === "all" || s.serviceId === filterService)
    .filter(s => !selectedDate || s.date === selectedDate)
    .sort((a, b) => a.date > b.date ? 1 : a.date < b.date ? -1 : a.time > b.time ? 1 : -1);

  const handleBook = () => {
    if (!clientInfo.name || !clientInfo.email) {
      showToast("Please fill in your name and email", "error");
      return;
    }
    const slot = selectedSlot;
    const svc = SERVICES.find(s => s.id === slot.serviceId);
    const booking = {
      id: `bk_${Date.now()}`,
      slotId: slot.id,
      serviceId: slot.serviceId,
      date: slot.date,
      stylist: slot.stylist,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      notes: clientInfo.notes,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    onBook(booking);

    // Email simulation
    const emailBody = `
BOOKING CONFIRMATION — MakaThandeka Saloon
══════════════════════════════════════════
Service: ${svc?.name}
Date: ${formatDate(slot.date)}
Time: ${formatTime(slot.time)}
Stylist: ${slot.stylist}
Duration: ${svc?.duration} minutes
Price: R${svc?.price}
══════════════════════════════════════════
Client: ${clientInfo.name}
Email: ${clientInfo.email}
Phone: ${clientInfo.phone || "—"}
Notes: ${clientInfo.notes || "—"}
══════════════════════════════════════════
📍 123 Dorp Street, Stellenbosch, 7600
📞 +27 21 883 0000
`.trim();
    sendEmailSimulation(clientInfo.email, "Booking Confirmation — MakaThandeka Saloon", emailBody);
    sendEmailSimulation("admin@makathandeka.co.za", `New Booking: ${svc?.name} — ${clientInfo.name}`, emailBody);

    setStep("confirm");
    setMyEmail(clientInfo.email);
  };

  const lookupBookings = () => {
    const found = bookings.filter(b => b.clientEmail.toLowerCase() === emailInput.toLowerCase());
    setMyBookings(found);
    setMyEmail(emailInput);
    setShowEmailLookup(false);
    setStep("mybookings");
  };

  return (
    <div>
      {/* Client Hero */}
      <div className="hero" style={{ padding: "1.25rem 2rem" }}>
        <div className="hero-tag">Stellenbosch · Est. 2019</div>
        <h1 style={{ marginBottom: "0.6rem", fontSize: "clamp(1.4rem, 4vw, 2.2rem)" }}>Book Your <em>Appointment</em></h1>
        <p style={{ marginBottom: "1rem", fontSize: "0.88rem" }}>Premium hair & beauty services at MakaThandeka Saloon. Every visit is crafted with love.</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setStep("browse")}>Browse Availability</button>
          <button className="btn btn-ghost" style={{ color: "var(--blush)", borderColor: "rgba(232,197,176,0.3)" }} onClick={() => setShowEmailLookup(true)}>My Bookings</button>
        </div>
      </div>

      <div className="page" style={{ paddingTop: "1.5rem" }}>
        {step === "browse" && (
          <>
            {/* Full-width calendar */}
            <FullCalendar
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              slotsByDate={availableSlots.reduce((acc, s) => { acc[s.date] = (acc[s.date] || 0) + 1; return acc; }, {})}
            />

            {/* Service filter chips — horizontal scroll on mobile */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: 600 }}>Filter by service</div>
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", scrollbarWidth: "none" }}>
                <button
                  className={`filter-chip${filterService === "all" ? " active" : ""}`}
                  onClick={() => setFilterService("all")}
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >All Services</button>
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    className={`filter-chip${filterService === s.id ? " active" : ""}`}
                    onClick={() => setFilterService(prev => prev === s.id ? "all" : s.id)}
                    style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  >{s.name} · R{s.price}</button>
                ))}
              </div>
            </div>

            <div className="section-header">
              <div>
                <div className="section-title">Available Appointments</div>
                <div className="section-sub">
                  {displaySlots.length} slot{displaySlots.length !== 1 ? "s" : ""} available
                  {selectedDate ? ` · ${new Date(selectedDate).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}` : ""}
                  {filterService !== "all" ? ` · ${SERVICES.find(s => s.id === filterService)?.name}` : ""}
                </div>
              </div>
            </div>

            {displaySlots.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🌸</div>
                <p>No available slots{selectedDate ? " on this date" : ""}. Try a different date or service.</p>
              </div>
            ) : (
              <div className="grid-3">
                {displaySlots.map(slot => {
                  const svc = SERVICES.find(s => s.id === slot.serviceId);
                  return (
                    <div key={slot.id} className="slot-card" style={{ cursor: "pointer" }} onClick={() => { setSelectedSlot(slot); setStep("book"); }}>
                      <div className="slot-card-accent" />
                      <div className="slot-service">{svc?.name}</div>
                      <div className="slot-meta">
                        <span>📅 {formatDate(slot.date)}</span>
                        <span>🕐 {formatTime(slot.time)} · {svc?.duration} min</span>
                        <span>💇 {slot.stylist}</span>
                      </div>
                      <div className="slot-price">R{svc?.price}</div>
                      <div className="slot-actions">
                        <button className="btn btn-primary btn-sm">Book Now →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === "book" && selectedSlot && (() => {
          const svc = SERVICES.find(s => s.id === selectedSlot.serviceId);
          return (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Complete Your Booking</div>
                  <div className="section-sub">Fill in your details to confirm</div>
                </div>
                <button className="btn btn-ghost" onClick={() => setStep("browse")}>← Back</button>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-title"><span className="icon">👤</span> Your Details</div>
                  <div className="field"><label>Full Name *</label><input placeholder="Your full name" value={clientInfo.name} onChange={e => setClientInfo(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="field"><label>Email Address *</label><input type="email" placeholder="your@email.com" value={clientInfo.email} onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="field"><label>Phone Number</label><input placeholder="+27 ..." value={clientInfo.phone} onChange={e => setClientInfo(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="field"><label>Special Requests</label><textarea placeholder="Any allergies, preferences, or special notes..." value={clientInfo.notes} onChange={e => setClientInfo(p => ({ ...p, notes: e.target.value }))} /></div>
                </div>
                <div>
                  <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-title"><span className="icon">✦</span> Booking Summary</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Service</span>
                        <strong>{svc?.name}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Date</span>
                        <strong>{formatDate(selectedSlot.date)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Time</span>
                        <strong>{formatTime(selectedSlot.time)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Duration</span>
                        <strong>{svc?.duration} min</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Stylist</span>
                        <strong>{selectedSlot.stylist}</strong>
                      </div>
                      <div className="divider" />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                        <span style={{ color: "var(--muted)" }}>Total</span>
                        <strong style={{ color: "var(--rose)" }}>R{svc?.price}</strong>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-full" style={{ marginTop: "1.25rem" }} onClick={handleBook}>
                      Confirm Booking →
                    </button>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", marginTop: "0.75rem" }}>
                      A confirmation email will be sent to your address
                    </p>
                  </div>
                  <div className="card" style={{ background: "var(--warm)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7 }}>
                      📍 123 Dorp Street, Stellenbosch<br />
                      📞 +27 21 883 0000<br />
                      📧 hello@makathandeka.co.za<br />
                      🕐 Mon–Sat 8:00–19:00
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {step === "confirm" && selectedSlot && (() => {
          const svc = SERVICES.find(s => s.id === selectedSlot.serviceId);
          return (
            <div style={{ maxWidth: 560, margin: "3rem auto", textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🌸</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--deep)", marginBottom: "0.5rem" }}>
                You're all set!
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                Your booking is confirmed. Check your inbox for a confirmation email.
              </p>
              <div className="card" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
                  <div><strong>{svc?.name}</strong> with {selectedSlot.stylist}</div>
                  <div>{formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}</div>
                  <div>Duration: {svc?.duration} min · R{svc?.price}</div>
                </div>
                <div className="divider" />
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  📧 Confirmation sent to <strong>{myEmail}</strong> and our team
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button className="btn btn-primary" onClick={() => { setStep("browse"); setSelectedSlot(null); setClientInfo({ name: "", email: "", phone: "", notes: "" }); }}>
                  Book Another
                </button>
                <button className="btn btn-secondary" onClick={() => { setEmailInput(myEmail); lookupBookings(); }}>
                  My Bookings
                </button>
              </div>
            </div>
          );
        })()}

        {step === "mybookings" && (
          <>
            <div className="section-header">
              <div>
                <div className="section-title">My Bookings</div>
                <div className="section-sub">{myEmail}</div>
              </div>
              <button className="btn btn-ghost" onClick={() => setStep("browse")}>← Browse</button>
            </div>
            {myBookings.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔍</div><p>No bookings found for {myEmail}.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {myBookings.map(b => {
                  const svc = SERVICES.find(s => s.id === b.serviceId);
                  const slot = slots.find(s => s.id === b.slotId);
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-icon">💅</div>
                      <div className="booking-info">
                        <div className="booking-service">{svc?.name}</div>
                        <div className="booking-meta">
                          {formatDate(b.date)} at {slot ? formatTime(slot.time) : "—"} · {b.stylist}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--rose)", marginTop: "0.3rem" }}>R{svc?.price}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showEmailLookup && (
        <Modal title="My Bookings" onClose={() => setShowEmailLookup(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowEmailLookup(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={lookupBookings}>Look up</button>
          </>
        }>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>Enter the email address you used to book.</p>
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupBookings()} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("client");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Load from storage
  useEffect(() => {
    (async () => {
      const s = await loadData(STORAGE_KEYS.slots);
      const b = await loadData(STORAGE_KEYS.bookings);
      if (s) setSlots(s);
      if (b) setBookings(b);
      setLoaded(true);
    })();
  }, []);

  // Save on change
  useEffect(() => { if (loaded) saveData(STORAGE_KEYS.slots, slots); }, [slots, loaded]);
  useEffect(() => { if (loaded) saveData(STORAGE_KEYS.bookings, bookings); }, [bookings, loaded]);

  const addSlot = (slot) => setSlots(s => [...s, slot]);
  const deleteSlot = (id) => setSlots(s => s.filter(x => x.id !== id));
  const addBooking = (b) => setBookings(bs => [...bs, b]);
  const cancelBooking = (id) => setBookings(bs => bs.map(b => b.id === id ? { ...b, status: "cancelled" } : b));

  const handleAdminAccess = () => {
    if (adminPass === "admin123" || adminPass === "") { setAdminAuth(true); setView("admin"); }
    else showToast("Incorrect password", "error");
  };

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Playfair Display', serif", color: "var(--rose)", fontSize: "1.2rem" }}>
      Loading MakaThandeka…
    </div>
  );

  return (
    <div>
      <style>{css}</style>

      <nav className="nav">
        <div className="nav-brand">MakaThandeka <span>Saloon</span></div>
        <div className="nav-tabs">
          <button className={`nav-tab${view === "client" ? " active" : ""}`} onClick={() => setView("client")}>Client Portal</button>
          <button className={`nav-tab${view === "admin" ? " active" : ""}`} onClick={() => {
            if (!adminAuth) setView("adminlogin");
            else setView("admin");
          }}>Admin</button>
        </div>
      </nav>

      {view === "client" && (
        <ClientPortal slots={slots} bookings={bookings} onBook={addBooking} showToast={showToast} />
      )}

      {view === "adminlogin" && (
        <div style={{ maxWidth: 380, margin: "6rem auto", padding: "0 1rem" }}>
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔑</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "var(--deep)" }}>Admin Access</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.25rem" }}>Password: <code>admin123</code></div>
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Enter admin password" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminAccess()} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setView("client")}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdminAccess}>Enter Admin</button>
            </div>
          </div>
        </div>
      )}

      {view === "admin" && adminAuth && (
        <>
          <div style={{ background: "var(--warm)", borderBottom: "1px solid var(--border)", padding: "0.6rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              🔒 Admin Portal · <strong>admin@makathandeka.co.za</strong>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setAdminAuth(false); setAdminPass(""); setView("client"); }}>Log Out</button>
          </div>
          <AdminPortal slots={slots} bookings={bookings} onAddSlot={addSlot} onDeleteSlot={deleteSlot} onCancelBooking={cancelBooking} showToast={showToast} />
        </>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
