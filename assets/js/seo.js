// Per-page metadata for a site where one HTML file serves many pages.
//
// `product.html?p=slug` and `report.html?b=lot` are single files rendering 49
// products and 49 lots. Whatever the file declares statically is therefore
// declared by every one of them at once: 49 pages claiming the same canonical
// URL is 48 duplicates as far as a crawler is concerned, and none of them rank.
// Everything here rewrites those tags from the record being displayed.
import { SITE, money, DISCOUNT_PCT } from './catalog.js';

const ORIGIN = 'https://cryptopeptides.com';
const abs = (path) => `${ORIGIN}/${String(path).replace(/^\//, '')}`;

function meta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, kind, name] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
    if (kind && name) el.setAttribute(kind, name);
    document.head.append(el);
  }
  el.setAttribute(attr, value);
}

/** Title, description, canonical and the social tags, for one record. */
export function setPageMeta({ title, description, path, image }) {
  document.title = title;
  const url = abs(path);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = url;

  meta('meta[name="description"]', 'content', description);
  meta('meta[property="og:title"]', 'content', title);
  meta('meta[property="og:description"]', 'content', description);
  meta('meta[property="og:url"]', 'content', url);
  meta('meta[property="og:image"]', 'content', abs(image || 'assets/img/vial-base.jpg'));
  meta('meta[name="twitter:title"]', 'content', title);
  meta('meta[name="twitter:description"]', 'content', description);
}

function jsonLd(id, data) {
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

/**
 * Product schema.
 *
 * No `aggregateRating` and no `review`: none have been collected, and a rating
 * in structured data is a claim to the search engine as much as to the reader.
 * Offers carry the real price and the real availability, nothing else.
 */
export function productSchema(product) {
  const url = abs(`product.html?p=${encodeURIComponent(product.slug)}`);
  jsonLd('ld-product', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    sku: product.slug,
    ...(product.cas ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'CAS number', value: product.cas }] } : {}),
    ...(product.aka ? { alternateName: product.aka } : {}),
    category: product.categoryName,
    brand: { '@type': 'Brand', name: SITE.name },
    image: abs('assets/img/vial-base.jpg'),
    url,
    offers: product.variants.map((v) => ({
      '@type': 'Offer',
      name: `${product.name} ${v.size}`,
      sku: v.id,
      price: v.price.toFixed(2),
      priceCurrency: SITE.currency,
      availability: 'https://schema.org/InStock',
      url,
      seller: { '@type': 'Organization', name: SITE.name },
    })),
  });
}

export function breadcrumbSchema(trail) {
  jsonLd('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(path),
    })),
  });
}

/** Organization + the site-wide offer, for the home page. */
export function siteSchema() {
  jsonLd('ld-site', {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: SITE.name,
    url: ORIGIN,
    email: SITE.email,
    description: SITE.tagline,
    logo: abs('assets/img/logo-mark.svg'),
    paymentAccepted: 'Bitcoin, Solana, Ethereum',
    currenciesAccepted: SITE.currency,
    slogan: `${DISCOUNT_PCT}% below list on every vial, free shipping over ${money(SITE.freeShippingOver)}`,
  });
}
