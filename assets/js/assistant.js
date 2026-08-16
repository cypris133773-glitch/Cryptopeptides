// The support assistant.
//
// A rule-based responder, not a language model: there is no backend to call,
// and a static site that invents answers about shipping or payment is worse
// than one that says "ask us". Every answer is composed from the same data the
// pages use — SHIPPING, DISCOUNT_PCT, CRYPTO, the catalogue, the lot registry —
// so the bot cannot drift from what the site says, and adding a country or
// changing the discount updates the bot at the same time.
//
// It answers on ordering, prices, shipping, payment, lab reports, storage and
// order status. It does not answer on dosing or administration: everything
// here is sold for laboratory research, and an assistant handing out protocols
// would contradict that on every other page — and be medical advice about
// unapproved substances besides. That request gets a straight answer about why
// not, and a route to a human.
import { SITE, SHIPPING, CRYPTO, PRODUCTS, DISCOUNT_PCT, money } from './catalog.js';
import { BATCHES, publishedCount, LAB_GENERIC, METHODS } from './lab.js';
import { safeStorage, readJSON, writeJSON } from './storage.js';

const LOG_KEY = 'cp_chat_v1';
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const mailto = (subject) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
const link = (href, text) => `<a href="${href}">${esc(text)}</a>`;

/* ── Answers ─────────────────────────────────────────────────────────────
   Each intent scores the incoming text on its keywords; the best score wins.
   `answer` returns HTML, composed from live data rather than written prose. */

