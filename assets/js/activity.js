// The activity ticker.
//
// This is the "someone just bought X" pattern, built on events that actually
// happened: lots we filled and recorded, certificates we published, and
// products newly listed. Every line is checkable — the lot number in it opens
// its record, and the date is the one in the registry.
//
// It deliberately does NOT claim purchases. Nobody has bought anything through
// this store yet, and a notice naming an invented buyer in an invented city is
// a false statement to every visitor who reads it (and, in the US, UK and EU,
// an actionable one). When real orders exist, feed them in through `events()`
// below with the same shape and the widget needs no other change.
import { BATCHES } from './lab.js';
import { PRODUCTS } from './catalog.js';
import { safeStorage } from './storage.js';

const DISMISS_KEY = 'cp_activity_off';
const ROTATE_MS = 9000;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ago = (iso) => {
  const days = Math.round((Date.now() - Date.parse(iso)) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? 'last month' : `${months} months ago`;
};

/** Real events, newest first. */
function events() {
  const out = [];

  for (const lot of BATCHES.slice(0, 14)) {
    out.push({
      icon: '◆',
      text: `Lot <b>${esc(lot.batch)}</b> of ${esc(lot.product)} filled and recorded`,
      when: ago(lot.dated),
      href: `report.html?b=${encodeURIComponent(lot.batch)}`,
    });
    if (lot.report) {
      out.push({
        icon: '✓',
        text: `Certificate published for <b>${esc(lot.product)}</b> lot ${esc(lot.batch)}`,
        when: lot.report.tested ? ago(lot.report.tested) : 'recently',
        href: `report.html?b=${encodeURIComponent(lot.batch)}`,
      });
    }
  }

  for (const p of PRODUCTS.filter((p) => p.badges.includes('new')).slice(0, 6)) {
    out.push({
      icon: '★',
      text: `<b>${esc(p.name)}</b> added to the catalogue`,
      when: 'this month',
      href: `product.html?p=${encodeURIComponent(p.slug)}`,
    });
  }

  // Interleave so the same event type never runs three deep.
  const lots = out.filter((e) => e.icon === '◆');
  const rest = out.filter((e) => e.icon !== '◆');
  const mixed = [];
  while (lots.length || rest.length) {
    if (lots.length) mixed.push(lots.shift());
    if (rest.length) mixed.push(rest.shift());
  }
  return mixed;
}

export function initActivity() {
  if (safeStorage.get(DISMISS_KEY) === 'yes') return;
  const items = events();
  if (!items.length) return;

  const host = document.createElement('aside');
  host.className = 'activity';
  host.setAttribute('aria-label', 'Recent activity from the lot registry');
  document.body.append(host);

  let i = 0;
  const paint = () => {
    const e = items[i];
    host.innerHTML = `
      <a class="activity-body" href="${e.href}">
        <span class="activity-icon" aria-hidden="true">${e.icon}</span>
        <span>
          <span class="activity-text">${e.text}</span>
          <span class="activity-meta">${esc(e.when)} · from the lot registry</span>
        </span>
      </a>
      <button class="activity-close" type="button" aria-label="Hide activity notices">✕</button>`;
    host.querySelector('.activity-close').addEventListener('click', () => {
      safeStorage.set(DISMISS_KEY, 'yes');
      host.remove();
    });
  };

  paint();
  requestAnimationFrame(() => host.classList.add('is-in'));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let timer = setInterval(next, ROTATE_MS);
  function next() {
    host.classList.remove('is-in');
    setTimeout(() => {
      i = (i + 1) % items.length;
      paint();
      host.classList.add('is-in');
    }, 320);
  }
  // Reading one shouldn't be interrupted by the next.
  host.addEventListener('mouseenter', () => clearInterval(timer));
  host.addEventListener('mouseleave', () => (timer = setInterval(next, ROTATE_MS)));
  host.addEventListener('focusin', () => clearInterval(timer));
}
