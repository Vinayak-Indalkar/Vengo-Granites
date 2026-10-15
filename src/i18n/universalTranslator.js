import { translations, translate } from './translations';

// WeakMaps to store original English text so switching back and forth is 100% lossless
const nodeOriginalMap = new WeakMap();
const placeholderOriginalMap = new WeakMap();
const titleOriginalMap = new WeakMap();

/**
 * Checks whether text is purely dynamic numeric/data (e.g., timestamps, monetary sums, pure IDs)
 */
function isDynamicData(str) {
  const trimmed = str.trim();
  if (!trimmed) return true;
  // Pure digits or currency or dates or technical codes
  if (/^[\d,.\-–—/:#₹$%+*()]+$/.test(trimmed)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return true; // Date ISO
  if (/^[A-Z]{2,4}-\d{3,6}$/.test(trimmed)) return true; // e.g. SUP-0001, BLK-2024
  return false;
}

/**
 * Get translated text with pattern decomposition if exact match is not found
 */
export function getTranslatedString(str, language) {
  if (!str || typeof str !== 'string' || language === 'English') {
    return str;
  }

  const leading = str.match(/^\s*/)[0];
  const trailing = str.match(/\s*$/)[0];
  const trimmed = str.trim();

  if (isDynamicData(trimmed)) {
    return str;
  }

  const dict = translations[language];
  if (!dict) return str;

  // 1. Direct exact dictionary match
  if (dict[trimmed]) {
    return leading + dict[trimmed] + trailing;
  }

  // 2. Case-insensitive lookup
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(dict)) {
    if (k.toLowerCase() === lowerTrimmed) {
      return leading + v + trailing;
    }
  }

  // 3. Numbered section titles (e.g., "1. Profile & Registration Details")
  const numberedMatch = trimmed.match(/^(\d+\.\s*)(.+)$/);
  if (numberedMatch) {
    const prefix = numberedMatch[1];
    const subText = numberedMatch[2].trim();
    if (dict[subText]) {
      return leading + prefix + dict[subText] + trailing;
    }
  }

  // 4. "Search [Entity]..." patterns (e.g. "Search Suppliers / Quarries...")
  const searchMatch = trimmed.match(/^Search\s+(.+)\.{2,3}$/i);
  if (searchMatch) {
    const searchTarget = searchMatch[1].trim();
    const translatedTarget = dict[searchTarget] || searchTarget;
    const searchWord = dict['Search'] || 'Search';
    return leading + `${searchWord} ${translatedTarget}...` + trailing;
  }

  // 5. "Add [Entity]" patterns
  const addMatch = trimmed.match(/^Add\s+(.+)$/i);
  if (addMatch) {
    const addTarget = addMatch[1].trim();
    const translatedTarget = dict[addTarget] || addTarget;
    const addWord = dict['Add'] || 'Add';
    return leading + (language === 'Hindi' ? `${translatedTarget} ${addWord}` : `${addWord} ${translatedTarget}`) + trailing;
  }

  // 6. "Edit [Entity]" patterns
  const editMatch = trimmed.match(/^Edit\s+(.+)$/i);
  if (editMatch) {
    const editTarget = editMatch[1].trim();
    const translatedTarget = dict[editTarget] || editTarget;
    const editWord = dict['Edit'] || 'Edit';
    return leading + (language === 'Hindi' ? `${translatedTarget} ${editWord}` : `${editWord} ${translatedTarget}`) + trailing;
  }

  // 7. Check if string contains bullet or separator (e.g. "Suppliers / Quarries")
  if (trimmed.includes(' / ')) {
    const parts = trimmed.split(' / ');
    const translatedParts = parts.map(p => dict[p.trim()] || p);
    if (translatedParts.some((p, idx) => p !== parts[idx])) {
      return leading + translatedParts.join(' / ') + trailing;
    }
  }

  return str;
}

// Elements that should never be translated
const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH']);

/**
 * Traverses DOM and translates visible text nodes and form attributes
 */
export function applyTranslationToDOM(root = document.body, language = 'English') {
  if (!root || !language) return;

  try {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node || !node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (EXCLUDED_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          try {
            if (parent.closest && parent.closest('.notranslate, svg, code, pre')) return NodeFilter.FILTER_REJECT;
          } catch {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      try {
        if (!nodeOriginalMap.has(currentNode)) {
          if (language === 'English') continue;
          nodeOriginalMap.set(currentNode, currentNode.nodeValue);
        }

        const original = nodeOriginalMap.get(currentNode);
        if (language === 'English') {
          if (original && currentNode.nodeValue !== original) {
            currentNode.nodeValue = original;
          }
        } else if (original) {
          const translated = getTranslatedString(original, language);
          if (currentNode.nodeValue !== translated) {
            currentNode.nodeValue = translated;
          }
        }
      } catch {
        // Silently skip if node was unmounted during walk
      }
    }

    // Translate input placeholders
    const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
      try {
        if (!placeholderOriginalMap.has(input)) {
          if (language === 'English') return;
          placeholderOriginalMap.set(input, input.getAttribute('placeholder') || '');
        }
        const origPlaceholder = placeholderOriginalMap.get(input);
        if (origPlaceholder) {
          if (language === 'English') {
            if (input.getAttribute('placeholder') !== origPlaceholder) {
              input.setAttribute('placeholder', origPlaceholder);
            }
          } else {
            const translatedPlaceholder = getTranslatedString(origPlaceholder, language);
            if (input.getAttribute('placeholder') !== translatedPlaceholder) {
              input.setAttribute('placeholder', translatedPlaceholder);
            }
          }
        }
      } catch {}
    });

    // Translate titles / tooltips
    const elementsWithTitle = root.querySelectorAll('[title]');
    elementsWithTitle.forEach(el => {
      try {
        if (!titleOriginalMap.has(el)) {
          if (language === 'English') return;
          titleOriginalMap.set(el, el.getAttribute('title') || '');
        }
        const origTitle = titleOriginalMap.get(el);
        if (origTitle) {
          if (language === 'English') {
            if (el.getAttribute('title') !== origTitle) {
              el.setAttribute('title', origTitle);
            }
          } else {
            const translatedTitle = getTranslatedString(origTitle, language);
            if (el.getAttribute('title') !== translatedTitle) {
              el.setAttribute('title', translatedTitle);
            }
          }
        }
      } catch {}
    });
  } catch (err) {
    console.warn('applyTranslationToDOM non-fatal error:', err);
  }
}