const INTENTS = [
  {
    id: 'dosage',
    // Deliberately greedy: this must win over 'products' when someone asks
    // "how much retatrutide should I take".
    weight: 3,
    keywords: ['dose', 'dosage', 'dosing', 'mcg', 'iu per', 'how much should', 'how many mg', 'protocol', 'cycle',
      'inject', 'injection', 'take it', 'use it', 'per week', 'per day', 'titrate', 'stack for', 'dosierung', 'einnahme'],
    answer: () => `I can't help with dosing, protocols or how to administer anything — and that isn't me
      being cagey. Everything here is sold for laboratory research only, none of it is approved for human
      or veterinary use, and dosing guidance would be medical advice about unapproved substances.
      <br /><br />What I can answer: purity and lot records, reconstitution and storage, solubility,
      shipping, payment and order status. For anything clinical, talk to a qualified professional.`,
  },
  {
    id: 'prices',
    keywords: ['price', 'cost', 'discount', 'cheap', 'expensive', 'deal', 'offer', 'coupon', 'code', 'sale', 'preis', 'rabatt'],
    answer: () => {
      const cheapest = [...PRODUCTS].sort((a, b) => a.minPrice - b.minPrice)[0];
      return `Every product sits <b>${DISCOUNT_PCT}% below its list price</b>, permanently — the list price is
        struck through next to what you pay, and there is no code to enter.
        <br /><br />Prices run from ${money(cheapest.minPrice)} up. ${link('shop.html', 'Browse the catalogue')},
        or type a compound name and I'll price it.`;
    },
  },
  {
    id: 'shipping',
    keywords: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'tracking', 'courier', 'post', 'customs',
      'how long', 'when will', 'discreet', 'lost', 'seized', 'versand', 'lieferung'],
    answer: () => {
      const rows = SHIPPING.zones
        .map((z) => `<li>${esc(z.label)} — ${z.rate ? money(z.rate) : 'free'}${z.freeOver ? `, free over ${money(z.freeOver)}` : ''} · ${esc(z.transit)}</li>`)
        .join('');
      return `<ul class="chat-list">${rows}</ul>
        Orders confirmed before 2pm on a working day are aimed at same-day dispatch. Packaging is plain, with
        no product names on the outside, and vials travel in an insulated mailer with a gel pack.
        <br /><br />If tracking hasn't moved in ten business days we reship once at our cost or refund you.
        Full detail: ${link('shipping.html', 'shipping & delivery')}.`;
    },
  },
  {
    id: 'payment',
    keywords: ['pay', 'payment', 'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'card', 'paypal',
      'wallet', 'address', 'refund', 'network', 'zahlung', 'bezahlen'],
    answer: () => {
      const coins = CRYPTO.map((c) => `<li><b>${esc(c.name)} (${esc(c.symbol)})</b> — ${esc(c.network)}, confirms in ${esc(c.confirmations)}</li>`).join('');
      return `Crypto only — no cards, no PayPal, no bank transfer, so no card data exists to be leaked.
        <ul class="chat-list">${coins}</ul>
        Checkout names the network before it shows the address, quotes the amount from your USD total, and
        after you send it you email us the order number and transaction ID so we can match the payment.
        Shortfalls under ${Math.round(SITE.shortfallTolerance * 100)}% are absorbed.
        <br /><br />Step by step: ${link('how-to-pay.html', 'how to pay with crypto')}.`;
    },
  },
  {
    id: 'lab',
    keywords: ['lab', 'test', 'tested', 'purity', 'coa', 'certificate', 'analysis', 'hplc', 'batch', 'lot',
      'verify', 'third party', 'labor', 'reinheit'],
    answer: () => {
      const n = publishedCount();
      return `Every lot is numbered, labelled and recorded — <b>${BATCHES.length} lots</b> are in the registry
        right now, and ${n ? `<b>${n}</b> carry a published certificate` : `<b>none</b> carries a published certificate yet`}.
        <br /><br />Samples go to ${esc(LAB_GENERIC)} for ${esc(METHODS.join(', '))}. Where a lot has no
        certificate, its page says so rather than showing a figure we can't back.
        <br /><br />Search the number printed on your vial: ${link('lab-tests.html', 'lot registry')}.`;
    },
  },
  {
    id: 'storage',
    keywords: ['store', 'storage', 'fridge', 'freezer', 'reconstitut', 'dissolve', 'bacteriostatic', 'solubility',
      'shelf life', 'expire', 'warm', 'cold', 'lager', 'aufbewahr'],
    answer: () => `Lyophilised and unopened: −20 °C, protected from light. Once reconstituted: 2–8 °C, and
      aliquot before freezing rather than putting a vial through repeated freeze–thaw cycles.
      <br /><br />Lyophilised material is stable at ambient temperature for the length of a normal shipment,
      so a thawed gel pack on arrival is not a problem. Add diluent slowly down the vial wall and swirl rather
      than shake. ${link('faq.html', 'More in the FAQ')}.`,
  },
  {
    id: 'order',
    keywords: ['order status', 'my order', 'where is my', 'track my', 'order number', 'confirmation', 'bestellung'],
    answer: () => `Order records live in the browser you ordered from — look yours up at
      ${link('track.html', 'order lookup')}.
      <br /><br />If you've cleared site data or ordered from another device, email
      ${link(mailto('Order lookup'), SITE.email)} with the order number or the transaction ID you paid from,
      and we'll pull it up.`,
  },
  {
    id: 'legal',
    keywords: ['legal', 'research use', 'human', 'consumption', 'safe', 'fda', 'approved', 'prescription', 'rezept'],
    answer: () => `Everything here is supplied for laboratory research only. It is not a medicine, it is not
      approved by any regulatory authority, and it is not for human or veterinary consumption. We don't sell to
      anyone who tells us the material is for personal use.
      <br /><br />Import rules vary by country and you're the importer of record.
      ${link('terms.html', 'Terms of sale')}.`,
  },
  {
    id: 'human',
    keywords: ['human', 'person', 'agent', 'speak to', 'talk to someone', 'email', 'contact', 'support', 'kontakt'],
    answer: () => `I'm an automated assistant, so for anything I've missed a person will do better:
      ${link(mailto('Question from the site'), SITE.email)} — usually answered the same working day.
      ${link('contact.html', 'Contact page')}.`,
  },
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'hallo', 'servus', 'moin'],
    answer: () => `Hello. Ask me about prices, shipping, payment, lab reports, storage or an order — or type a
      compound name and I'll look it up.`,
  },
];

/** Product lookup: any message naming a catalogue item gets priced. */
function findProduct(text) {
  const q = text.toLowerCase().replace(/[^a-z0-9+\- ]/g, ' ');
  let best = null;
  for (const p of PRODUCTS) {
    const names = [p.name.toLowerCase(), p.slug.replace(/-/g, ' '), (p.aka || '').toLowerCase()].filter(Boolean);
    for (const n of names) {
      const key = n.replace(/[^a-z0-9+ ]/g, ' ').trim();
      if (key.length > 2 && q.includes(key) && (!best || key.length > best.len)) best = { p, len: key.length };
    }
  }
  return best?.p || null;
}

