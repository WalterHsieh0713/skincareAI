/**
 * Curated skincare ingredient knowledge base for Feature 4 (ingredient audit).
 *
 * This is brand-neutral ingredient *education* — what an ingredient generally
 * does — never a personalized "this product works for you" verdict.
 *
 * `aliases` are lowercase match terms (INCI names + common synonyms) used to
 * spot the ingredient in OCR'd label text. `active` marks the "key actives"
 * users care about, versus solvents/preservatives/base ingredients.
 */

export type IngredientCategory =
  | 'AHA'
  | 'BHA'
  | 'PHA'
  | 'Retinoid'
  | 'Vitamin C'
  | 'Vitamin'
  | 'Antioxidant'
  | 'Brightening'
  | 'Humectant'
  | 'Emollient'
  | 'Occlusive'
  | 'Ceramide'
  | 'Peptide'
  | 'Amino Acid'
  | 'Soothing'
  | 'UV Filter'
  | 'Preservative'
  | 'Surfactant'
  | 'Emulsifier'
  | 'pH Adjuster'
  | 'Fragrance'
  | 'Solvent';

export type Ingredient = {
  /** Display name. */
  name: string;
  /** Lowercase synonyms (INCI + common) used to detect this in label text. */
  aliases: string[];
  category: IngredientCategory;
  /** One-line, plain-language description of what it generally does. */
  function: string;
  /** True for the headline actives users track; false for base/support roles. */
  active: boolean;
  /** Optional caution flag (irritant, photosensitizing, etc.). */
  concern?: string;
};

