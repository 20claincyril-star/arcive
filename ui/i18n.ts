import fr from './locales/fr.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };

export type Lang = 'fr' | 'en' | 'es';

export const STORAGE_KEY = 'arcive_lang';

interface MessageTree {
  [key: string]: string | MessageTree;
}

const bundles: Record<Lang, MessageTree> = {
  fr: fr as MessageTree,
  en: en as MessageTree,
  es: es as MessageTree
};

let currentLang: Lang = 'fr';
let messages: MessageTree = bundles.fr;

function resolveKey(tree: MessageTree, key: string): string | undefined {
  const parts = key.split('.');
  let node: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (!node || typeof node === 'string') {
      return undefined;
    }
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(
  text: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) {
    return text;
  }
  let out = text;
  for (const [name, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
  }
  return out;
}

export function loadLanguage(lang: Lang): void {
  currentLang = lang;
  messages = bundles[lang] ?? bundles.fr;
  document.documentElement.lang = lang;
}

export function getText(
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw = resolveKey(messages, key) ?? key;
  return interpolate(raw, vars);
}

export const t = getText;

export function saveLanguage(lang: Lang): void {
  window.localStorage.setItem(STORAGE_KEY, lang);
  loadLanguage(lang);
}

export function detectLanguage(): Lang {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'fr' || stored === 'en' || stored === 'es') {
    return stored;
  }
  const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  if (nav === 'en') return 'en';
  if (nav === 'es') return 'es';
  return 'fr';
}

export function applyI18n(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = getText(key);
    }
  });
  root.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = getText(key);
    }
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.title = getText(key);
    }
  });
}

export function initI18n(onLangChange?: (lang: Lang) => void): void {
  const lang = detectLanguage();
  loadLanguage(lang);

  const select = document.getElementById('langSelect') as HTMLSelectElement | null;
  if (select) {
    select.value = lang;
    select.addEventListener('change', () => {
      const next = select.value as Lang;
      if (next !== 'fr' && next !== 'en' && next !== 'es') {
        return;
      }
      saveLanguage(next);
      applyI18n();
      onLangChange?.(next);
    });
  }

  applyI18n();
}
