/**
 * Regression guard for the Phase 1 skin-tone fairness fix: sweeps synthetic
 * skin-pixel RGB values across a brightness gradient (light skin in dim
 * light through dark skin in bright light) while holding the underlying hue
 * ratio fixed, and asserts `isSkin()` from `@/lib/skin-classify` accepts a
 * consistent fraction of the sweep instead of dropping off as brightness
 * falls — the exact failure mode the old absolute-luminance-floor classifier
 * had for darker skin tones.
 *
 * Run with: npx tsx scripts/verify-skin-classify-parity.ts
 */
import { isSkin } from '../src/lib/skin-classify';

type Sample = { r: number; g: number; b: number };

/**
 * Generate synthetic "skin-like" RGB samples at a given brightness level.
 * Holds the skin hue ratio roughly fixed (r > g > b, warm cast) while
 * scaling overall brightness down toward zero — this is what a genuinely
 * darker skin tone under otherwise-identical capture conditions looks like
 * in raw RGB, as distinct from underexposure.
 */
function sampleAtBrightness(brightness: number): Sample {
  // Base hue ratio typical of skin in the accepted chrominance band
  // (nr ~0.40, ng ~0.32 => r:g:b roughly 5:4:3).
  const r = Math.round(brightness * 1.25);
  const g = Math.round(brightness * 1.0);
  const b = Math.round(brightness * 0.75);
  return { r: Math.min(255, r), g: Math.min(255, g), b: Math.min(255, b) };
}

function luma({ r, g, b }: Sample): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Brightness buckets spanning very dark to very light skin, in equal steps,
// each represented by many small-noise samples (real pixels aren't perfectly
// uniform even within one person's skin).
const BUCKETS = [40, 70, 100, 130, 160, 190, 220];
const SAMPLES_PER_BUCKET = 200;
const NOISE = 6;

function withNoise(sample: Sample, seed: number): Sample {
  // Deterministic pseudo-noise (no Math.random per repo convention / determinism).
  const jitter = (n: number) => ((seed * 9301 + n * 49297) % 233280) / 233280 - 0.5;
  return {
    r: Math.max(0, Math.min(255, Math.round(sample.r + jitter(1) * NOISE))),
    g: Math.max(0, Math.min(255, Math.round(sample.g + jitter(2) * NOISE))),
    b: Math.max(0, Math.min(255, Math.round(sample.b + jitter(3) * NOISE))),
  };
}

let failed = false;
const acceptRates: { brightness: number; rate: number }[] = [];

for (const brightness of BUCKETS) {
  const base = sampleAtBrightness(brightness);
  let accepted = 0;
  for (let i = 0; i < SAMPLES_PER_BUCKET; i++) {
    const s = withNoise(base, i + brightness);
    if (isSkin(s.r, s.g, s.b, luma(s))) {
      accepted++;
    }
  }
  const rate = accepted / SAMPLES_PER_BUCKET;
  acceptRates.push({ brightness, rate });
}

console.log('Brightness -> skin-pixel accept rate:');
for (const { brightness, rate } of acceptRates) {
  console.log(`  ${brightness.toString().padStart(3)}  ${(rate * 100).toFixed(1)}%`);
}

const rates = acceptRates.map((a) => a.rate);
const minRate = Math.min(...rates);
const maxRate = Math.max(...rates);
const spread = maxRate - minRate;

// A tone-invariant classifier should accept a similar fraction of clean,
// on-hue synthetic skin samples regardless of brightness. A large spread
// (esp. driven by darker buckets scoring far lower) is the exact signature
// of the absolute-luminance-floor bug this fix addresses.
const MAX_ALLOWED_SPREAD = 0.15;
if (spread > MAX_ALLOWED_SPREAD) {
  console.error(
    `FAIL: accept-rate spread across brightness buckets is ${(spread * 100).toFixed(1)}% ` +
      `(max allowed ${(MAX_ALLOWED_SPREAD * 100).toFixed(0)}%) — classifier is brightness-biased.`
  );
  failed = true;
} else {
  console.log(`PASS: accept-rate spread ${(spread * 100).toFixed(1)}% within tolerance.`);
}

// Also assert every bucket clears a reasonable floor — i.e. the classifier
// isn't just uniformly bad, it actually detects skin.
const MIN_ACCEPT_RATE = 0.6;
for (const { brightness, rate } of acceptRates) {
  if (rate < MIN_ACCEPT_RATE) {
    console.error(
      `FAIL: brightness ${brightness} accept rate ${(rate * 100).toFixed(1)}% below floor ${(
        MIN_ACCEPT_RATE * 100
      ).toFixed(0)}%.`
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log('All brightness buckets pass parity + detection-floor checks.');
