/**
 * Helper per estrarre la preview del costo dell'oggetto dal link di acquisto.
 */

export interface PricePreviewResult {
  priceText: string | null;
  storeName: string | null;
}

// Riconosce i negozi più popolari
export function detectStoreName(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('amazon')) return 'Amazon';
    if (hostname.includes('ebay')) return 'eBay';
    if (hostname.includes('zalando')) return 'Zalando';
    if (hostname.includes('apple.com')) return 'Apple';
    if (hostname.includes('unieuro')) return 'Unieuro';
    if (hostname.includes('mediaworld')) return 'MediaWorld';
    if (hostname.includes('ikea')) return 'IKEA';
    if (hostname.includes('shein')) return 'SHEIN';
    if (hostname.includes('temu')) return 'Temu';
    if (hostname.includes('aliexpress')) return 'AliExpress';
    if (hostname.includes('zara')) return 'Zara';
    if (hostname.includes('sephora')) return 'Sephora';
    if (hostname.includes('feltrinelli')) return 'Feltrinelli';
    if (hostname.includes('ibs.it')) return 'IBS';
    if (hostname.includes('decathlon')) return 'Decathlon';
    if (hostname.includes('nike')) return 'Nike';
    if (hostname.includes('asos')) return 'ASOS';

    // Rimuove 'www.' dal dominio
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Cerca prezzi con pattern valuta EUR (€) nel testo
function extractPriceFromText(text: string): string | null {
  if (!text) return null;

  // Pattern es: € 29,99 oppure 29,99 € o 120€
  const euroRegex = /(?:€\s*([0-9]{1,4}(?:[.,][0-9]{2})?))|((?:[0-9]{1,4}(?:[.,][0-9]{2})?)\s*€)/i;
  const match = text.match(euroRegex);
  if (match) {
    const raw = match[0].trim();
    // Pulisce e formatta
    return raw.startsWith('€') ? raw : `${raw.replace('€', '').trim()} €`;
  }

  // Pattern es: 29.99 EUR o EUR 29.99
  const eurRegex = /(?:EUR\s*([0-9]{1,4}(?:[.,][0-9]{2})?))|((?:[0-9]{1,4}(?:[.,][0-9]{2})?)\s*EUR)/i;
  const matchEur = text.match(eurRegex);
  if (matchEur) {
    const val = matchEur[1] || matchEur[2];
    return `~${val} €`;
  }

  return null;
}

export async function fetchPricePreview(url: string): Promise<PricePreviewResult> {
  let cleanUrl = url.trim();
  if (!cleanUrl) {
    return { priceText: null, storeName: null };
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const storeName = detectStoreName(cleanUrl);

  try {
    // Controller con timeout di 6 secondi per non bloccare mai la UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { priceText: null, storeName };
    }

    const json = await response.json();
    const data = json?.data;

    // 1. Controlla se l'API ha identificato esplicitamente un campo price
    if (data?.price) {
      if (typeof data.price === 'string') {
        const extracted = extractPriceFromText(data.price) || `${data.price} €`;
        return { priceText: extracted, storeName: data.publisher || storeName };
      }
      if (typeof data.price === 'number') {
        return { priceText: `${data.price.toFixed(2)} €`, storeName: data.publisher || storeName };
      }
      if (data.price?.amount) {
        return { priceText: `${data.price.amount} €`, storeName: data.publisher || storeName };
      }
    }

    // 2. Cerca nel description o nel title del prodotto (molti store mettono il prezzo nel meta tag description o titolo)
    const descPrice = extractPriceFromText(data?.description || '');
    if (descPrice) {
      return { priceText: descPrice, storeName: data?.publisher || storeName };
    }

    const titlePrice = extractPriceFromText(data?.title || '');
    if (titlePrice) {
      return { priceText: titlePrice, storeName: data?.publisher || storeName };
    }

    return { priceText: null, storeName: data?.publisher || storeName };
  } catch {
    // In caso di errore o timeout, non rompe nulla
    return { priceText: null, storeName };
  }
}
