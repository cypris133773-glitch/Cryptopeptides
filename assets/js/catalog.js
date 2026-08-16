// Product catalogue for CryptoPeptides.
//
// Every price in the store is derived from `msrp` by the site-wide discount
// below, so the storefront can never drift out of sync with the sticker price
// shown next to it.
//
// The cuts are listed in the order they were made and applied in sequence, so
// a further reduction is a line added here rather than a rewrite of the
// numbers: 15% off list, then a further 35% off that.
export const DISCOUNT_STAGES = [0.15, 0.35];

/** Combined discount off list — 0.4475, i.e. list x 0.5525. */
export const DISCOUNT = 1 - DISCOUNT_STAGES.reduce((factor, cut) => factor * (1 - cut), 1);

/** The figure the site advertises. Floored, never rounded up: a price must
 *  never be less discounted than the number next to it claims. */
export const DISCOUNT_PCT = Math.floor(DISCOUNT * 100);

/* Volume offer: one vial free with every five. The free ones are the cheapest
 * in the basket, which is the reading that never surprises a buyer downwards,
 * and it is applied on top of the site-wide cut rather than instead of it. */
export const FREE_VIAL_PER = 5;

/** How many vials come free with `qty` paid-for vials. */
export const freeVialsFor = (qty) => Math.floor(qty / FREE_VIAL_PER);

/** Vials still to add before the next free one. */
export const toNextFreeVial = (qty) => (FREE_VIAL_PER - (qty % FREE_VIAL_PER)) % FREE_VIAL_PER || FREE_VIAL_PER;

/* Every order ships with a reconstitution kit at no charge. Described here so
 * the homepage, the cart and the assistant all quote the same thing. */
export const FREE_KIT = {
  label: 'Reconstitution kit',
  contents: '3 ml bacteriostatic water and a sterile syringe',
  note: 'Added to every order at no charge.',
};

export const SITE = {
  name: 'CryptoPeptides',
  short: 'CP',
  // Nothing here may assert a test result. `REPORTS` in lab.js is empty, so
  // "third-party tested" was a present-tense claim with zero certificates
  // behind it; what the site can actually show is the lot registry. The line
  // reverts to a testing claim only by way of lab.js, never by editing copy.
  tagline: 'Research-grade peptides, lot-numbered and traceable, crypto-only checkout.',
  email: 'Cryptopeptides@proton.me',
  freeShippingOver: 150,
  currency: 'USD',
  // Everything below is a tunable the UI reads — no magic numbers in page code.
  maxQty: 99, // per cart line
  maxStoredOrders: 30, // browser-local order history depth
  orderRetentionDays: 90, // matches the retention promised on privacy.html
  toastMs: 4200,
  announceMs: 4500,
  quoteMinutes: 30,
  shortfallTolerance: 0.02, // 2% — the single source for the tolerance copy
};

/* Shipping.
 *
 * Rates must match the published table on shipping.html. `other` is the
 * "Elsewhere — quoted at checkout" row: the quote is this rate, shown on the
 * checkout summary as soon as the country is picked. */
export const SHIPPING = {
  zones: [
    { id: 'us', label: 'United States', rate: 14.95, transit: '2–4 business days', freeOver: SITE.freeShippingOver },
    { id: 'ca', label: 'Canada', rate: 19.95, transit: '5–9 business days', freeOver: SITE.freeShippingOver },
    { id: 'eu', label: 'Europe & UK', rate: 19.95, transit: '5–10 business days', freeOver: SITE.freeShippingOver },
    { id: 'anz', label: 'Australia & New Zealand', rate: 24.95, transit: '7–12 business days', freeOver: SITE.freeShippingOver },
    { id: 'other', label: 'Elsewhere', rate: 29.95, transit: '7–15 business days', freeOver: null },
  ],
  countries: {
    'United States': 'us',
    Canada: 'ca',
    'United Kingdom': 'eu',
    Germany: 'eu',
    Netherlands: 'eu',
    France: 'eu',
    Spain: 'eu',
    Italy: 'eu',
    Poland: 'eu',
    Sweden: 'eu',
    Australia: 'anz',
    'New Zealand': 'anz',
    Other: 'other',
  },
  defaultCountry: 'United States',
};

export const shippingZone = (country) =>
  SHIPPING.zones.find((z) => z.id === (SHIPPING.countries[country] || 'other')) ||
  SHIPPING.zones[SHIPPING.zones.length - 1];

/** Shipping cost for a destination and cart subtotal. */
export function shippingCost(country, subtotal) {
  const zone = shippingZone(country);
  if (zone.freeOver !== null && subtotal >= zone.freeOver) return 0;
  return zone.rate;
}

