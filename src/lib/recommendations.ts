import { INGREDIENTS, type Ingredient } from '@/constants/ingredients';
import {
  AXIS_ORDER,
  AXIS_RECOMMENDATIONS,
  RECOMMENDATION_THRESHOLD,
  type SkinAxis,
} from '@/constants/recommendations';
import type { SkinScores } from '@/lib/scan-types';

export type AxisRecommendationResult = {
  axis: SkinAxis;
  score: number;
  ingredients: Ingredient[];
  productTypeKeys: string[];
};

function resolveIngredients(names: string[]): Ingredient[] {
  return names
    .map((name) => INGREDIENTS.find((ingredient) => ingredient.name === name))
    .filter((ingredient): ingredient is Ingredient => ingredient !== undefined);
}

/**
 * Build per-axis ingredient / product-type suggestions for a scan's scores.
 * Only axes below `RECOMMENDATION_THRESHOLD` are surfaced, worst first — an
 * empty result means everything looked good, and the UI should show a
 * positive "keep it up" state instead of forcing a recommendation.
 *
 * Purely educational: these are image-derived indicators paired with general
 * ingredient education, never a diagnosis or a personalized product verdict.
 */
export function getSkinRecommendations(scores: SkinScores): AxisRecommendationResult[] {
  return AXIS_ORDER.filter((axis) => scores[axis] < RECOMMENDATION_THRESHOLD)
    .map((axis) => {
      const def = AXIS_RECOMMENDATIONS[axis];
      return {
        axis,
        score: scores[axis],
        ingredients: resolveIngredients(def.ingredientNames),
        productTypeKeys: def.productTypeKeys,
      };
    })
    .sort((a, b) => a.score - b.score);
}