function productAnswer(p) {
  const sizes = p.variants.map((v) => `${esc(v.size)} — ${money(v.price)} <s>${money(v.msrp)}</s>`).join('<br />');
  const lots = BATCHES.filter((b) => b.slug === p.slug);
  return `<b>${esc(p.name)}</b> — ${esc(p.summary)}
    <br /><br />${sizes}
    <br /><br />${p.purity ? `Target purity ${esc(p.purity)}. ` : ''}${lots.length ? `${lots.length} lot${lots.length === 1 ? '' : 's'} on file.` : ''}
    <br />${link(`product.html?p=${encodeURIComponent(p.slug)}`, 'Open the product page')}`;
}

function reply(text) {
  const q = ' ' + text.toLowerCase() + ' ';
  let best = { score: 0, intent: null };
  for (const intent of INTENTS) {
    let score = 0;
    for (const k of intent.keywords) if (q.includes(k)) score += (intent.weight || 1) * (k.length > 5 ? 2 : 1);
    if (score > best.score) best = { score, intent };
  }

  // A named product wins unless the question was about dosing.
  const product = findProduct(text);
  if (product && best.intent?.id !== 'dosage') return productAnswer(product);
  if (best.intent) return best.intent.answer();

  return `I didn't catch that one. I can help with <b>prices</b>, <b>shipping</b>, <b>payment</b>,
    <b>lab reports</b>, <b>storage</b> and <b>order status</b>, or price any compound if you name it.
    <br /><br />For anything else: ${link(mailto('Question from the site'), SITE.email)}.`;
}

/* ── Widget ──────────────────────────────────────────────────────────── */

const CHIPS = ['Shipping', 'Payment', 'Prices', 'Lab reports', 'Storage', 'Order status'];

export function initAssistant() {
  const launcher = document.createElement('button');
  launcher.className = 'chat-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'chat-panel');
  launcher.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z"/></svg>
    <span>Questions?</span>`;

  const panel = document.createElement('section');
  panel.className = 'chat-panel';
  panel.id = 'chat-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Support assistant');
  panel.innerHTML = `
    <header class="chat-head">
      <span>
        <b>Support assistant</b>
        <span class="tiny muted">Automated · answers from this site's data</span>
      </span>
      <button class="icon-btn" id="chat-close" aria-label="Close assistant">✕</button>
    </header>
    <div class="chat-log" id="chat-log" role="log" aria-live="polite"></div>
    <div class="chat-chips" id="chat-chips">
      ${CHIPS.map((c) => `<button type="button" class="chat-chip">${esc(c)}</button>`).join('')}
    </div>
    <form class="chat-form" id="chat-form">
      <label class="visually-hidden" for="chat-input">Your question</label>
      <input class="input" id="chat-input" autocomplete="off" placeholder="Ask about shipping, payment, a compound…" />
      <button class="btn btn-primary btn-sm" type="submit">Send</button>
    </form>`;

  document.body.append(launcher, panel);

  const log = panel.querySelector('#chat-log');
  const history = readJSON(safeStorage, LOG_KEY, []);

  const push = (who, html, save = true) => {
    const row = document.createElement('div');
    row.className = `chat-msg chat-${who}`;
    row.innerHTML = html;
    log.append(row);
    log.scrollTop = log.scrollHeight;
    if (save) {
      history.push({ who, html });
      writeJSON(safeStorage, LOG_KEY, history.slice(-20));
    }
  };

  if (history.length) history.forEach((m) => push(m.who, m.html, false));
  else
    push('bot', `Hello — I'm the automated assistant. Ask about prices, shipping, payment, lab reports,
      storage or an order, or name a compound and I'll price it.<br /><br />I can't advise on dosing or
      administration: everything here is sold for laboratory research only.`);

  const ask = (text) => {
    push('you', esc(text));
    // A beat before answering, so the reply reads as a response rather than
    // appearing in the same frame as the question.
    setTimeout(() => push('bot', reply(text)), 260);
  };

  panel.querySelector('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = panel.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    ask(text);
  });

  panel.querySelector('#chat-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chat-chip');
    if (chip) ask(chip.textContent);
  });

  const open = () => {
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    launcher.setAttribute('aria-expanded', 'true');
    panel.querySelector('#chat-input').focus();
  };
  const close = () => {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    setTimeout(() => (panel.hidden = true), 220);
    launcher.focus();
  };

  launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.querySelector('#chat-close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => e.key === 'Escape' && close());
}
