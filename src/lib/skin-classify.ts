/**
 * Chrominance-based skin test: normalize away overall brightness (`r/sum`,
 * `g/sum`) before judging hue, so the same rule applies whether the frame is
 * a dark-skinned face in bright light or a light-skinned face in dim light —
 * their hue RATIO can match even though their absolute RGB values don't. An
 * absolute-floor rule (`r>50`, `lum>40`) scales with brightness rather than
 * hue, so it silently doubles as a brightness gate that penalizes darker
 * skin. The luminance check here is only a loose sanity bound (reject true
 * sensor black/white clipping), not a skin-tone floor.
 *
 * The saturation check is normalized (`chroma/sum`), not absolute, for the
 * same reason: an absolute `max-min` floor shrinks toward zero as brightness
 * drops for any fixed hue, so it would silently reintroduce a brightness-
 * dependent floor at the low end (rejecting genuinely-colored dark skin as
 * "too gray" well before it's actually gray).
 *
 * Single source of truth for both capture-time validation (`scan-calibration.*`)
 * and scoring (`scan-image.*`) on both platforms — they must never diverge.
 */
export function isSkin(r: number, g: number, b: number, lum: number): boolean {
  const sum = r + g + b;
  if (sum < 20 || lum > 250) return false;
  const nr = r / sum;
  const ng = g / sum;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = (max - min) / sum;
  // Range widened per Sean's feedback, twice (2026-07-16, then further on
  // 2026-07-26) — real faces under warm/cool indoor lighting kept falling
  // outside the band. Still normalized (tone-invariant), so this doesn't
  // reintroduce a brightness bias.
  return nr > 0.30 && nr < 0.53 && ng > 0.21 && ng < 0.47 && nr > ng && saturation > 0.01;
}
