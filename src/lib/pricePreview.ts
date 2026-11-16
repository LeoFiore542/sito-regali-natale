/**
 * Helper per estrarre la preview del costo dell'oggetto dal link di acquisto.
 */

export interface PricePreviewResult {
  priceText: string | null;
  storeName: string | null;
}

// Riconosce i negozi più popolari (inclusi short link Amazon da smartphone)
export function detectStoreName(url: string): string | null {
  try {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    const hostname = new URL(normalized).hostname.toLowerCase();
    if (hostname.includes('amazon') || hostname.includes('amzn.')) return 'Amazon';
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

// Cerca prezzi con pattern valuta EUR (€) nel testo (inclusi separatori migliaia)
function extractPriceFromText(text: string): string | null {
  if (!text) return null;

  // Pattern es: € 29,99 | 29,99 € | 1.299,00 € | 120€
  const euroRegex =
    /(?:€\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,5}(?:[.,][0-9]{1,2})?))|(?:([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,5}(?:[.,][0-9]{1,2})?)\s*€)/i;
  const match = text.match(euroRegex);
  if (match) {
    const numeric = (match[1] || match[2] || '').trim();
    if (numeric) return `${numeric} €`;
  }

  // Pattern es: 29.99 EUR o EUR 29.99
  const eurRegex =
    /(?:EUR\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,5}(?:[.,][0-9]{1,2})?))|(?:([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{1,5}(?:[.,][0-9]{1,2})?)\s*EUR)/i;
  const matchEur = text.match(eurRegex);
  if (matchEur) {
    const val = (matchEur[1] || matchEur[2] || '').trim();
    if (val) return `${val} €`;
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
    // Controller con timeout di 9 secondi per gestire anche redirect (es. amzn.eu)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    // Richiediamo a Microlink anche i selettori prezzo tipici di Amazon (.a-price .a-offscreen)
    const params = new URLSearchParams({
      url: cleanUrl,
      meta: 'true',
      'data.amazonPrice.selector': '.a-price .a-offscreen',
      'data.amazonWhole.selector': '.a-price-whole',
    });

    const apiUrl = `https://api.microlink.io?${params.toString()}`;
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

    // 1. Controlla il selettore specifico Amazon (se presente)
    if (typeof data?.amazonPrice === 'string' && data.amazonPrice.trim()) {
      const extracted = extractPriceFromText(data.amazonPrice);
      if (extracted) {
        return { priceText: extracted, storeName: storeName || data?.publisher || null };
      }
    }

    // 2. Controlla se Microlink ha identificato esplicitamente un campo price
    if (data?.price) {
      if (typeof data.price === 'string') {
        const extracted = extractPriceFromText(data.price) || `${data.price} €`;
        return { priceText: extracted, storeName: storeName || data.publisher || null };
      }
      if (typeof data.price === 'number') {
        return {
          priceText: `${data.price.toFixed(2).replace('.', ',')} €`,
          storeName: storeName || data.publisher || null,
        };
      }
      if (data.price?.amount) {
        return {
          priceText: `${data.price.amount} €`,
          storeName: storeName || data.publisher || null,
        };
      }
    }

    // 3. Fallback su parte intera prezzo Amazon
    if (typeof data?.amazonWhole === 'string' && /^[0-9.,]+$/.test(data.amazonWhole.trim())) {
      const cleanWhole = data.amazonWhole.trim().replace(/[.,]$/, '');
      if (cleanWhole) {
        return { priceText: `${cleanWhole} €`, storeName: storeName || data?.publisher || null };
      }
    }

    // 4. Cerca nel description o nel title del prodotto
    const descPrice = extractPriceFromText(data?.description || '');
    if (descPrice) {
      return { priceText: descPrice, storeName: storeName || data?.publisher || null };
    }

    const titlePrice = extractPriceFromText(data?.title || '');
    if (titlePrice) {
      return { priceText: titlePrice, storeName: storeName || data?.publisher || null };
    }

    return { priceText: null, storeName: storeName || data?.publisher || null };
  } catch {
    // In caso di errore, blocco anti-bot (es. Amazon) o timeout, non rompe nulla
    return { priceText: null, storeName };
  }
}
