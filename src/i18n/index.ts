import { de } from '@/i18n/catalogs/de';
import { en } from '@/i18n/catalogs/en';
import { es } from '@/i18n/catalogs/es';
import { fr } from '@/i18n/catalogs/fr';
import { it } from '@/i18n/catalogs/it';
import { ja } from '@/i18n/catalogs/ja';
import { ko } from '@/i18n/catalogs/ko';
import { ptBR } from '@/i18n/catalogs/pt-BR';
import { zhHans } from '@/i18n/catalogs/zh-Hans';
import type { Messages, TParams } from '@/i18n/types';

/**
 * Translation registry. English is the source of truth and the ultimate
 * fallback; every other catalog may be partial — missing keys resolve up the
 * fallback chain to English. Tags not listed here fall back to English too,
 * which is the standard behaviour for the ~50 picker languages we don't ship a
 * full catalog for yet.
 */
const CATALOGS: Record<string, Messages> = {
  en,
  es,
  fr,
  de,
  it,
  ja,
  ko,
  'pt-BR': ptBR,
  'pt-PT': ptBR,
  'zh-Hans': zhHans,
  'zh-Hant': zhHans,
};

/** Tags with a full (non-English) catalog — used to label the picker. */
export const LOCALIZED_TAGS = new Set([
  'en',
  'es',
  'fr',
  'de',
  'it',
  'ja',
  'ko',
  'pt-BR',
  'pt-PT',
  'zh-Hans',
  'zh-Hant',
]);

/** Ordered catalogs to try for a tag: exact → base language → English. */
function catalogsFor(tag: string): Messages[] {
  const chain: Messages[] = [];
  if (CATALOGS[tag]) chain.push(CATALOGS[tag]);
  const base = tag.split('-')[0];
  if (base !== tag && CATALOGS[base]) chain.push(CATALOGS[base]);
  chain.push(en);
  return chain;
}

function lookup(catalog: Messages, path: string[]): string | undefined {
  let node: string | Messages = catalog;
  for (const segment of path) {
    if (typeof node !== 'object' || node[segment] === undefined) {
      return undefined;
    }
    node = node[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(message: string, params?: TParams): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (whole, key) =>
    params[key] === undefined ? whole : String(params[key]),
  );
}

/**
 * Resolve a dotted message key for a language, falling back through the chain
 * to English. Returns the key itself if nothing matches (visible-but-safe).
 */
export function translate(tag: string, key: string, params?: TParams): string {
  const path = key.split('.');
  for (const catalog of catalogsFor(tag)) {
    const message = lookup(catalog, path);
    if (message !== undefined) {
      return interpolate(message, params);
    }
  }
  return key;
}