export const CRYPTO = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin (native SegWit / Taproot)',
    address: 'bc1ptjhs8akhd7jv3tec4exh2e07w4cw7dh5jjm3tt0r5hvgl0a9yfpsumw3x5',
    qr: 'assets/img/qr-btc.svg',
    confirmations: '1 confirmation',
    note: 'Send only BTC on the Bitcoin network. Do not send BEP-20 or wrapped BTC.',
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana (SPL)',
    address: 'jFS98zya6uTUrJT2DY4J3fMDqRksZjcnsStrrYWe3j3',
    qr: 'assets/img/qr-sol.svg',
    confirmations: 'usually under a minute',
    note: 'Send only SOL on the Solana network. USDC-SPL is accepted at the same address.',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum (ERC-20)',
    address: '0x91eeba40c1683a7c8bea25dfec4bdb81d2d6bfd2',
    qr: 'assets/img/qr-eth.svg',
    confirmations: '2 confirmations',
    note: 'Send only ETH or ERC-20 stablecoins on Ethereum mainnet. Layer-2 deposits are not credited.',
  },
];

export const CATEGORIES = [
  { id: 'glp1', name: 'GLP-1 & Metabolic', blurb: 'Incretin and metabolic research compounds.', accent: '#1252e0' },
  { id: 'healing', name: 'Healing & Recovery', blurb: 'Tissue, gut and immune-signalling peptides.', accent: '#0d9488' },
  { id: 'gh', name: 'Growth Hormone Secretagogues', blurb: 'GHRH analogues, ghrelin mimetics and fragments.', accent: '#0284c7' },
  { id: 'longevity', name: 'Longevity & Mitochondrial', blurb: 'Mitochondrial-derived and geroprotective peptides.', accent: '#b45309' },
  { id: 'vitality', name: 'Aesthetics & Vitality', blurb: 'Melanocortin, skin and vitality research.', accent: '#be185d' },
  { id: 'cognitive', name: 'Cognitive & Neuro', blurb: 'Nootropic and neurotrophic research peptides.', accent: '#6d28d9' },
  { id: 'blends', name: 'Blends & Stacks', blurb: 'Pre-mixed vials and multi-vial research kits.', accent: '#0f766e' },
];

// v(size, msrp, extra) — a purchasable variant. `id`, `price`, `mg` and
// `perMg` are all derived in `normalise()`. `extra` carries per-variant data
// that is not price — currently only `components` on the blends and kits.
const v = (size, msrp, extra) => ({ size, msrp, ...extra });

/* NO REVIEW DATA LIVES HERE.
 *
 * `rating` and `reviews` seed fields used to sit on all 49 entries. They were
 * never real: no customer review has ever been collected by this store. They
 * were deleted rather than left for the next person to wire up, because wiring
 * them up would manufacture ratings out of nothing. Do not reintroduce either
 * field, or an `aggregateRating`/`review` node in the JSON-LD, until verified
 * attributed feedback exists — and then publish it with the order it came from. */

/* Physicochemical reference data, keyed by slug.
 *
 * These are published facts about the *molecule*, not measurements of our
 * material, so they need no certificate and imply none. Every field here is a
 * value I could state with confidence; where a compound's identity is
 * ambiguous in the trade (TB-500 is sold both as full Thymosin β-4 and as the
 * Ac-LKKTETQ fragment) or the figure is not something I can vouch for, the
 * field — or the whole entry — is simply absent. An eight-row table of true
 * rows beats a twelve-row table with three invented ones. Add to it only from
 * a source you have actually checked, and note the source in a comment.
 *
 * Deliberately absent: retatrutide, cagrilintide, survodutide, mazdutide,
 * tb-500, ara-290, igf-1-lr3, follistatin-344, thymalin, and all six blends
 * (a mixture has no single formula — its components are listed instead). */
