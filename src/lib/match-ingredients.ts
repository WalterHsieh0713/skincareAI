import { INGREDIENTS, type Ingredient } from '@/constants/ingredients';

/**
 * Normalize raw label text (or an OCR result) for matching:
 * lowercase, drop punctuation that OCR scatters, collapse whitespace.
 * Hyphens and spaces are kept because many INCI names rely on them.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word (boundary-aware) containment so "aloe" doesn't match "aloesomething". */
function containsAlias(haystack: string, alias: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
  return pattern.test(haystack);
}

const CATEGORY_ORDER = [
  'AHA',
  'BHA',
  'PHA',
  'Antimicrobial',
  'Retinoid',
  'Vitamin C',
  'Vitamin',
  'Antioxidant',
  'Brightening',
  'Peptide',
  'Ceramide',
  'Humectant',
  'Soothing',
  'Amino Acid',
  'Emollient',
  'Occlusive',
  'UV Filter',
  'Surfactant',
  'Emulsifier',
  'Preservative',
  'pH Adjuster',
  'Fragrance',
  'Solvent',
];

/**
 * Scan label text and return the ingredients we recognize.
 * Key actives are surfaced first; base/support ingredients follow.
 */
export function matchIngredients(rawText: string): Ingredient[] {
  const text = normalize(rawText);
  if (!text) {
    return [];
  }

  const categoryMatch = CATEGORY_ORDER.find((category) => normalize(category) === text);
  if (categoryMatch) {
    return INGREDIENTS.filter((ingredient) => ingredient.category === categoryMatch).sort(
      (a, b) => (a.active === b.active ? a.name.localeCompare(b.name) : a.active ? -1 : 1),
    );
  }

  const matched = INGREDIENTS.filter((ingredient) =>
    ingredient.aliases.some((alias) => containsAlias(text, normalize(alias))),
  );

  return matched.sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  });
}
