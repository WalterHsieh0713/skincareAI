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
  | 'Antimicrobial'
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
    function: 'Exfoliates skin to smooth texture and brighten tone',
    active: true,
    concern: 'Can increase sun sensitivity; pairs harshly with retinoids.',
  },
  {
    name: 'Lactic Acid',
    aliases: ['lactic acid', 'lactic'],
    category: 'AHA',
    function: 'Gently exfoliates while also hydrating skin',
    active: true,
    concern: 'Mildly photosensitizing.',
  },
  {
    name: 'Mandelic Acid',
    aliases: ['mandelic acid', 'mandelic'],
    category: 'AHA',
    function: 'Gently exfoliates — good for sensitive or acne-prone skin',
    active: true,
  },
  {
    name: 'Malic Acid',
    aliases: ['malic acid'],
    category: 'AHA',
    function: 'Mildly exfoliates, usually paired with other acids',
    active: true,
  },
  {
    name: 'Tartaric Acid',
    aliases: ['tartaric acid'],
    category: 'AHA',
    function: 'Exfoliates and balances pH in acid blends',
    active: true,
  },
  {
    name: 'Citric Acid',
    aliases: ['citric acid'],
    category: 'AHA',
    function: 'Mostly used in small amounts to balance pH',
    active: false,
  },

  // ── Exfoliating acids: BHA ────────────────────────────────────────────────
  {
    name: 'Salicylic Acid',
    aliases: ['salicylic acid', 'salicylic', 'bha', 'beta hydroxy acid'],
    category: 'BHA',
    function: 'Clears out pores to reduce blackheads and breakouts',
    active: true,
    concern: 'Drying at high strength.',
  },
  {
    name: 'Betaine Salicylate',
    aliases: ['betaine salicylate'],
    category: 'BHA',
    function: 'Gently exfoliates pores',
    active: true,
  },

  // ── Antimicrobial acne actives ────────────────────────────────────────────
  {
    name: 'Benzoyl Peroxide',
    aliases: ['benzoyl peroxide'],
    category: 'Antimicrobial',
    function: 'Kills acne-causing bacteria to clear breakouts',
    active: true,
    concern: 'Can bleach fabric/hair; drying — introduce slowly.',
  },

  // ── Exfoliating acids: PHA ────────────────────────────────────────────────
  {
    name: 'Gluconolactone',
    aliases: ['gluconolactone'],
    category: 'PHA',
    function: 'Gently exfoliates while hydrating and protecting skin',
    active: true,
  },
  {
    name: 'Lactobionic Acid',
    aliases: ['lactobionic acid'],
    category: 'PHA',
    function: 'Gently exfoliates while drawing in moisture',
    active: true,
  },

  // ── Other functional acids ────────────────────────────────────────────────
  {
    name: 'Azelaic Acid',
    aliases: ['azelaic acid', 'azelaic'],
    category: 'Brightening',
    function: 'Calms redness, fades acne marks, and clears breakouts',
    active: true,
  },
  {
    name: 'Tranexamic Acid',
    aliases: ['tranexamic acid', 'tranexamic'],
    category: 'Brightening',
    function: 'Fades stubborn dark spots and melasma',
    active: true,
  },
  {
    name: 'Kojic Acid',
    aliases: ['kojic acid', 'kojic'],
    category: 'Brightening',
    function: 'Brightens dark spots',
    active: true,
  },
  {
    name: 'Ferulic Acid',
    aliases: ['ferulic acid', 'ferulic'],
    category: 'Antioxidant',
    function: 'Boosts and stabilizes vitamin C and E',
    active: true,
  },
  {
    name: 'Hyaluronic Acid',
    aliases: ['hyaluronic acid', 'sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'hyaluronate'],
    category: 'Humectant',
    function: 'Plumps and hydrates skin by holding in water',
    active: true,
  },
  {
    name: 'Polyglutamic Acid',
    aliases: ['polyglutamic acid', 'sodium polyglutamate'],
    category: 'Humectant',
    function: 'Locks in intense hydration',
    active: true,
  },

  // ── Retinoids ─────────────────────────────────────────────────────────────
  {
    name: 'Retinol',
    aliases: ['retinol'],
    category: 'Retinoid',
    function: 'Speeds up skin renewal to smooth texture and lines',
    active: true,
    concern: 'Irritating when starting; avoid with AHA/BHA on the same night.',
  },
  {
    name: 'Retinal',
    aliases: ['retinal', 'retinaldehyde'],
    category: 'Retinoid',
    function: 'Faster-acting than retinol for smoother skin',
    active: true,
    concern: 'Can irritate sensitive skin.',
  },
  {
    name: 'Retinyl Palmitate',
    aliases: ['retinyl palmitate'],
    category: 'Retinoid',
    function: 'Gently renews skin with minimal irritation',
    active: true,
  },
  {
    name: 'Granactive Retinoid',
    aliases: ['hydroxypinacolone retinoate', 'granactive retinoid'],
    category: 'Retinoid',
    function: 'Renews skin with less irritation',
    active: true,
  },
  {
    name: 'Adapalene',
    aliases: ['adapalene'],
    category: 'Retinoid',
    function: 'Alleviates acne',
    active: true,
    concern: 'Drying; introduce slowly.',
  },
  {
    name: 'Bakuchiol',
    aliases: ['bakuchiol'],
    category: 'Retinoid',
    function: 'Smooths skin, gentler than retinol',
    active: true,
  },

  // ── Vitamin C and derivatives ─────────────────────────────────────────────
  {
    name: 'Vitamin C (L-Ascorbic Acid)',
    aliases: ['ascorbic acid', 'l-ascorbic acid', 'vitamin c'],
    category: 'Vitamin C',
    function: 'Brightens skin, evens tone, and boosts collagen',
    active: true,
    concern: 'Unstable; can sting on sensitive skin.',
  },
  {
    name: 'Sodium Ascorbyl Phosphate',
    aliases: ['sodium ascorbyl phosphate'],
    category: 'Vitamin C',
    function: 'Gently brightens skin and helps with acne',
    active: true,
  },
  {
    name: 'Magnesium Ascorbyl Phosphate',
    aliases: ['magnesium ascorbyl phosphate'],
    category: 'Vitamin C',
    function: 'Brightens and hydrates skin',
    active: true,
  },
  {
    name: 'Tetrahexyldecyl Ascorbate',
    aliases: ['tetrahexyldecyl ascorbate', 'ascorbyl tetraisopalmitate'],
    category: 'Vitamin C',
    function: 'Brightens skin and absorbs deeply',
    active: true,
  },
  {
    name: 'Ethyl Ascorbic Acid',
    aliases: ['ethyl ascorbic acid', '3-o-ethyl ascorbic acid'],
    category: 'Vitamin C',
    function: 'Brightens skin',
    active: true,
  },
  {
    name: 'Ascorbyl Glucoside',
    aliases: ['ascorbyl glucoside'],
    category: 'Vitamin C',
    function: 'Brightens skin gradually over time',
    active: true,
  },

  // ── Other vitamins ────────────────────────────────────────────────────────
  {
    name: 'Niacinamide',
    aliases: ['niacinamide', 'nicotinamide', 'vitamin b3'],
    category: 'Vitamin',
    function: 'Strengthens skin, calms redness, and evens tone',
    active: true,
  },
  {
    name: 'Panthenol',
    aliases: ['panthenol', 'pro-vitamin b5', 'provitamin b5', 'd-panthenol'],
    category: 'Vitamin',
    function: 'Soothes and hydrates while repairing the skin barrier',
    active: true,
  },
  {
    name: 'Tocopherol (Vitamin E)',
    aliases: ['tocopherol', 'tocopheryl acetate', 'vitamin e'],
    category: 'Antioxidant',
    function: 'Protects and conditions skin',
    active: true,
  },

  // ── Antioxidants and extracts ─────────────────────────────────────────────
  {
    name: 'Resveratrol',
    aliases: ['resveratrol'],
    category: 'Antioxidant',
    function: 'Defends skin against environmental damage',
    active: true,
  },
  {
    name: 'Coenzyme Q10',
    aliases: ['ubiquinone', 'coenzyme q10', 'coq10'],
    category: 'Antioxidant',
    function: 'Energizes and protects skin from damage',
    active: true,
  },
  {
    name: 'Green Tea Extract',
    aliases: ['camellia sinensis', 'green tea', 'egcg'],
    category: 'Antioxidant',
    function: 'Calms and protects skin',
    active: true,
  },
  {
    name: 'Alpha Arbutin',
    aliases: ['alpha arbutin', 'arbutin'],
    category: 'Brightening',
    function: 'Gently brightens dark spots',
    active: true,
  },
  {
    name: 'Licorice Root Extract',
    aliases: ['glycyrrhiza glabra', 'licorice', 'liquorice', 'dipotassium glycyrrhizate'],
    category: 'Brightening',
    function: 'Brightens skin and soothes redness',
    active: true,
  },

  // ── Peptides ──────────────────────────────────────────────────────────────
  {
    name: 'Matrixyl (Palmitoyl Pentapeptide)',
    aliases: ['palmitoyl pentapeptide-4', 'palmitoyl oligopeptide', 'matrixyl'],
    category: 'Peptide',
    function: 'Boosts collagen for firmer, smoother skin',
    active: true,
  },
  {
    name: 'Copper Peptide (GHK-Cu)',
    aliases: ['copper tripeptide-1', 'ghk-cu', 'copper peptide'],
    category: 'Peptide',
    function: 'Repairs and firms skin',
    active: true,
  },
  {
    name: 'Argireline (Acetyl Hexapeptide-8)',
    aliases: ['acetyl hexapeptide-8', 'acetyl hexapeptide-3', 'argireline'],
    category: 'Peptide',
    function: 'Softens the look of fine lines',
    active: true,
  },

  // ── Amino acids ───────────────────────────────────────────────────────────
  {
    name: 'Arginine',
    aliases: ['arginine'],
    category: 'Amino Acid',
    function: 'Hydrates and balances pH',
    active: false,
  },
  {
    name: 'Glycine',
    aliases: ['glycine'],
    category: 'Amino Acid',
    function: 'Supports hydration and repair',
    active: false,
  },
  {
    name: 'Proline',
    aliases: ['proline'],
    category: 'Amino Acid',
    function: 'Supports collagen and hydration',
    active: false,
  },
  {
    name: 'Serine',
    aliases: ['serine'],
    category: 'Amino Acid',
    function: 'Helps skin retain natural moisture',
    active: false,
  },

  // ── Ceramides and barrier lipids ──────────────────────────────────────────
  {
    name: 'Ceramides',
    aliases: ['ceramide np', 'ceramide ap', 'ceramide eop', 'ceramide', 'ceramides'],
    category: 'Ceramide',
    function: 'Seals in moisture and strengthens the skin barrier',
    active: true,
  },
  {
    name: 'Cholesterol',
    aliases: ['cholesterol'],
    category: 'Ceramide',
    function: 'Helps restore the skin barrier',
    active: false,
  },

  // ── Humectants ────────────────────────────────────────────────────────────
  {
    name: 'Glycerin',
    aliases: ['glycerin', 'glycerine', 'glycerol'],
    category: 'Humectant',
    function: 'Draws in and holds moisture',
    active: true,
  },
  {
    name: 'Urea',
    aliases: ['urea'],
    category: 'Humectant',
    function: 'Hydrates and gently exfoliates',
    active: true,
  },
  {
    name: 'Betaine',
    aliases: ['betaine'],
    category: 'Humectant',
    function: 'Hydrates and soothes skin',
    active: false,
  },
  {
    name: 'Sodium PCA',
    aliases: ['sodium pca'],
    category: 'Humectant',
    function: 'Helps skin hold onto moisture',
    active: false,
  },
  {
    name: 'Propanediol',
    aliases: ['propanediol', 'propylene glycol', 'butylene glycol'],
    category: 'Humectant',
    function: 'Boosts hydration and helps other ingredients absorb',
    active: false,
  },

  // ── Emollients and occlusives ─────────────────────────────────────────────
  {
    name: 'Squalane',
    aliases: ['squalane', 'squalene'],
    category: 'Emollient',
    function: 'Softens skin without feeling heavy',
    active: true,
  },
  {
    name: 'Shea Butter',
    aliases: ['butyrospermum parkii', 'shea butter'],
    category: 'Emollient',
    function: 'Nourishes and softens dry skin',
    active: false,
  },
  {
    name: 'Jojoba Oil',
    aliases: ['simmondsia chinensis', 'jojoba'],
    category: 'Emollient',
    function: 'Conditions skin without clogging pores',
    active: false,
  },
  {
    name: 'Dimethicone',
    aliases: ['dimethicone', 'cyclopentasiloxane', 'cyclomethicone'],
    category: 'Occlusive',
    function: 'Smooths skin and locks in moisture',
    active: false,
  },
  {
    name: 'Petrolatum',
    aliases: ['petrolatum', 'petroleum jelly', 'paraffinum liquidum'],
    category: 'Occlusive',
    function: 'Seals in moisture to prevent water loss',
    active: false,
  },
  {
    name: 'Mineral Oil',
    aliases: ['mineral oil', 'paraffin oil'],
    category: 'Occlusive',
    function: 'Locks in moisture',
    active: false,
  },

  // ── Soothing agents ───────────────────────────────────────────────────────
  {
    name: 'Centella Asiatica (Cica)',
    aliases: ['centella asiatica', 'cica', 'madecassoside', 'asiaticoside'],
    category: 'Soothing',
    function: 'Calms irritation and repairs the skin barrier',
    active: true,
  },
  {
    name: 'Allantoin',
    aliases: ['allantoin'],
    category: 'Soothing',
    function: 'Soothes and conditions irritated skin',
    active: false,
  },
  {
    name: 'Bisabolol',
    aliases: ['bisabolol'],
    category: 'Soothing',
    function: 'Calms sensitive skin',
    active: false,
  },
  {
    name: 'Colloidal Oatmeal',
    aliases: ['colloidal oatmeal', 'avena sativa', 'oat kernel'],
    category: 'Soothing',
    function: 'Soothes itching and irritation',
    active: true,
  },
  {
    name: 'Aloe Vera',
    aliases: ['aloe barbadensis', 'aloe vera', 'aloe'],
    category: 'Soothing',
    function: 'Soothes and hydrates skin',
    active: false,
  },

  // ── UV filters ────────────────────────────────────────────────────────────
  {
    name: 'Zinc Oxide',
    aliases: ['zinc oxide'],
    category: 'UV Filter',
    function: 'Protects skin from UVA and UVB rays',
    active: true,
  },
  {
    name: 'Titanium Dioxide',
    aliases: ['titanium dioxide'],
    category: 'UV Filter',
    function: 'Protects skin from the sun',
    active: true,
  },
  {
    name: 'Avobenzone',
    aliases: ['avobenzone', 'butyl methoxydibenzoylmethane'],
    category: 'UV Filter',
    function: 'Protects skin from UVA rays',
    active: true,
  },
  {
    name: 'Octinoxate',
    aliases: ['octinoxate', 'ethylhexyl methoxycinnamate'],
    category: 'UV Filter',
    function: 'Protects skin from UVB rays',
    active: true,
  },
  {
    name: 'Tinosorb',
    aliases: ['bis-ethylhexyloxyphenol methoxyphenyl triazine', 'bemotrizinol', 'methylene bis-benzotriazolyl tetramethylbutylphenol'],
    category: 'UV Filter',
    function: 'Protects skin from UVA and UVB rays',
    active: true,
  },

  // ── Surfactants / cleansing ───────────────────────────────────────────────
  {
    name: 'Sodium Laureth Sulfate',
    aliases: ['sodium laureth sulfate', 'sles'],
    category: 'Surfactant',
    function: 'Cleanses and foams — can be drying if overused',
    active: false,
    concern: 'Can be stripping on dry/sensitive skin.',
  },
  {
    name: 'Sodium Lauryl Sulfate',
    aliases: ['sodium lauryl sulfate', 'sls'],
    category: 'Surfactant',
    function: 'Cleanses with a strong foam',
    active: false,
    concern: 'Often irritating/stripping for facial skin.',
  },
  {
    name: 'Cocamidopropyl Betaine',
    aliases: ['cocamidopropyl betaine'],
    category: 'Surfactant',
    function: 'Gently cleanses and softens harsher formulas',
    active: false,
  },
  {
    name: 'Coco-Glucoside',
    aliases: ['coco-glucoside', 'decyl glucoside', 'lauryl glucoside'],
    category: 'Surfactant',
    function: 'Gently cleanses skin',
    active: false,
  },

  // ── Emulsifiers / texture ─────────────────────────────────────────────────
  {
    name: 'Cetearyl Alcohol',
    aliases: ['cetearyl alcohol', 'cetyl alcohol', 'stearyl alcohol'],
    category: 'Emulsifier',
    function: 'Thickens formulas and softens skin',
    active: false,
  },
  {
    name: 'Glyceryl Stearate',
    aliases: ['glyceryl stearate', 'peg-100 stearate'],
    category: 'Emulsifier',
    function: 'Keeps oil and water blended together',
    active: false,
  },

  // ── pH adjusters ──────────────────────────────────────────────────────────
  {
    name: 'Sodium Hydroxide',
    aliases: ['sodium hydroxide'],
    category: 'pH Adjuster',
    function: "Balances the product's pH",
    active: false,
  },

  // ── Preservatives ─────────────────────────────────────────────────────────
  {
    name: 'Phenoxyethanol',
    aliases: ['phenoxyethanol'],
    category: 'Preservative',
    function: 'Keeps the product free from bacteria',
    active: false,
  },
  {
    name: 'Ethylhexylglycerin',
    aliases: ['ethylhexylglycerin'],
    category: 'Preservative',
    function: 'Boosts preservation and lightly conditions skin',
    active: false,
  },
  {
    name: 'Parabens',
    aliases: ['methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben', 'paraben'],
    category: 'Preservative',
    function: 'Prevents the product from spoiling',
    active: false,
  },
  {
    name: 'Potassium Sorbate',
    aliases: ['potassium sorbate', 'sodium benzoate', 'benzoic acid'],
    category: 'Preservative',
    function: 'Keeps the product fresh',
    active: false,
  },

  // ── Fragrance / sensory (caution) ─────────────────────────────────────────
  {
    name: 'Fragrance',
    aliases: ['fragrance', 'parfum', 'aroma'],
    category: 'Fragrance',
    function: 'Adds scent to the product',
    active: false,
    concern: 'Common irritant/allergen, especially on sensitive or compromised skin.',
  },
  {
    name: 'Essential Oils',
    aliases: ['essential oil', 'limonene', 'linalool', 'citral', 'geraniol', 'eugenol'],
    category: 'Fragrance',
    function: 'Adds natural scent from plants',
    active: false,
    concern: 'Fragrance allergens; can irritate reactive skin.',
  },
  {
    name: 'Denatured Alcohol',
    aliases: ['alcohol denat', 'denatured alcohol', 'sd alcohol', 'ethanol'],
    category: 'Solvent',
    function: 'Dries quickly but can dry out skin',
    active: false,
    concern: 'Drying/irritating in high amounts (distinct from fatty alcohols).',
  },
  {
    name: 'Witch Hazel',
    aliases: ['hamamelis virginiana', 'witch hazel'],
    category: 'Soothing',
    function: 'Soothes skin and tightens pores',
    active: false,
    concern: 'Can be drying/sensitizing for some skin.',
  },

  // ── Base / solvent ────────────────────────────────────────────────────────
  {
    name: 'Water',
    aliases: ['aqua', 'water', 'eau'],
    category: 'Solvent',
    function: 'The base of most formulas',
    active: false,
  },
];