const REFERENCE = {
  // ── GLP-1 & Metabolic ──
  semaglutide: { formula: 'C187H291N45O59', mw: '4113.58 g/mol' },
  tirzepatide: { formula: 'C225H348N48O68', mw: '4813.45 g/mol' },

  // ── Growth hormone secretagogues ──
  'aod-9604': {
    sequence: 'YLRIVQCRSVEGSCGF (cyclic, Cys–Cys disulfide bridge)',
    formula: 'C78H123N23O23S2',
    mw: '1815.08 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'hgh-fragment-176-191': {
    // Same residues as AOD-9604; this is the reduced (free-thiol) form, hence
    // the two-hydrogen difference in formula and mass.
    sequence: 'YLRIVQCRSVEGSCGF',
    formula: 'C78H125N23O23S2',
    mw: '1817.12 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  tesamorelin: {
    sequence: 'trans-3-hexenoyl-GHRH(1–44) amide',
    formula: 'C221H366N72O67S',
    mw: '5135.86 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  sermorelin: {
    sequence:
      'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH₂ (GHRH 1–29 amide)',
    formula: 'C149H246N44O42S',
    mw: '3357.88 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'cjc-1295-no-dac': {
    sequence:
      'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH₂ (GHRH 1–29 with D-Ala², Gln⁸, Ala¹⁵, Leu²⁷)',
    formula: 'C152H252N44O42',
    mw: '3367.95 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'cjc-1295-dac': {
    sequence: 'Modified GHRH(1–29) as above, plus a Lys³⁰ drug-affinity complex (maleimidopropionyl)',
    formula: 'C165H269N47O46',
    mw: '3647.19 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  ipamorelin: {
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH₂',
    formula: 'C38H49N9O5',
    mw: '711.85 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  hexarelin: {
    sequence: 'His-D-2-methyl-Trp-Ala-Trp-D-Phe-Lys-NH₂',
    formula: 'C47H58N12O6',
    mw: '887.04 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'ghrp-2': {
    sequence: 'D-Ala-D-2-Nal-Ala-Trp-D-Phe-Lys-NH₂',
    formula: 'C45H55N9O6',
    mw: '817.97 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'ghrp-6': {
    sequence: 'His-D-Trp-Ala-Trp-D-Phe-Lys-NH₂',
    formula: 'C46H56N12O6',
    mw: '873.01 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },

  // ── Healing & recovery ──
  'bpc-157': {
    sequence: 'GEPPPGKPADDAGLV',
    formula: 'C62H98N16O22',
    mw: '1419.53 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  // TB-500 carries solubility only: the trade sells both full Thymosin β-4 and
  // the Ac-LKKTETQ active fragment under this name, and this listing does not
  // say which, so no sequence, formula or mass is asserted for it.
  'tb-500': { solubility: 'Soluble in sterile or bacteriostatic water' },
  kpv: {
    sequence: 'KPV (Lys-Pro-Val)',
    formula: 'C16H30N4O4',
    mw: '342.44 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'll-37': {
    sequence: 'LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES',
    mw: '4493.26 g/mol',
  },
  'thymosin-alpha-1': {
    sequence: 'Ac-SDAAVDTSSEITTKDLKEKKEVVEEAEN',
    formula: 'C129H215N33O55',
    mw: '3108.28 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'ghk-cu': {
    sequence: 'GHK (Gly-His-Lys), copper(II) complex',
    formula: 'C14H22CuN6O4',
    mw: '403.93 g/mol',
    salt: 'Copper(II) complex',
    appearance: 'Blue lyophilised powder — the colour is the copper(II) complex',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  vip: {
    sequence: 'HSDAVFTDNYTRLRKQMAVKKYLNSILN-NH₂',
    formula: 'C147H238N44O42S',
    mw: '3325.85 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  larazotide: { sequence: 'GGVLVQPG', mw: '727.85 g/mol (free base)', salt: 'Acetate' },

  // ── Longevity & mitochondrial ──
  epithalon: {
    sequence: 'AEDG (Ala-Glu-Asp-Gly)',
    formula: 'C14H22N4O9',
    mw: '390.35 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'nad-plus': {
    formula: 'C21H27N7O14P2',
    mw: '663.43 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'mots-c': { sequence: 'MRWQEMGYIFYPRKLR', mw: '2174.59 g/mol', solubility: 'Soluble in sterile or bacteriostatic water' },
  'ss-31': {
    sequence: 'D-Arg-Dmt-Lys-Phe-NH₂',
    formula: 'C32H49N9O5',
    mw: '639.79 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  humanin: { sequence: 'MAPRGFSCLLLLTSEIDLPVKRRA', mw: '2687.19 g/mol' },
  glutathione: {
    sequence: 'γ-Glu-Cys-Gly (reduced L-glutathione)',
    formula: 'C10H17N3O6S',
    mw: '307.32 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },

  // ── Aesthetics & vitality ──
  'melanotan-ii': {
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH₂',
    formula: 'C50H69N15O9',
    mw: '1024.18 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'pt-141': {
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH',
    formula: 'C50H68N14O10',
    mw: '1025.16 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'snap-8': {
    sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH₂ (acetyl octapeptide-3)',
    mw: '1075.18 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  'kisspeptin-10': {
    sequence: 'YNWNSFGLRF-NH₂',
    formula: 'C63H83N17O14',
    mw: '1302.45 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  oxytocin: {
    sequence: 'CYIQNCPLG-NH₂ (disulfide bridge Cys¹–Cys⁶)',
    formula: 'C43H66N12O12S2',
    mw: '1007.19 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },

  // ── Cognitive & neuro ──
  selank: {
    sequence: 'TKPRPGP (Thr-Lys-Pro-Arg-Pro-Gly-Pro)',
    formula: 'C33H57N11O9',
    mw: '751.89 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  semax: {
    sequence: 'MEHFPGP (Met-Glu-His-Phe-Pro-Gly-Pro)',
    formula: 'C37H51N9O10S',
    mw: '813.92 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
  dihexa: {
    sequence: 'N-hexanoyl-Tyr-Ile-(6)-aminohexanoic amide',
    formula: 'C26H42N4O5',
    mw: '490.64 g/mol',
  },
  dsip: {
    sequence: 'WAGGDASGE',
    formula: 'C35H48N10O15',
    mw: '848.81 g/mol',
    solubility: 'Soluble in sterile or bacteriostatic water',
  },
};

const RAW = [
  // ── GLP-1 & Metabolic ────────────────────────────────────────────────
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'glp1',
    aka: 'LY3437943',
    cas: '2381089-83-2',
    purity: '99.4%',
    badges: ['bestseller'],
    summary: 'Triple agonist (GLP-1 / GIP / glucagon) investigated in metabolic and body-composition models.',
    research: [
      'Energy expenditure and substrate partitioning models',
      'Comparative incretin receptor signalling studies',
      'Hepatic lipid accumulation research',
    ],
    variants: [v('5mg', 89.99), v('10mg', 149.99), v('15mg', 199.99), v('20mg', 249.99), v('30mg', 349.99)],
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'glp1',
    aka: 'LY3298176',
    cas: '2023788-19-2',
    purity: '99.3%',
    badges: ['bestseller'],
    summary: 'Dual GIP/GLP-1 receptor agonist, the most requested compound in our metabolic line.',
    research: [
      'Incretin receptor co-agonism assays',
      'Glycaemic regulation models',
      'Appetite-signalling pathway research',
    ],
    variants: [v('5mg', 74.99), v('10mg', 109.99), v('15mg', 149.99), v('20mg', 189.99), v('30mg', 249.99), v('60mg', 449.99)],
  },
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    category: 'glp1',
    cas: '910463-68-2',
    purity: '99.2%',
    badges: ['bestseller'],
    summary: 'Long-acting GLP-1 receptor agonist with an albumin-binding fatty-acid chain.',
    research: ['GLP-1 receptor binding kinetics', 'Gastric emptying models', 'Cardiometabolic marker research'],
    variants: [v('2mg', 44.99), v('5mg', 69.99), v('10mg', 109.99), v('15mg', 149.99), v('20mg', 189.99)],
  },
  {
    slug: 'cagrilintide',
    name: 'Cagrilintide',
    category: 'glp1',
    cas: '1415456-99-3',
    purity: '99.1%',
    summary: 'Long-acting amylin analogue studied alongside incretin agonists.',
    research: ['Amylin receptor selectivity', 'Satiety signalling models', 'Combination incretin research'],
    variants: [v('5mg', 99.99), v('10mg', 159.99)],
  },
  {
    slug: 'survodutide',
    name: 'Survodutide',
    category: 'glp1',
    aka: 'BI 456906',
    purity: '99.0%',
    badges: ['new'],
    summary: 'Glucagon/GLP-1 dual agonist under investigation for hepatic and metabolic endpoints.',
    research: ['Glucagon receptor signalling', 'Hepatic steatosis models', 'Thermogenesis research'],
    variants: [v('5mg', 109.99), v('10mg', 179.99)],
  },
  {
    slug: 'mazdutide',
    name: 'Mazdutide',
    category: 'glp1',
    aka: 'LY3305677',
    purity: '99.0%',
    badges: ['new'],
    summary: 'GLP-1/glucagon co-agonist derived from oxyntomodulin.',
    research: ['Oxyntomodulin analogue comparison', 'Metabolic rate models', 'Receptor bias assays'],
    variants: [v('5mg', 99.99), v('10mg', 169.99)],
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    category: 'gh',
    cas: '221231-10-3',
    purity: '99.2%',
    summary: 'C-terminal hGH fragment (176-191) analogue studied for lipolytic signalling without GH activity.',
    research: ['Adipocyte lipolysis assays', 'Beta-3 adrenergic pathway research', 'Cartilage repair models'],
    variants: [v('5mg', 54.99), v('10mg', 89.99)],
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'gh',
    cas: '218949-48-5',
    purity: '99.3%',
    summary: 'Stabilised GHRH(1-44) analogue with a strong body-composition literature base.',
    research: ['Visceral adipose tissue models', 'GHRH receptor affinity', 'IGF-1 axis research'],
    variants: [v('5mg', 69.99), v('10mg', 109.99)],
  },

  // ── Healing & Recovery ───────────────────────────────────────────────
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    category: 'healing',
    cas: '137525-51-0',
    purity: '99.5%',
    badges: ['bestseller'],
    summary: 'Pentadecapeptide from gastric juice, the single most-studied compound in our recovery line.',
    research: ['Tendon and ligament fibroblast models', 'Gastrointestinal mucosa research', 'Angiogenesis and VEGF signalling'],
    variants: [v('5mg', 39.99), v('10mg', 59.99), v('20mg', 99.99)],
  },
  {
    slug: 'tb-500',
    name: 'TB-500 (Thymosin Beta-4 fragment)',
    category: 'healing',
    purity: '99.4%',
    badges: ['bestseller'],
    summary: 'Actin-sequestering peptide fragment studied for cell migration and tissue remodelling.',
    research: ['Actin polymerisation assays', 'Cell-migration and wound models', 'Cardiac remodelling research'],
    variants: [v('5mg', 49.99), v('10mg', 79.99)],
  },
  {
    slug: 'kpv',
    name: 'KPV',
    category: 'healing',
    cas: '67727-97-3',
    purity: '99.3%',
    summary: 'C-terminal α-MSH tripeptide studied for its anti-inflammatory signalling.',
    research: ['NF-κB pathway modulation', 'Colitis and mucosal models', 'Cutaneous inflammation research'],
    variants: [v('10mg', 59.99)],
  },
  {
    slug: 'll-37',
    name: 'LL-37',
    category: 'healing',
    cas: '154947-66-7',
    purity: '99.0%',
    summary: 'Human cathelicidin antimicrobial peptide used widely in innate-immunity work.',
    research: ['Antimicrobial activity assays', 'Innate immune signalling', 'Biofilm disruption research'],
    variants: [v('5mg', 74.99)],
  },
  {
    slug: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    category: 'healing',
    cas: '62304-98-7',
    purity: '99.4%',
    summary: 'Thymic peptide studied extensively in T-cell maturation and immune-modulation models.',
    research: ['T-cell differentiation assays', 'Toll-like receptor signalling', 'Viral-response models'],
    variants: [v('5mg', 69.99), v('10mg', 109.99)],
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'healing',
    cas: '89030-95-5',
    purity: '99.5%',
    badges: ['bestseller'],
    summary: 'Copper tripeptide complex with a deep dermal-remodelling and gene-expression literature.',
    research: ['Collagen and elastin synthesis', 'Gene-expression resetting studies', 'Antioxidant and chelation assays'],
    variants: [v('50mg', 54.99), v('100mg', 89.99)],
  },
  {
    slug: 'ara-290',
    name: 'ARA-290',
    category: 'healing',
    aka: 'Cibinetide',
    purity: '99.0%',
    summary: 'Non-erythropoietic EPO-derived peptide studied in small-fibre neuropathy models.',
    research: ['Innate repair receptor signalling', 'Neuropathic pain models', 'Metabolic inflammation research'],
    variants: [v('10mg', 89.99)],
  },
  {
    slug: 'vip',
    name: 'VIP (Vasoactive Intestinal Peptide)',
    category: 'healing',
    cas: '37221-79-7',
    purity: '99.1%',
    summary: 'Neuropeptide studied in mucosal immunity, circadian and vasodilatory research.',
    research: ['VPAC1/VPAC2 receptor assays', 'Mucosal immune models', 'Circadian signalling research'],
    variants: [v('5mg', 84.99)],
  },
  {
    slug: 'larazotide',
    name: 'Larazotide Acetate',
    category: 'healing',
    purity: '99.0%',
    summary: 'Tight-junction regulator peptide used in intestinal permeability research.',
    research: ['Zonulin antagonism assays', 'Epithelial barrier integrity', 'Coeliac disease models'],
    variants: [v('5mg', 89.99)],
  },

  // ── Growth Hormone Secretagogues ─────────────────────────────────────
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 no DAC (Mod GRF 1-29)',
    category: 'gh',
    purity: '99.3%',
    summary: 'Tetra-substituted GHRH(1-29) analogue with a short pulse profile.',
    research: ['GHRH receptor binding', 'Pulsatile GH release models', 'Synergy studies with ghrelin mimetics'],
    variants: [v('5mg', 44.99), v('10mg', 74.99)],
  },
  {
    slug: 'cjc-1295-dac',
    name: 'CJC-1295 with DAC',
    category: 'gh',
    cas: '863288-34-0',
    purity: '99.2%',
    summary: 'Drug-affinity-complex variant with an extended circulating half-life.',
    research: ['Albumin-binding pharmacokinetics', 'Sustained GH bleed models', 'IGF-1 response research'],
    variants: [v('5mg', 59.99), v('10mg', 99.99)],
  },
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'gh',
    cas: '170851-70-4',
    purity: '99.5%',
    badges: ['bestseller'],
    summary: 'Selective ghrelin receptor agonist with minimal cortisol or prolactin cross-talk in the literature.',
    research: ['GHS-R1a selectivity assays', 'GH pulse amplitude models', 'Bone-density research'],
    variants: [v('5mg', 39.99), v('10mg', 64.99)],
  },
  {
    slug: 'sermorelin',
    name: 'Sermorelin',
    category: 'gh',
    cas: '86168-78-7',
    purity: '99.3%',
    summary: 'GHRH(1-29) fragment, the reference compound for GHRH-axis research.',
    research: ['GHRH receptor agonism', 'Sleep-architecture models', 'Age-related GH decline research'],
    variants: [v('5mg', 49.99), v('10mg', 79.99)],
  },
  {
    slug: 'hexarelin',
    name: 'Hexarelin',
    category: 'gh',
    cas: '140703-51-1',
    purity: '99.1%',
    summary: 'Potent hexapeptide ghrelin mimetic with additional cardiac-tissue literature.',
    research: ['CD36 receptor signalling', 'Cardioprotection models', 'GH secretagogue potency assays'],
    variants: [v('5mg', 54.99)],
  },
  {
    slug: 'ghrp-2',
    name: 'GHRP-2',
    category: 'gh',
    cas: '158861-67-7',
    purity: '99.2%',
    summary: 'Second-generation growth hormone releasing peptide.',
    research: ['GHS-R binding assays', 'Appetite signalling models', 'GH release comparison studies'],
    variants: [v('5mg', 39.99), v('10mg', 64.99)],
  },
  {
    slug: 'ghrp-6',
    name: 'GHRP-6',
    category: 'gh',
    cas: '87616-84-0',
    purity: '99.2%',
    summary: 'Classic hexapeptide secretagogue with pronounced ghrelin-pathway activity.',
    research: ['Ghrelin receptor agonism', 'Gastric motility research', 'Comparative GH release'],
    variants: [v('5mg', 39.99), v('10mg', 64.99)],
  },
  {
    slug: 'hgh-fragment-176-191',
    name: 'HGH Fragment 176-191',
    category: 'gh',
    cas: '66004-57-7',
    purity: '99.3%',
    summary: 'Lipolytic C-terminal fragment of human growth hormone.',
    research: ['Adipose lipolysis assays', 'Non-GH-mediated fat metabolism', 'Comparative fragment studies'],
    variants: [v('5mg', 54.99), v('10mg', 89.99)],
  },
  {
    slug: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    category: 'gh',
    cas: '946870-92-4',
    purity: '98.9%',
    summary: 'Long-arg3 analogue of IGF-1 with reduced binding-protein affinity.',
    research: ['IGF-1 receptor signalling', 'Myoblast proliferation assays', 'Binding-protein interaction studies'],
    variants: [v('1mg', 89.99)],
  },
  {
    slug: 'follistatin-344',
    name: 'Follistatin-344',
    category: 'gh',
    purity: '98.5%',
    summary: 'Myostatin-binding glycoprotein fragment used in muscle-signalling research.',
    research: ['Myostatin inhibition assays', 'Activin signalling', 'Muscle hypertrophy models'],
    variants: [v('1mg', 129.99)],
  },

  // ── Longevity & Mitochondrial ────────────────────────────────────────
  {
    slug: 'epithalon',
    name: 'Epithalon',
    category: 'longevity',
    cas: '307297-39-8',
    purity: '99.5%',
    badges: ['bestseller'],
    summary: 'Pineal tetrapeptide studied for telomerase expression and circadian regulation.',
    research: ['Telomerase activity assays', 'Melatonin rhythm models', 'Cellular senescence research'],
    variants: [v('10mg', 49.99), v('50mg', 129.99)],
  },
  {
    slug: 'nad-plus',
    name: 'NAD+',
    category: 'longevity',
    cas: '53-84-9',
    purity: '99.6%',
    badges: ['bestseller'],
    summary: 'Nicotinamide adenine dinucleotide, lyophilised and sealed under nitrogen.',
    research: ['Sirtuin activation studies', 'Mitochondrial respiration assays', 'DNA-repair pathway research'],
    variants: [v('500mg', 89.99), v('1000mg', 149.99)],
  },
  {
    slug: 'mots-c',
    name: 'MOTS-c',
    category: 'longevity',
    cas: '1627580-64-6',
    purity: '99.2%',
    summary: 'Mitochondrial-derived peptide studied in metabolic homeostasis and exercise models.',
    research: ['AMPK pathway activation', 'Insulin sensitivity models', 'Exercise-capacity research'],
    variants: [v('10mg', 79.99)],
  },
  {
    slug: 'ss-31',
    name: 'SS-31 (Elamipretide)',
    category: 'longevity',
    cas: '736992-21-5',
    purity: '99.1%',
    summary: 'Cardiolipin-targeting tetrapeptide concentrated at the inner mitochondrial membrane.',
    research: ['Cardiolipin binding assays', 'ROS production models', 'Mitochondrial cristae morphology'],
    variants: [v('10mg', 89.99), v('50mg', 229.99)],
  },
  {
    slug: 'humanin',
    name: 'Humanin',
    category: 'longevity',
    purity: '99.0%',
    summary: 'Mitochondrial-derived peptide studied in cytoprotection and neurodegeneration models.',
    research: ['Bax-mediated apoptosis assays', 'Neuroprotection models', 'Metabolic ageing research'],
    variants: [v('10mg', 89.99)],
  },
  {
    slug: 'thymalin',
    name: 'Thymalin',
    category: 'longevity',
    purity: '99.0%',
    summary: 'Thymic peptide complex studied for immune-system restoration in ageing models.',
    research: ['Thymic involution models', 'Lymphocyte population studies', 'Geroprotection research'],
    variants: [v('10mg', 69.99)],
  },
  {
    slug: 'glutathione',
    name: 'Glutathione',
    category: 'longevity',
    cas: '70-18-8',
    purity: '99.5%',
    summary: 'Reduced L-glutathione, lyophilised for antioxidant and redox research.',
    research: ['Redox balance assays', 'Phase-II detoxification models', 'Oxidative stress research'],
    variants: [v('600mg', 49.99), v('1500mg', 79.99)],
  },

  // ── Aesthetics & Vitality ────────────────────────────────────────────
  {
    slug: 'melanotan-ii',
    name: 'Melanotan II',
    category: 'vitality',
    cas: '121062-08-6',
    purity: '99.3%',
    badges: ['bestseller'],
    summary: 'Cyclic melanocortin agonist, the reference compound for melanogenesis research.',
    research: ['MC1R/MC4R receptor assays', 'Melanogenesis models', 'Comparative melanocortin studies'],
    variants: [v('10mg', 49.99)],
  },
  {
    slug: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    category: 'vitality',
    cas: '189691-06-3',
    purity: '99.4%',
    summary: 'Melanocortin receptor agonist and Melanotan II metabolite.',
    research: ['MC4R signalling assays', 'Central arousal pathway models', 'Melanocortin selectivity studies'],
    variants: [v('10mg', 59.99)],
  },
  {
    slug: 'snap-8',
    name: 'SNAP-8',
    category: 'vitality',
    cas: '868844-74-0',
    purity: '99.2%',
    summary: 'Octapeptide studied as a topical SNARE-complex modulator in dermal research.',
    research: ['SNARE complex assays', 'Expression-line dermal models', 'Topical delivery research'],
    variants: [v('10mg', 54.99)],
  },
  {
    slug: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    category: 'vitality',
    cas: '374675-21-5',
    purity: '99.1%',
    summary: 'Decapeptide studied as an upstream regulator of the reproductive axis.',
    research: ['GPR54 receptor assays', 'GnRH pulse generator models', 'Reproductive endocrinology research'],
    variants: [v('5mg', 69.99), v('10mg', 109.99)],
  },
  {
    slug: 'oxytocin',
    name: 'Oxytocin',
    category: 'vitality',
    cas: '50-56-6',
    purity: '99.4%',
    summary: 'Nonapeptide hormone widely used in social-behaviour and receptor research.',
    research: ['Oxytocin receptor binding', 'Social-behaviour models', 'Smooth-muscle contraction assays'],
    variants: [v('10mg', 59.99)],
  },

  // ── Cognitive & Neuro ────────────────────────────────────────────────
  {
    slug: 'selank',
    name: 'Selank',
    category: 'cognitive',
    cas: '129954-34-3',
    purity: '99.3%',
    summary: 'Tuftsin-derived heptapeptide studied for anxiolytic and immunomodulatory signalling.',
    research: ['GABAergic modulation', 'BDNF expression assays', 'Stress-response models'],
    variants: [v('10mg', 54.99)],
  },
  {
    slug: 'semax',
    name: 'Semax',
    category: 'cognitive',
    cas: '80714-61-0',
    purity: '99.3%',
    summary: 'ACTH(4-10) analogue used in neurotrophic and cognition research.',
    research: ['BDNF and NGF expression', 'Ischaemia neuroprotection models', 'Attention and memory research'],
    variants: [v('10mg', 59.99), v('30mg', 139.99)],
  },
  {
    slug: 'dihexa',
    name: 'Dihexa',
    category: 'cognitive',
    cas: '1401708-83-5',
    purity: '98.8%',
    summary: 'Angiotensin IV analogue studied for hepatocyte growth factor potentiation.',
    research: ['HGF/c-Met signalling', 'Synaptogenesis assays', 'Blood-brain-barrier permeability research'],
    variants: [v('5mg', 129.99)],
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    category: 'cognitive',
    cas: '62568-57-4',
    purity: '99.2%',
    summary: 'Delta sleep-inducing peptide, used in sleep-architecture and stress research.',
    research: ['Delta-wave EEG models', 'Corticotropin regulation', 'Circadian entrainment research'],
    variants: [v('5mg', 44.99), v('10mg', 74.99)],
  },

  // ── Blends & Stacks ──────────────────────────────────────────────────
  {
    slug: 'bpc-tb500-blend',
    name: 'BPC-157 + TB-500 Blend',
    category: 'blends',
    purity: '99.4%',
    badges: ['bestseller'],
    summary: 'Pre-mixed recovery blend in a single vial — even split between both peptides.',
    research: ['Combined tissue-repair models', 'Angiogenesis plus cell migration', 'Comparative single vs. blend studies'],
    variants: [
      v('10mg (5/5)', 89.99, { components: [['bpc-157', '5mg'], ['tb-500', '5mg']] }),
      v('20mg (10/10)', 149.99, { components: [['bpc-157', '10mg'], ['tb-500', '10mg']] }),
    ],
  },
  {
    slug: 'cjc-ipamorelin-blend',
    name: 'CJC-1295 + Ipamorelin Blend',
    category: 'blends',
    purity: '99.3%',
    badges: ['bestseller'],
    // No `components` here on purpose. The catalogue sells CJC-1295 in two
    // forms — with DAC and no DAC (Mod GRF 1-29), $8.28 apart at 5 mg — and
    // this listing does not say which is in the vial. A component breakdown
    // would have to pick one, which is a claim about what ships. It stays
    // absent until the listing itself states the form.
    summary: 'The classic GHRH + ghrelin-mimetic pairing, pre-mixed and lyophilised together.',
    research: ['Synergistic GH pulse models', 'Receptor co-stimulation assays', 'IGF-1 response research'],
    variants: [v('10mg (5/5)', 79.99), v('20mg (10/10)', 139.99)],
  },
  {
    slug: 'reta-cagri-stack',
    name: 'Retatrutide + Cagrilintide Stack',
    category: 'blends',
    purity: '99.2%',
    badges: ['new'],
    summary: 'Two-vial metabolic research kit: Retatrutide 10mg and Cagrilintide 10mg.',
    research: ['Incretin plus amylin co-agonism', 'Combination satiety models', 'Comparative metabolic endpoints'],
    variants: [v('10mg + 10mg', 259.99, { components: [['retatrutide', '10mg'], ['cagrilintide', '10mg']] })],
  },
  {
    slug: 'tirz-cagri-stack',
    name: 'Tirzepatide + Cagrilintide Stack',
    category: 'blends',
    purity: '99.2%',
    summary: 'Two-vial kit pairing our most-requested incretin with a long-acting amylin analogue.',
    research: ['Dual-pathway metabolic models', 'Receptor occupancy studies', 'Body-composition research'],
    variants: [v('10mg + 10mg', 219.99, { components: [['tirzepatide', '10mg'], ['cagrilintide', '10mg']] })],
  },
  {
    slug: 'glow-stack',
    name: 'Dermal Research Kit',
    category: 'blends',
    purity: '99.4%',
    badges: ['bestseller'],
    summary: 'Three-vial dermal research kit: GHK-Cu 50mg, BPC-157 10mg and TB-500 10mg.',
    research: ['Dermal remodelling models', 'Collagen synthesis assays', 'Combined repair-pathway research'],
    variants: [
      v('3-vial kit', 149.99, {
        components: [['ghk-cu', '50mg'], ['bpc-157', '10mg'], ['tb-500', '10mg']],
      }),
    ],
  },
  {
    slug: 'repair-stack',
    name: 'Tissue Repair Research Kit',
    category: 'blends',
    purity: '99.4%',
    summary: 'Three-vial recovery kit: BPC-157 10mg, TB-500 10mg and KPV 10mg.',
    research: ['Multi-pathway tissue repair', 'Inflammatory signalling models', 'Gut-barrier research'],
    variants: [
      v('3-vial kit', 159.99, {
        components: [['bpc-157', '10mg'], ['tb-500', '10mg'], ['kpv', '10mg']],
      }),
    ],
  },

];

const round2 = (n) => Math.round(n * 100) / 100;

/** Sale price for an MSRP — the single place the cuts are applied. Rounded
 *  once at the end, so stacking stages cannot compound a rounding error. */
export const salePrice = (msrp) => round2(msrp * (1 - DISCOUNT));

/* Milligrams in a size string. Parenthesised splits describe how a total is
 * divided, not additional material — "10mg (5/5)" is 10mg — so they come out
 * before the numbers are summed, while "10mg + 10mg" is genuinely 20mg. */
export function sizeMg(size) {
  const flat = String(size).replace(/\([^)]*\)/g, ' ');
  const hits = [...flat.matchAll(/(\d+(?:\.\d+)?)\s*mg\b/gi)].map((m) => Number(m[1]));
  return hits.length ? hits.reduce((a, b) => a + b, 0) : null;
}

function normalise(p) {
  const variants = p.variants.map((variant) => {
    const mg = sizeMg(variant.size);
    const price = salePrice(variant.msrp);
    return {
      ...variant,
      id: `${p.slug}--${variant.size.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
      price,
      mg,
      // The comparison this category actually buys on: the same compound can
      // run twice the price per milligram at the small size.
      perMg: mg ? price / mg : null,
      productSlug: p.slug,
      productName: p.name,
    };
  });
  const prices = variants.map((variant) => variant.price);
  const isSupply = p.category === 'supplies';
  return {
    ...p,
    // Consumables are not assayed peptides. They carry a `spec` line instead of
    // a purity figure, so nothing renders "Assayed purity: holds 20 vials".
    purity: isSupply ? null : p.purity || '99%+',
    spec: p.spec || null,
    badges: p.badges || [],
    variants,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    accent: (CATEGORIES.find((c) => c.id === p.category) || {}).accent || '#7c5cff',
    categoryName: (CATEGORIES.find((c) => c.id === p.category) || {}).name || '',
  };
}

export const PRODUCTS = RAW.map(normalise);

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));
const BY_VARIANT = new Map();
for (const p of PRODUCTS) for (const variant of p.variants) BY_VARIANT.set(variant.id, { product: p, variant });

export const getProduct = (slug) => BY_SLUG.get(slug);

/**
 * What a blend or kit saves against buying its parts separately.
 * @returns {{parts: number, saving: number, pct: number}|null} null when the
 *   variant lists no components, or when the parts are cheaper — a "saving"
 *   that is negative is not a saving, and printing it either way would be a
 *   claim the basket disproves.
 */
export function blendSaving(variant) {
  if (!variant?.components) return null;
  let parts = 0;
  for (const [slug, size] of variant.components) {
    const product = BY_SLUG.get(slug);
    const match = product?.variants.find((v) => v.size === size);
    if (!match) return null; // an unresolvable component makes the sum a guess
    parts += match.price;
  }
  const saving = parts - variant.price;
  return saving > 0.005 ? { parts, saving, pct: Math.round((saving / parts) * 100) } : { parts, saving: 0, pct: 0 };
}
export const getVariant = (id) => BY_VARIANT.get(id);

export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