export const INGREDIENTS: Ingredient[] = [
  // ── Exfoliating acids: AHA ────────────────────────────────────────────────
  {
    name: 'Glycolic Acid',
    aliases: ['glycolic acid', 'glycolic'],
    category: 'AHA',
    function: 'Smallest AHA — exfoliates the surface to smooth texture and brighten tone.',
    active: true,
    concern: 'Can increase sun sensitivity; pairs harshly with retinoids.',
  },
  {
    name: 'Lactic Acid',
    aliases: ['lactic acid', 'lactic'],
    category: 'AHA',
    function: 'Gentle AHA that exfoliates while also acting as a humectant.',
    active: true,
    concern: 'Mildly photosensitizing.',
  },
  {
    name: 'Mandelic Acid',
    aliases: ['mandelic acid', 'mandelic'],
    category: 'AHA',
    function: 'Large, slow AHA — gentle exfoliation suited to sensitive or acne-prone skin.',
    active: true,
  },
  {
    name: 'Malic Acid',
    aliases: ['malic acid'],
    category: 'AHA',
    function: 'Mild AHA, usually a supporting exfoliant in acid blends.',
    active: true,
  },
  {
    name: 'Tartaric Acid',
    aliases: ['tartaric acid'],
    category: 'AHA',
    function: 'AHA and pH buffer, often paired with stronger acids.',
    active: true,
  },
  {
    name: 'Citric Acid',
    aliases: ['citric acid'],
    category: 'AHA',
    function: 'Mild AHA, but most often used in tiny amounts to adjust pH.',
    active: false,
  },

  // ── Exfoliating acids: BHA ────────────────────────────────────────────────
  {
    name: 'Salicylic Acid',
    aliases: ['salicylic acid', 'salicylic', 'bha', 'beta hydroxy acid'],
    category: 'BHA',
    function: 'Oil-soluble BHA that exfoliates inside pores — clears blackheads and breakouts.',
    active: true,
    concern: 'Drying at high strength.',
  },
  {
    name: 'Betaine Salicylate',
    aliases: ['betaine salicylate'],
    category: 'BHA',
    function: 'Gentler BHA alternative for pore exfoliation.',
    active: true,
  },

  // ── Exfoliating acids: PHA ────────────────────────────────────────────────
  {
    name: 'Gluconolactone',
    aliases: ['gluconolactone'],
    category: 'PHA',
    function: 'Large polyhydroxy acid — gentle exfoliation plus antioxidant and hydrating effects.',
    active: true,
  },
  {
    name: 'Lactobionic Acid',
    aliases: ['lactobionic acid'],
    category: 'PHA',
    function: 'Gentle PHA that exfoliates while attracting moisture.',
    active: true,
  },

  // ── Other functional acids ────────────────────────────────────────────────
  {
    name: 'Azelaic Acid',
    aliases: ['azelaic acid', 'azelaic'],
    category: 'Brightening',
    function: 'Calms redness, fades post-acne marks, and helps with breakouts.',
    active: true,
  },
  {
    name: 'Tranexamic Acid',
    aliases: ['tranexamic acid', 'tranexamic'],
    category: 'Brightening',
    function: 'Targets stubborn discoloration and melasma-type pigmentation.',
    active: true,
  },
  {
    name: 'Kojic Acid',
    aliases: ['kojic acid', 'kojic'],
    category: 'Brightening',
    function: 'Inhibits melanin to brighten dark spots.',
    active: true,
  },
  {
    name: 'Ferulic Acid',
    aliases: ['ferulic acid', 'ferulic'],
    category: 'Antioxidant',
    function: 'Antioxidant that stabilizes and boosts vitamins C and E.',
    active: true,
  },
  {
    name: 'Hyaluronic Acid',
    aliases: ['hyaluronic acid', 'sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'hyaluronate'],
    category: 'Humectant',
    function: 'Holds water in the skin for plumping, surface hydration.',
    active: true,
  },
  {
    name: 'Polyglutamic Acid',
    aliases: ['polyglutamic acid', 'sodium polyglutamate'],
    category: 'Humectant',
    function: 'Powerful humectant that forms a hydrating film on the surface.',
    active: true,
  },

  // ── Retinoids ─────────────────────────────────────────────────────────────
  {
    name: 'Retinol',
    aliases: ['retinol'],
    category: 'Retinoid',
    function: 'Vitamin A derivative — boosts cell turnover for texture, lines, and breakouts.',
    active: true,
    concern: 'Irritating when starting; avoid with AHA/BHA on the same night.',
  },
  {
    name: 'Retinal',
    aliases: ['retinal', 'retinaldehyde'],
    category: 'Retinoid',
    function: 'A stronger, faster-acting retinoid than retinol.',
    active: true,
    concern: 'Can irritate sensitive skin.',
  },
  {
    name: 'Retinyl Palmitate',
    aliases: ['retinyl palmitate'],
    category: 'Retinoid',
    function: 'Mild, gentle retinoid ester — slow but low-irritation.',
    active: true,
  },
  {
    name: 'Granactive Retinoid',
    aliases: ['hydroxypinacolone retinoate', 'granactive retinoid'],
    category: 'Retinoid',
    function: 'Next-gen retinoid that targets receptors with less irritation.',
    active: true,
  },
  {
    name: 'Adapalene',
    aliases: ['adapalene'],
    category: 'Retinoid',
    function: 'OTC prescription-strength retinoid for acne.',
    active: true,
    concern: 'Drying; introduce slowly.',
  },
  {
    name: 'Bakuchiol',
    aliases: ['bakuchiol'],
    category: 'Retinoid',
    function: 'Plant-derived retinol alternative — smoothing with less irritation.',
    active: true,
  },

  // ── Vitamin C and derivatives ─────────────────────────────────────────────
  {
    name: 'Vitamin C (L-Ascorbic Acid)',
    aliases: ['ascorbic acid', 'l-ascorbic acid', 'vitamin c'],
    category: 'Vitamin C',
    function: 'Antioxidant that brightens, evens tone, and supports collagen.',
    active: true,
    concern: 'Unstable; can sting on sensitive skin.',
  },
  {
    name: 'Sodium Ascorbyl Phosphate',
    aliases: ['sodium ascorbyl phosphate'],
    category: 'Vitamin C',
    function: 'Stable vitamin C derivative — gentler brightening, also helps acne.',
    active: true,
  },
  {
    name: 'Magnesium Ascorbyl Phosphate',
    aliases: ['magnesium ascorbyl phosphate'],
    category: 'Vitamin C',
    function: 'Stable, gentle vitamin C derivative for brightening and hydration.',
    active: true,
  },
  {
    name: 'Tetrahexyldecyl Ascorbate',
    aliases: ['tetrahexyldecyl ascorbate', 'ascorbyl tetraisopalmitate'],
    category: 'Vitamin C',
    function: 'Oil-soluble, stable vitamin C that penetrates well.',
    active: true,
  },
  {
    name: 'Ethyl Ascorbic Acid',
    aliases: ['ethyl ascorbic acid', '3-o-ethyl ascorbic acid'],
    category: 'Vitamin C',
    function: 'Stable vitamin C derivative for brightening.',
    active: true,
  },
  {
    name: 'Ascorbyl Glucoside',
    aliases: ['ascorbyl glucoside'],
    category: 'Vitamin C',
    function: 'Slow-release, stable vitamin C derivative.',
    active: true,
  },

  // ── Other vitamins ────────────────────────────────────────────────────────
  {
    name: 'Niacinamide',
    aliases: ['niacinamide', 'nicotinamide', 'vitamin b3'],
    category: 'Vitamin',
    function: 'Multitasker — strengthens the barrier, calms redness, regulates oil, evens tone.',
    active: true,
  },
  {
    name: 'Panthenol',
    aliases: ['panthenol', 'pro-vitamin b5', 'provitamin b5', 'd-panthenol'],
    category: 'Vitamin',
    function: 'Soothes and hydrates while supporting barrier repair.',
    active: true,
  },
  {
    name: 'Tocopherol (Vitamin E)',
    aliases: ['tocopherol', 'tocopheryl acetate', 'vitamin e'],
    category: 'Antioxidant',
    function: 'Antioxidant that protects oils from oxidation and conditions skin.',
    active: true,
  },

  // ── Antioxidants and extracts ─────────────────────────────────────────────
  {
    name: 'Resveratrol',
    aliases: ['resveratrol'],
    category: 'Antioxidant',
    function: 'Potent plant antioxidant for environmental defense.',
    active: true,
  },
  {
    name: 'Coenzyme Q10',
    aliases: ['ubiquinone', 'coenzyme q10', 'coq10'],
    category: 'Antioxidant',
    function: 'Antioxidant that supports energy and defends against damage.',
    active: true,
  },
  {
    name: 'Green Tea Extract',
    aliases: ['camellia sinensis', 'green tea', 'egcg'],
    category: 'Antioxidant',
    function: 'Antioxidant and soothing polyphenols that calm and protect.',
    active: true,
  },
  {
    name: 'Alpha Arbutin',
    aliases: ['alpha arbutin', 'arbutin'],
    category: 'Brightening',
    function: 'Gentle, targeted brightener for dark spots.',
    active: true,
  },
  {
    name: 'Licorice Root Extract',
    aliases: ['glycyrrhiza glabra', 'licorice', 'liquorice', 'dipotassium glycyrrhizate'],
    category: 'Brightening',
    function: 'Brightens and soothes redness and irritation.',
    active: true,
  },

  // ── Peptides ──────────────────────────────────────────────────────────────
  {
    name: 'Matrixyl (Palmitoyl Pentapeptide)',
    aliases: ['palmitoyl pentapeptide-4', 'palmitoyl oligopeptide', 'matrixyl'],
    category: 'Peptide',
    function: 'Signal peptide that supports collagen for firmness and lines.',
    active: true,
  },
  {
    name: 'Copper Peptide (GHK-Cu)',
    aliases: ['copper tripeptide-1', 'ghk-cu', 'copper peptide'],
    category: 'Peptide',
    function: 'Supports repair, firmness, and a healthy barrier.',
    active: true,
  },
  {
    name: 'Argireline (Acetyl Hexapeptide-8)',
    aliases: ['acetyl hexapeptide-8', 'acetyl hexapeptide-3', 'argireline'],
    category: 'Peptide',
    function: 'Relaxes expression to soften the look of fine lines.',
    active: true,
  },

  // ── Amino acids ───────────────────────────────────────────────────────────
  {
    name: 'Arginine',
    aliases: ['arginine'],
    category: 'Amino Acid',
    function: 'Amino acid that hydrates and helps neutralize acids (pH balance).',
    active: false,
  },
  {
    name: 'Glycine',
    aliases: ['glycine'],
    category: 'Amino Acid',
    function: 'Amino acid building block supporting hydration and repair.',
    active: false,
  },
  {
    name: 'Proline',
    aliases: ['proline'],
    category: 'Amino Acid',
    function: 'Amino acid linked to collagen structure and hydration.',
    active: false,
  },
  {
    name: 'Serine',
    aliases: ['serine'],
    category: 'Amino Acid',
    function: 'Amino acid that is part of skin’s natural moisturizing factor.',
    active: false,
  },

  // ── Ceramides and barrier lipids ──────────────────────────────────────────
  {
    name: 'Ceramides',
    aliases: ['ceramide np', 'ceramide ap', 'ceramide eop', 'ceramide', 'ceramides'],
    category: 'Ceramide',
    function: 'Barrier lipids that seal in moisture and reinforce the skin barrier.',
    active: true,
  },
  {
    name: 'Cholesterol',
    aliases: ['cholesterol'],
    category: 'Ceramide',
    function: 'Barrier lipid that works with ceramides to restore the barrier.',
    active: false,
  },

  // ── Humectants ────────────────────────────────────────────────────────────
  {
    name: 'Glycerin',
    aliases: ['glycerin', 'glycerine', 'glycerol'],
    category: 'Humectant',
    function: 'Workhorse humectant — draws and holds water in the skin.',
    active: true,
  },
  {
    name: 'Urea',
    aliases: ['urea'],
    category: 'Humectant',
    function: 'Hydrates and, at higher strength, gently exfoliates.',
    active: true,
  },
  {
    name: 'Betaine',
    aliases: ['betaine'],
    category: 'Humectant',
    function: 'Gentle humectant that hydrates and soothes.',
    active: false,
  },
  {
    name: 'Sodium PCA',
    aliases: ['sodium pca'],
    category: 'Humectant',
    function: 'Natural moisturizing factor component that binds water.',
    active: false,
  },
  {
    name: 'Propanediol',
    aliases: ['propanediol', 'propylene glycol', 'butylene glycol'],
    category: 'Humectant',
    function: 'Humectant and solvent that boosts hydration and ingredient delivery.',
    active: false,
  },

  // ── Emollients and occlusives ─────────────────────────────────────────────
  {
    name: 'Squalane',
    aliases: ['squalane', 'squalene'],
    category: 'Emollient',
    function: 'Lightweight, skin-mimicking emollient that softens without heaviness.',
    active: true,
  },
  {
    name: 'Shea Butter',
    aliases: ['butyrospermum parkii', 'shea butter'],
    category: 'Emollient',
    function: 'Rich emollient that nourishes and softens dry skin.',
    active: false,
  },
  {
    name: 'Jojoba Oil',
    aliases: ['simmondsia chinensis', 'jojoba'],
    category: 'Emollient',
    function: 'Balancing, skin-like oil that conditions without clogging easily.',
    active: false,
  },
  {
    name: 'Dimethicone',
    aliases: ['dimethicone', 'cyclopentasiloxane', 'cyclomethicone'],
    category: 'Occlusive',
    function: 'Silicone that smooths the surface and reduces water loss.',
    active: false,
  },
  {
    name: 'Petrolatum',
    aliases: ['petrolatum', 'petroleum jelly', 'paraffinum liquidum'],
    category: 'Occlusive',
    function: 'Strong occlusive that seals the surface to prevent moisture loss.',
    active: false,
  },
  {
    name: 'Mineral Oil',
    aliases: ['mineral oil', 'paraffin oil'],
    category: 'Occlusive',
    function: 'Inert occlusive emollient that locks in moisture.',
    active: false,
  },

  // ── Soothing agents ───────────────────────────────────────────────────────
  {
    name: 'Centella Asiatica (Cica)',
    aliases: ['centella asiatica', 'cica', 'madecassoside', 'asiaticoside'],
    category: 'Soothing',
    function: 'Calms irritation and supports barrier recovery.',
    active: true,
  },
  {
    name: 'Allantoin',
    aliases: ['allantoin'],
    category: 'Soothing',
    function: 'Soothes and conditions to reduce the feel of irritation.',
    active: false,
  },
  {
    name: 'Bisabolol',
    aliases: ['bisabolol'],
    category: 'Soothing',
    function: 'Chamomile-derived calming agent for sensitive skin.',
    active: false,
  },
  {
    name: 'Colloidal Oatmeal',
    aliases: ['colloidal oatmeal', 'avena sativa', 'oat kernel'],
    category: 'Soothing',
    function: 'Soothes itch and irritation while supporting the barrier.',
    active: true,
  },
  {
    name: 'Aloe Vera',
    aliases: ['aloe barbadensis', 'aloe vera', 'aloe'],
    category: 'Soothing',
    function: 'Lightweight soothing and hydrating plant extract.',
    active: false,
  },

  // ── UV filters ────────────────────────────────────────────────────────────
  {
    name: 'Zinc Oxide',
    aliases: ['zinc oxide'],
    category: 'UV Filter',
    function: 'Mineral broad-spectrum UV filter that sits on the surface.',
    active: true,
  },
  {
    name: 'Titanium Dioxide',
    aliases: ['titanium dioxide'],
    category: 'UV Filter',
    function: 'Mineral UV filter, often paired with zinc oxide.',
    active: true,
  },
  {
    name: 'Avobenzone',
    aliases: ['avobenzone', 'butyl methoxydibenzoylmethane'],
    category: 'UV Filter',
    function: 'Chemical filter covering UVA rays.',
    active: true,
  },
  {
    name: 'Octinoxate',
    aliases: ['octinoxate', 'ethylhexyl methoxycinnamate'],
    category: 'UV Filter',
    function: 'Chemical UVB filter.',
    active: true,
  },
  {
    name: 'Tinosorb',
    aliases: ['bis-ethylhexyloxyphenol methoxyphenyl triazine', 'bemotrizinol', 'methylene bis-benzotriazolyl tetramethylbutylphenol'],
    category: 'UV Filter',
    function: 'Modern broad-spectrum, photostable UV filter.',
    active: true,
  },

  // ── Surfactants / cleansing ───────────────────────────────────────────────
  {
    name: 'Sodium Laureth Sulfate',
    aliases: ['sodium laureth sulfate', 'sles'],
    category: 'Surfactant',
    function: 'Foaming cleanser; milder than SLS but can strip if overused.',
    active: false,
    concern: 'Can be stripping on dry/sensitive skin.',
  },
  {
    name: 'Sodium Lauryl Sulfate',
    aliases: ['sodium lauryl sulfate', 'sls'],
    category: 'Surfactant',
    function: 'Strong foaming cleanser.',
    active: false,
    concern: 'Often irritating/stripping for facial skin.',
  },
  {
    name: 'Cocamidopropyl Betaine',
    aliases: ['cocamidopropyl betaine'],
    category: 'Surfactant',
    function: 'Mild, coconut-derived co-surfactant that softens harsher cleansers.',
    active: false,
  },
  {
    name: 'Coco-Glucoside',
    aliases: ['coco-glucoside', 'decyl glucoside', 'lauryl glucoside'],
    category: 'Surfactant',
    function: 'Gentle, sugar-derived cleansing surfactant.',
    active: false,
  },

  // ── Emulsifiers / texture ─────────────────────────────────────────────────
  {
    name: 'Cetearyl Alcohol',
    aliases: ['cetearyl alcohol', 'cetyl alcohol', 'stearyl alcohol'],
    category: 'Emulsifier',
    function: 'Fatty alcohol that thickens and softens (not drying like SD alcohol).',
    active: false,
  },
  {
    name: 'Glyceryl Stearate',
    aliases: ['glyceryl stearate', 'peg-100 stearate'],
    category: 'Emulsifier',
    function: 'Emulsifier that keeps oil and water phases blended.',
    active: false,
  },

  // ── pH adjusters ──────────────────────────────────────────────────────────
  {
    name: 'Sodium Hydroxide',
    aliases: ['sodium hydroxide'],
    category: 'pH Adjuster',
    function: 'Adjusts and buffers the product’s pH.',
    active: false,
  },

  // ── Preservatives ─────────────────────────────────────────────────────────
  {
    name: 'Phenoxyethanol',
    aliases: ['phenoxyethanol'],
    category: 'Preservative',
    function: 'Common preservative that keeps the product safe from microbes.',
    active: false,
  },
  {
    name: 'Ethylhexylglycerin',
    aliases: ['ethylhexylglycerin'],
    category: 'Preservative',
    function: 'Preservative booster and mild conditioning agent.',
    active: false,
  },
  {
    name: 'Parabens',
    aliases: ['methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben', 'paraben'],
    category: 'Preservative',
    function: 'Well-studied preservative family that prevents spoilage.',
    active: false,
  },
  {
    name: 'Potassium Sorbate',
    aliases: ['potassium sorbate', 'sodium benzoate', 'benzoic acid'],
    category: 'Preservative',
    function: 'Mild food-grade preservative system.',
    active: false,
  },

  // ── Fragrance / sensory (caution) ─────────────────────────────────────────
  {
    name: 'Fragrance',
    aliases: ['fragrance', 'parfum', 'aroma'],
    category: 'Fragrance',
    function: 'Adds scent; a leading cause of cosmetic irritation and allergy.',
    active: false,
    concern: 'Common irritant/allergen, especially on sensitive or compromised skin.',
  },
  {
    name: 'Essential Oils',
    aliases: ['essential oil', 'limonene', 'linalool', 'citral', 'geraniol', 'eugenol'],
    category: 'Fragrance',
    function: 'Naturally fragrant plant oils that still carry sensitizing potential.',
    active: false,
    concern: 'Fragrance allergens; can irritate reactive skin.',
  },
  {
    name: 'Denatured Alcohol',
    aliases: ['alcohol denat', 'denatured alcohol', 'sd alcohol', 'ethanol'],
    category: 'Solvent',
    function: 'Fast-drying solvent that gives a light feel but can dry skin out.',
    active: false,
    concern: 'Drying/irritating in high amounts (distinct from fatty alcohols).',
  },
  {
    name: 'Witch Hazel',
    aliases: ['hamamelis virginiana', 'witch hazel'],
    category: 'Soothing',
    function: 'Astringent extract; soothing but distillates can contain drying alcohol.',
    active: false,
    concern: 'Can be drying/sensitizing for some skin.',
  },

  // ── Base / solvent ────────────────────────────────────────────────────────
  {
    name: 'Water',
    aliases: ['aqua', 'water', 'eau'],
    category: 'Solvent',
    function: 'The base solvent in most formulas — usually the first ingredient.',
    active: false,
  },
];
