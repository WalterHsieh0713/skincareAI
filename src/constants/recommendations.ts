/**
 * Post-scan ingredient + product-type suggestions, mapped from each score
 * axis (Feature 2) back into brand-neutral education (Feature 4's INCI data).
 *
 * This is deliberately generic: *ingredients* and *product categories* only —
 * never a brand, a specific product, or a "this will fix it" claim. It's the
 * same educational posture as `constants/ingredients.ts`.
 *
 * `ingredientNames` must match an `Ingredient.name` in `constants/ingredients`
 * exactly so the UI can cross-link into the full ingredient education (name,
 * function, concerns). `productTypeKeys` are i18n keys under
 * `recommendations.productType.*` in the catalogs.
 */

import type { SkinScores } from '@/lib/scan-types';

/** The four trackable score axes (excludes `overall`). */
export type SkinAxis = Exclude<keyof SkinScores, 'overall'>;

export type AxisRecommendationDef = {
  ingredientNames: string[];
  productTypeKeys: string[];
};

/**
 * Axes score 0–100 where higher = better (see `scan-types.ts`). A score below
 * this is treated as "elevated" for that concern and surfaces suggestions.
 * Above it, no recommendation is shown for that axis.
 */
export const RECOMMENDATION_THRESHOLD = 70;

export const AXIS_RECOMMENDATIONS: Record<SkinAxis, AxisRecommendationDef> = {
  redness: {
    ingredientNames: ['Centella Asiatica (Cica)', 'Azelaic Acid', 'Niacinamide', 'Allantoin'],
    productTypeKeys: ['fragranceFreeMoisturizer', 'gentleCleanser', 'soothingSerum'],
  },
  texture: {
    ingredientNames: ['Glycolic Acid', 'Lactic Acid', 'Retinol', 'Granactive Retinoid'],
    productTypeKeys: ['ahaExfoliant', 'retinoidSerum'],
  },
  blemishes: {
    ingredientNames: ['Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide', 'Azelaic Acid'],
    productTypeKeys: ['bhaCleanser', 'nonComedogenicMoisturizer', 'spotTreatment'],
  },
  hydration: {
    ingredientNames: ['Hyaluronic Acid', 'Glycerin', 'Ceramides', 'Squalane'],
    productTypeKeys: ['hydratingSerum', 'ceramideMoisturizer', 'humectantToner'],
  },
};

/** Display order, matching `SkinScoreView`'s axis bars. */
export const AXIS_ORDER: SkinAxis[] = ['redness', 'texture', 'blemishes', 'hydration'];
