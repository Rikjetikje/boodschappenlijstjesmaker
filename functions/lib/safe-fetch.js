'use strict';

const dns = require('node:dns').promises;
const net = require('node:net');

const MAX_HTML_BYTES = 2 * 1024 * 1024;

function isPrivateIpv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19));
}

function isPrivateIp(address) {
  const normalized = String(address || '').toLowerCase().split('%')[0];
  if (net.isIP(normalized) === 4) return isPrivateIpv4(normalized);
  if (net.isIP(normalized) !== 6) return true;
  if (normalized.startsWith('::ffff:')) return isPrivateIpv4(normalized.slice(7));
  return normalized === '::' || normalized === '::1'
    || normalized.startsWith('fc') || normalized.startsWith('fd')
    || /^fe[89ab]/.test(normalized);
}

async function assertSafeUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('invalid-url');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('invalid-url');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('invalid-url');
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')
    || hostname.endsWith('.local') || hostname.endsWith('.internal')
    || hostname === 'metadata.google.internal') {
    throw new Error('unsafe-url');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('unsafe-url');
    return url;
  }
  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(result => isPrivateIp(result.address))) throw new Error('unsafe-url');
  return url;
}

async function readLimitedText(response) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES) throw new Error('page-too-large');
  if (!response.body) return '';
  const chunks = [];
  let total = 0;
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error('page-too-large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(chunk => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return new TextDecoder().decode(bytes);
}

async function fetchRecipePage(value) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let currentUrl = value;
  try {
    for (let redirect = 0; redirect <= 4; redirect += 1) {
      const safeUrl = await assertSafeUrl(currentUrl);
      const response = await fetch(safeUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'nl-NL,nl;q=0.9,en;q=0.7',
          'user-agent': 'Boodschappenlijstjesmaker/1.0 (recipe importer)',
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) throw new Error('fetch-failed');
        currentUrl = new URL(location, safeUrl).href;
        continue;
      }
      if (!response.ok) throw new Error(response.status === 404 ? 'not-found' : 'fetch-failed');
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error('not-html');
      }
      return { html: await readLimitedText(response), finalUrl: safeUrl.href };
    }
    throw new Error('too-many-redirects');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { assertSafeUrl, fetchRecipePage, isPrivateIp };
