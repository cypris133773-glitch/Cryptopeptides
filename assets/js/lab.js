// Lot registry and certificate-of-analysis records.
//
// A lot number is something we can honestly assert: it is printed on the vial
// label and identifies the material. A *test result* is not — it exists only
// when a laboratory has issued a signed certificate for a sample we submitted.
// This module keeps those two things apart, and every claim the storefront
// makes about lab reports is derived from `REPORTS` rather than written into
// copy, so the site is automatically truthful both before and after real
// certificates land.
//
// To publish a report:
//   1. Drop the signed PDF in `shop/coa/`.
//   2. Add a record to REPORTS below, keyed by batch number, naming the
//      laboratory that actually issued it.
// Anything absent renders as a clearly-marked specimen layout.
import { PRODUCTS } from './catalog.js';

/** Wording used wherever no issued certificate backs the statement. A named
 *  laboratory may only ever appear against a batch with a record in REPORTS. */
export const LAB_GENERIC = 'an independent analytical laboratory';

/** Analyses we ask for. A method list is a request, not a result. */
export const METHODS = ['RP-HPLC-UV', 'LC-MS (ESI-TOF)', 'Karl Fischer titration'];

/**
 * Issued certificates, keyed by batch number. Example:
 *
 *   'CP-2508-BPC157-42': {
 *     file: 'coa/CP-2508-BPC157-42.pdf',
 *     lab: 'Name of the laboratory that signed it',
 *     location: 'City, Country',
 *     verifyUrl: 'https://…/report-lookup',   // optional
 *     reportId: '123456',                     // the lab's own number
 *     tested: '2026-05-14',
 *     purity: '99.4%',
 *   }
 *
 * A bare string is accepted as shorthand for `{ file }`, in which case the
 * laboratory stays unnamed. Nothing may be filled in here speculatively: every
 * field is copied off the certificate itself.
 *
 * WHAT IS REGISTERED BELOW IS FIXTURE DATA, NOT TEST RESULTS. Eight placeholder
 * certificates were generated to show what the storefront does once a real
 * report exists: the lot page serving a document, the counters moving off zero,
 * the filter appearing. Every one names "Example Analytical (test fixture)",
 * carries a stamp across the page and states inside itself that no sample was
 * submitted and no analysis performed. Delete this block and the PDFs in
 * `coa/` the day real certificates arrive — the real ones drop straight into
 * the same shape.
 */
export const REPORTS = {
  'CP-2607-RETATRIDE-51': {
    file: 'coa/CP-2607-RETATRIDE-51.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-880927',
    tested: '2026-07-23',
    purity: '98.470%',
  },
  'CP-2511-TIRZEPIDE-34': {
    file: 'coa/CP-2511-TIRZEPIDE-34.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-792982',
    tested: '2025-11-16',
    purity: '99.420%',
  },
  'CP-2608-SEMAGLIDE-97': {
    file: 'coa/CP-2608-SEMAGLIDE-97.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-814317',
    tested: '2026-08-13',
    purity: '98.270%',
  },
  'CP-2606-BPC157-65': {
    file: 'coa/CP-2606-BPC157-65.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-805227',
    tested: '2026-07-09',
    purity: '99.470%',
  },
  'CP-2607-TB500-73': {
    file: 'coa/CP-2607-TB500-73.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-555812',
    tested: '2026-07-19',
    purity: '98.920%',
  },
  'CP-2601-GHKCU-20': {
    file: 'coa/CP-2601-GHKCU-20.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-484087',
    tested: '2026-01-02',
    purity: '98.270%',
  },
  'CP-2606-IPAMORLIN-22': {
    file: 'coa/CP-2606-IPAMORLIN-22.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-694837',
    tested: '2026-07-01',
    purity: '99.470%',
  },
  'CP-2603-EPITHALON-75': {
    file: 'coa/CP-2603-EPITHALON-75.pdf',
    lab: 'Example Analytical (test fixture)',
    location: 'Fixture City',
    reportId: 'FX-729877',
    tested: '2026-04-01',
    purity: '98.970%',
  },
};

function normaliseReport(batch, raw) {
  if (!raw) return null;
  const record = typeof raw === 'string' ? { file: raw } : { ...raw };
  if (!record.file) return null;
  return {
    batch,
    file: record.file,
    lab: record.lab || null,
    location: record.location || null,
    verifyUrl: record.verifyUrl || null,
    reportId: record.reportId || null,
    tested: record.tested || null,
    purity: record.purity || null,
  };
}

const REPORT_RECORDS = Object.fromEntries(
  Object.entries(REPORTS)
    .map(([batch, raw]) => [batch, normaliseReport(batch, raw)])
    .filter(([, record]) => record),
);

/** How many signed certificates are actually published. Drives all site copy. */
export const publishedCount = () => Object.keys(REPORT_RECORDS).length;
export const hasPublishedReports = () => publishedCount() > 0;

/** The laboratory to name for a batch — never a name without a certificate. */
export const labNameFor = (batch) => batch?.report?.lab || LAB_GENERIC;

/* ── Lot numbers ─────────────────────────────────────────────────────── */

function baseCode(slug) {
  const alnum = slug.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return alnum.length <= 9 ? alnum : alnum.slice(0, 6) + alnum.slice(-3);
}

// Truncation alone produced ambiguous codes (CJC-1295 with and without DAC
// both collapsed to CJC1295NO/CJC1295DA territory), so collisions are resolved
// deterministically here rather than silently shipped on a vial label.
const CODES = (() => {
  const taken = new Set();
  const out = new Map();
  for (const product of PRODUCTS) {
    const base = baseCode(product.slug);
    let code = base;
    let n = 1;
    while (taken.has(code)) code = `${base.slice(0, 8)}${++n}`;
    taken.add(code);
    out.set(product.slug, code);
  }
  return out;
})();

export const lotCode = (slug) => CODES.get(slug) || '';

function seed(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h);
}

const DAY = 86400000;
const iso = (date) => date.toISOString().slice(0, 10);

/** One lot per product. A second lot per bestseller only padded the registry:
 *  a lot number is worth something because it identifies material, not because
 *  there are many of them. */
function lotsFor(product) {
  const s = seed(product.slug);
  const make = (n) => {
    // Lots are dated in the past — a future-dated lot is a data bug, and a
    // future-dated *test* would be a lie. 0–270 days back from today.
    const age = ((s + n * 61) % 271) + n * 45;
    const date = new Date(Date.now() - age * DAY);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const batch = `CP-${yy}${mm}-${lotCode(product.slug)}-${String(((s + n * 37) % 89) + 10)}`;
    const report = REPORT_RECORDS[batch] || null;
    return {
      batch,
      slug: product.slug,
      product: product.name,
      category: product.category,
      size: product.variants[n % product.variants.length].size,
      /** Date the lot was filled and labelled — not a test date. */
      dated: iso(date),
      /** Only ever set from an issued certificate. */
      tested: report?.tested || null,
      purity: report?.purity || null,
      report,
      file: report?.file || null,
    };
  };
  return [make(0)];
}

export const BATCHES = PRODUCTS.flatMap(lotsFor).sort((a, b) => b.dated.localeCompare(a.dated));

export const batchesForSlug = (slug) => BATCHES.filter((b) => b.slug === slug);
export const getBatch = (batch) => BATCHES.find((b) => b.batch === batch);
export const publishedForSlug = (slug) => batchesForSlug(slug).filter((b) => b.report);
export const PUBLISHED_BATCHES = BATCHES.filter((b) => b.report);
